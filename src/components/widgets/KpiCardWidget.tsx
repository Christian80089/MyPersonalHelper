"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { ArrowUpIcon } from "lucide-react";
import Badge from "../ui/badge/Badge";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

type KpiCardWidgetProps = {
  title: string;
  value: string;              // es. "€12.4k"
  subtitle?: string;          // es. "Last 30 days"

  percent?: number;           // 0..100 (per il gauge)
  trendLabel?: string;        // es. "11.01%"

  // Cosa mostrare al centro del gauge
  gaugeCenter?: "percent" | "value";
};

function clamp01to100(n: number) {
  return Math.max(0, Math.min(100, n));
}

function gaugeColor(p: number) {
  // <50 warning, <80 brand, >=80 success (modifica come vuoi)
  if (p < 50) return "#F79009"; // warning-500
  if (p < 80) return "#465FFF"; // brand-500
  return "#12B76A";             // success-500
}

export function KpiCardWidget(props: KpiCardWidgetProps) {
  const percent = clamp01to100(props.percent ?? 72);
  const color = gaugeColor(percent);

  const series = useMemo(() => [percent], [percent]);

  const options: ApexOptions = useMemo(() => {
    return {
      chart: {
        type: "radialBar",
        height: "100%",
        sparkline: { enabled: true },
        redrawOnParentResize: true,
        redrawOnWindowResize: true,
      },
      colors: [color],
      stroke: { lineCap: "round" },
      plotOptions: {
        radialBar: {
          hollow: { size: "70%" },
          track: { background: "rgba(148, 163, 184, 0.25)" },
          dataLabels: {
            name: { show: false },
            value: {
              show: true,
              fontFamily: "Outfit, sans-serif",
              fontSize: "16px",
              fontWeight: 800,
              offsetY: 6,
              formatter: () => {
                // Centro gauge: percentuale o valore (stringa)
                if (props.gaugeCenter === "value") return props.value;
                return `${Math.round(percent)}%`;
              },
            },
          },
        },
      },
    };
  }, [color, percent, props.gaugeCenter, props.value]);

  return (
    <div className="h-full w-full min-w-0">
      <div className="flex h-full min-w-0 flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
              {props.title}
            </div>

            {/* Valore “business” sempre visibile nella card */}
            <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-2">
              <div className="min-w-0 truncate text-title-sm font-bold leading-tight text-gray-800 dark:text-white/90">
                {props.value}
              </div>

              {(
                <Badge color="success">
                  <ArrowUpIcon />
                  50.23%
                </Badge>
              )}
            </div>

            {props.subtitle && (
              <div className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                {props.subtitle}
              </div>
            )}
          </div>

          {/* Gauge */}
          <div className="h-16 w-16 shrink-0">
            <ReactApexChart options={options} series={series} type="radialBar" height="100%" width="100%" />
          </div>
        </div>
      </div>
    </div>
  );
}
