"use client";

import React, { useCallback, useMemo, useState } from "react";
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
    render: () => (
      <KpiCardWidget title="Revenue" value="€12.4k" subtitle="Last 30 days" />
    ),
  },
  { type: "barChart", label: "Bar Chart", defaultSize: { w: 12, h: 6 }, render: () => <BarChartWidget /> },
  { type: "lineChart", label: "Line Chart", defaultSize: { w: 12, h: 9 }, render: () => <LineChartWidget /> },
  { type: "pieChart", label: "Pie Chart", defaultSize: { w: 6, h: 8 }, render: () => <PieChartWidget /> },
];

type BP = "lg" | "md" | "sm" | "xs" | "xxs";

const breakpoints: Record<BP, number> = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const colsByBp: Record<BP, number> = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

// Stack verticale: forza 1 colonna a un certo breakpoint
function stackLayout(layout: Layout, targetCols: number): Layout {
  const sorted = [...layout].sort((a, b) => (a.y - b.y) || (a.x - b.x));
  let y = 0;

  return sorted.map((it): Layout[number] => {
    const h = it.h ?? 6;
    const out: LayoutItem = { ...it, x: 0, y, w: targetCols };
    y += h;
    return out;
  });
}

function ensureAllBreakpoints(
  base?: Partial<Record<BP, Layout>>
): Record<BP, Layout> {
  return {
    lg: base?.lg ?? [],
    md: base?.md ?? [],
    sm: base?.sm ?? [],
    xs: base?.xs ?? [],
    xxs: base?.xxs ?? [],
  };
}

function deriveFromLg(lg: Layout): ResponsiveLayouts {
  return {
    lg,
    md: [...lg],
    sm: [...lg],
    xs: stackLayout(lg, colsByBp.xs),
    xxs: stackLayout(lg, colsByBp.xxs),
  };
}

export default function DashboardBuilder(props: {
  initialWidgets?: Widget[];
  initialLayouts?: ResponsiveLayouts;
  editable?: boolean;
}) {
  const editable = props.editable ?? true;

  const [widgets, setWidgets] = useState<Widget[]>(props.initialWidgets ?? []);

  // Width (v2: required) [page:1]
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
    initialWidth: 1280,
  });

  // Responsive state handled by hook (v2 API) [page:1]
  const {
    layout, // layout corrente (breakpoint attivo)
    layouts, // tutte le layouts by bp
    breakpoint,
    cols,
    setLayouts,
    setLayoutForBreakpoint,
  } = useResponsiveLayout<BP>({
    width,
    breakpoints,
    cols: colsByBp,
    layouts: ensureAllBreakpoints(props.initialLayouts ?? { lg: [] }),
    onLayoutChange: (nextLayout, all) => {
      // Se vuoi persistere, puoi salvare `all` qui (localStorage/api)
      // Nota: callback read-only; non mutare `nextLayout`/`all` direttamente. [page:1]
      void nextLayout;
      void all;
    },
  });

  const addWidget = useCallback((type: WidgetType) => {
    const meta = WIDGET_CATALOG.find((x) => x.type === type);
    if (!meta) return;

    const id = `w_${type}_${crypto.randomUUID()}`;
    setWidgets((prev) => [...prev, { id, type }]);

    const current = ensureAllBreakpoints(layouts as Partial<Record<BP, Layout>>);

    // clona TUTTO senza toccare le posizioni esistenti
    const next = { ...current };

    // aggiungi SOLO al breakpoint corrente
    next[breakpoint] = [
      ...next[breakpoint],
      { i: id, x: 0, y: Infinity, w: meta.defaultSize.w, h: meta.defaultSize.h },
    ];

    setLayouts(next);
  }, [layouts, setLayouts, breakpoint]);

  const removeWidget = useCallback((id: string) => {
  setWidgets((prev) => prev.filter((w) => w.id !== id));

  const current = ensureAllBreakpoints(layouts as Partial<Record<BP, Layout>>);
  const lg = current.lg.filter((x) => x.i !== id);

  setLayouts(deriveFromLg(lg));
}, [layouts, setLayouts]);

  const clearDashboard = useCallback(() => {
    setWidgets([]);
    setLayouts({ lg: [], md: [], sm: [], xs: [], xxs: [] });
  }, [setLayouts]);

  const children = useMemo(() => {
    return widgets.map((w) => {
      const def = WIDGET_CATALOG.find((d) => d.type === w.type);

      return (
        <div
          key={w.id}
          className="group relative h-full rounded-2xl border border-gray-200/70 bg-white shadow-theme-xs ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-theme-sm hover:ring-gray-200 dark:border-gray-800/80 dark:bg-gray-dark dark:hover:ring-gray-700"
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

          <div className="h-[calc(100%-52px)] min-w-0 overflow-hidden py-4">
            {def ? def.render(w) : null}
          </div>
        </div>
      );
    });
  }, [widgets, editable, removeWidget]);

  return (
    <div ref={containerRef} className="space-y-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/20">
      {editable && (
        <div className="flex flex-wrap items-center gap-2">
          {WIDGET_CATALOG.map((w) => (
            <button
              key={w.type}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200/70 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs transition active:scale-[0.98] hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 dark:border-gray-800/80 dark:bg-gray-dark dark:text-gray-200 dark:hover:bg-gray-900/60"
              onClick={() => addWidget(w.type)}
            >
              Add {w.label}
            </button>
          ))}

          <button
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200/70 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs transition active:scale-[0.98] hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 dark:border-gray-800/80 dark:bg-gray-dark dark:text-gray-200 dark:hover:bg-gray-900/60"
            onClick={() => {
              localStorage.setItem("ecom_layouts", JSON.stringify(layouts));
              localStorage.setItem("ecom_widgets", JSON.stringify(widgets));
            }}
          >
            Save layout ({breakpoint}, {cols} cols)
          </button>

          <button
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200/70 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-theme-xs transition active:scale-[0.98] hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/15 dark:border-gray-800/80 dark:bg-gray-dark dark:text-gray-200 dark:hover:bg-gray-900/60"
            onClick={clearDashboard}
          >
            Clear dashboard
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
              layout={layout} // layout del breakpoint corrente [page:1]
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
                // Aggiorna SOLO il layout del breakpoint corrente
                // (hook ti espone setter dedicato) [page:1]
                setLayoutForBreakpoint(breakpoint, nextLayout);

                // Opzionale: se vuoi xs/xxs sempre stackati dal lg
                // puoi farlo qui quando breakpoint === 'lg' (stessa logica di prima).
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
