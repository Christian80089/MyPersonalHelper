"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactGridLayout, {
  useContainerWidth,
  useResponsiveLayout,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { KpiCardWidget } from "@/components/widgets/KpiCardWidget";
import { BarChartWidget } from "@/components/widgets/BarChartWidget";
import { LineChartWidget } from "@/components/widgets/LineChartWidget";
import { PieChartWidget } from "@/components/widgets/PieChartWidget";

type WidgetType = "kpiCard" | "barChart" | "lineChart" | "pieChart";

type Widget = {
  id: string;
  type: WidgetType;
  title?: string;
  config?: Record<string, unknown>;
};

type WidgetDef = {
  type: WidgetType;
  label: string;
  defaultSize: { w: number; h: number };
  render: (w: Widget) => React.ReactNode;
};

const WIDGET_CATALOG: WidgetDef[] = [
  {
    type: "kpiCard",
    label: "Card",
    defaultSize: { w: 6, h: 6 },
    render: () => <KpiCardWidget title="Revenue" value="€12.4k" subtitle="Last 30 days" />,
  },
  { type: "barChart", label: "Bar Chart", defaultSize: { w: 12, h: 6 }, render: () => <BarChartWidget /> },
  { type: "lineChart", label: "Line Chart", defaultSize: { w: 12, h: 9 }, render: () => <LineChartWidget /> },
  { type: "pieChart", label: "Pie Chart", defaultSize: { w: 6, h: 8 }, render: () => <PieChartWidget /> },
];

type BP = "lg" | "md" | "sm" | "xs" | "xxs";

const breakpoints: Record<BP, number> = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const colsByBp: Record<BP, number> = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

// -------- layout helpers --------

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

function stackLayout(layout: Layout, targetCols: number): Layout {
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
  let y = 0;

  return sorted.map((it) => {
    const h = it.h ?? 6;
    const out: LayoutItem = { ...it, x: 0, y, w: targetCols };
    y += h;
    return out;
  });
}

/**
 * Scaling automatico: converte un layout definito su `fromCols` in un layout su `toCols`.
 * - scala x e w in proporzione
 * - clamp per evitare overflow
 * - mantiene y/h (la verticalità resta coerente)
 */
function scaleLayoutCols(input: Layout, fromCols: number, toCols: number): Layout {
  if (fromCols === toCols) return input.map((it) => ({ ...it }));

  const ratio = toCols / fromCols;

  return input.map((it) => {
    const w = clamp(Math.round((it.w ?? 1) * ratio), 1, toCols);
    const x = clamp(Math.round((it.x ?? 0) * ratio), 0, Math.max(0, toCols - w));
    return { ...it, x, w };
  });
}

/**
 * Regola: xs/xxs sempre stackati dal lg (mobile semplice e leggibile).
 * lg/md/sm invece possono essere indipendenti.
 */
function rebuildMobileFromLg(all: ResponsiveLayouts): ResponsiveLayouts {
  const lg = all.lg ?? [];
  return {
    ...all,
    xs: stackLayout(lg, colsByBp.xs),
    xxs: stackLayout(lg, colsByBp.xxs),
  };
}

function hasMeaningfulLayout(l?: Layout) {
  return Array.isArray(l) && l.length > 0;
}

// -------- persistence helpers --------

const LS_KEYS = {
  layouts: "ecom_layouts_v1",
  widgets: "ecom_widgets_v1",
};

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

// -------- component --------

export default function DashboardBuilder(props: {
  initialWidgets?: Widget[];
  initialLayouts?: ResponsiveLayouts;
  editable?: boolean;
}) {
  const editable = props.editable ?? true;

  // 1) Initial state: prova a caricare da localStorage (solo client)
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    const saved = safeParse<Widget[]>(typeof window !== "undefined" ? localStorage.getItem(LS_KEYS.widgets) : null);
    return saved ?? props.initialWidgets ?? [];
  });

  const initialLayouts = useMemo<ResponsiveLayouts>(() => {
    const saved = safeParse<ResponsiveLayouts>(typeof window !== "undefined" ? localStorage.getItem(LS_KEYS.layouts) : null);
    // IMPORTANT: lascia md/sm vuoti/assenti se non ci sono, così possiamo auto-generarli on-demand
    return saved ?? props.initialLayouts ?? { lg: [] };
  }, [props.initialLayouts]);

  // Width + robust measure (ResizeObserver + “rinforzo”)
  const { width, containerRef, mounted, measureWidth } = useContainerWidth({
    measureBeforeMount: true,
    initialWidth: 1280,
  });

  useEffect(() => {
    const onResize = () => measureWidth();
    const onVisibility = () => {
      if (document.visibilityState === "visible") measureWidth();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [measureWidth]);

  // Hook responsive
  const { layout, layouts, breakpoint, cols, setLayouts, setLayoutForBreakpoint } = useResponsiveLayout<BP>({
    width,
    breakpoints,
    cols: colsByBp,
    layouts: initialLayouts,
  });

  // 2) Auto-genera md/sm quando ci entri (scaling da lg) — UNA SOLA VOLTA
  const generatedRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!mounted) return;

    // non generare per xs/xxs: lì scegliamo stack fisso dal lg
    if (breakpoint === "xs" || breakpoint === "xxs" || breakpoint === "lg") return;

    const key = `gen:${breakpoint}`;
    if (generatedRef.current[key]) return;

    const current = layouts as ResponsiveLayouts;
    if (hasMeaningfulLayout(current[breakpoint])) return;

    const base = current.lg ?? [];
    if (!hasMeaningfulLayout(base)) return;
    const scaled = scaleLayoutCols(base, colsByBp.lg, colsByBp[breakpoint]);

    generatedRef.current[key] = true;
    setLayouts({ ...current, [breakpoint]: scaled });
  }, [breakpoint, layouts, mounted, setLayouts]);

  // 3) Mantieni xs/xxs stackati dal lg (ogni volta che cambia lg)
  const lastLgHashRef = useRef<string>("");

  useEffect(() => {
    if (!mounted) return;

    const current = layouts as ResponsiveLayouts;
    const lg = current.lg ?? [];
    const hash = JSON.stringify(lg);

    if (hash === lastLgHashRef.current) return;
    lastLgHashRef.current = hash;

    setLayouts(rebuildMobileFromLg(current));
  }, [layouts, mounted, setLayouts]);

  // 4) Add/remove widget: aggiorna tutti i breakpoint “desktop” se presenti, ma senza reset manuale
  const addWidget = useCallback(
    (type: WidgetType) => {
      const meta = WIDGET_CATALOG.find((x) => x.type === type);
      if (!meta) return;

      const id = `w_${type}_${crypto.randomUUID()}`;
      setWidgets((prev) => [...prev, { id, type }]);

      const current = (layouts as ResponsiveLayouts) ?? { lg: [] };

      const next: ResponsiveLayouts = { ...current };

      // sempre nel lg
      next.lg = [...(current.lg ?? []), { i: id, x: 0, y: Infinity, w: meta.defaultSize.w, h: meta.defaultSize.h }];

      // se md/sm esistono già (o sono stati generati), aggiungi anche lì con scaling delle cols
      (["md", "sm"] as const).forEach((bp) => {
        if (!current[bp]) return; // se manca, verrà generato quando entri in quel breakpoint
        const w = clamp(meta.defaultSize.w, 1, colsByBp[bp]);
        next[bp] = [...(current[bp] ?? []), { i: id, x: 0, y: Infinity, w, h: meta.defaultSize.h }];
      });

      setLayouts(rebuildMobileFromLg(next));
    },
    [layouts, setLayouts]
  );

  const removeWidget = useCallback(
    (id: string) => {
      setWidgets((prev) => prev.filter((w) => w.id !== id));

      const current = (layouts as ResponsiveLayouts) ?? { lg: [] };
      const next: ResponsiveLayouts = { ...current };

      (Object.keys(current) as BP[]).forEach((bp) => {
        next[bp] = (current[bp] ?? []).filter((x) => x.i !== id);
      });

      setLayouts(rebuildMobileFromLg(next));
    },
    [layouts, setLayouts]
  );

  // 5) Salvataggio automatico (debounce semplice)
  useEffect(() => {
    if (!mounted) return;

    const t = window.setTimeout(() => {
      localStorage.setItem(LS_KEYS.layouts, JSON.stringify(layouts));
      localStorage.setItem(LS_KEYS.widgets, JSON.stringify(widgets));
    }, 250);

    return () => window.clearTimeout(t);
  }, [layouts, widgets, mounted]);

  const clearDashboard = useCallback(() => {
    setWidgets([]);
    setLayouts({ lg: [] });
    localStorage.removeItem(LS_KEYS.layouts);
    localStorage.removeItem(LS_KEYS.widgets);
  }, [setLayouts]);

  const children = useMemo(() => {
    return widgets.map((w) => {
      const def = WIDGET_CATALOG.find((d) => d.type === w.type);

      return (
        <div
          key={w.id}
          className="group relative h-full overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-theme-xs ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-theme-sm hover:ring-gray-200 dark:border-gray-800/80 dark:bg-gray-dark dark:hover:ring-gray-700"
        >
          <div className="flex items-center justify-between gap-3 border-b border-gray-100/80 px-4 py-3 dark:border-gray-800/70">
            <div
              className={
                editable
                  ? "handle cursor-grab select-none text-sm font-semibold tracking-tight text-gray-900 active:cursor-grabbing dark:text-white"
                  : "text-sm font-semibold tracking-tight text-gray-900 dark:text-white"
              }
            >
              {w.title ?? def?.label ?? w.type}
            </div>

            {editable && (
              <button
                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-error-600 transition hover:bg-error-50 hover:text-error-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-500/15 dark:hover:bg-white/5"
                onClick={() => removeWidget(w.id)}
              >
                Remove
              </button>
            )}
          </div>

          <div className="h-[calc(100%-52px)] min-w-0 overflow-hidden p-4">{def ? def.render(w) : null}</div>
        </div>
      );
    });
  }, [widgets, editable, removeWidget]);

  return (
    <div ref={containerRef} className="space-y-4 p-2">
      {editable && (
        <div className="flex flex-wrap items-center gap-2">
          {WIDGET_CATALOG.map((w) => (
            <button
              key={w.type}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200/70 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 dark:border-gray-800/80 dark:bg-gray-dark dark:text-gray-200 dark:hover:bg-gray-900/60"
              onClick={() => addWidget(w.type)}
            >
              Add {w.label}
            </button>
          ))}

          <button
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200/70 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 dark:border-gray-800/80 dark:bg-gray-dark dark:text-gray-200 dark:hover:bg-gray-900/60"
            onClick={clearDashboard}
          >
            Clear dashboard ({breakpoint}, {cols} cols)
          </button>
        </div>
      )}

      {widgets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300/80 bg-white/40 p-10 text-center text-sm text-gray-600 backdrop-blur-sm dark:border-gray-700/80 dark:bg-gray-dark/40 dark:text-gray-300">
          Nessun widget. Usa i pulsanti “Add …” per aggiungerne uno.
        </div>
      ) : (
        <div className="w-full min-h-[400px] rounded-2xl">
          {mounted && (
            <ReactGridLayout
              width={width}
              layout={layout}
              gridConfig={{
                cols,
                rowHeight: 30,
                margin: [16, 16],
              }}
              dragConfig={{
                enabled: editable,
                handle: ".handle",
              }}
              resizeConfig={{
                enabled: editable,
                handles: ["se"],
              }}
              onLayoutChange={(nextLayout) => {
                // aggiorna solo breakpoint corrente: indipendenza garantita [page:4]
                setLayoutForBreakpoint(breakpoint, nextLayout);
              }}
            >
              {children}
            </ReactGridLayout>
          )}
        </div>
      )}
    </div>
  );
}
