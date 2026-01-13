"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const series = [400, 300, 200];
const labels = ["Organic", "Ads", "Referral"];
const colors: string[] = ["#2563eb", "#22c55e", "#f59e0b"];

export function PieChartWidget() {
  const options: ApexOptions = useMemo(() => {
    return {
      chart: {
        type: "donut",
        height: "100%",
        redrawOnParentResize: true,
        redrawOnWindowResize: true,
        toolbar: { show: false },
      },
      labels,
      colors,
      legend: {
        show: true,
        position: "bottom",
        fontFamily: "Outfit, sans-serif",
        fontSize: "12px",
      },
      stroke: { width: 0 },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "72%",
            labels: {
              show: true,
              name: {
                show: true,
                fontFamily: "Outfit, sans-serif",
                fontSize: "12px",
                offsetY: -2,
              },
              value: {
                show: true,
                fontFamily: "Outfit, sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                offsetY: 2,
                formatter: (val) => {
                  const n = typeof val === "string" ? Number(val) : val;
                  return Number.isFinite(n) ? n.toLocaleString() : String(val);
                },
              },
              total: {
                show: true,
                showAlways: true,
                label: "Total",
                fontFamily: "Outfit, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                formatter: (w) => {
                  const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return total.toLocaleString();
                },
              },
            },
          },
        },
      },
      tooltip: { shared: false },
      responsive: [
        {
          breakpoint: 520,
          options: {
            legend: { position: "bottom", fontSize: "11px" },
            plotOptions: {
              pie: {
                donut: {
                  size: "68%",
                  labels: {
                    value: { fontSize: "18px" },
                  },
                },
              },
            },
          },
        },
      ],
    };
  }, []);

  return (
    <div className="h-full w-full min-w-0 overflow-hidden">
      <ReactApexChart options={options} series={series} type="donut" width="100%" height="100%" />
    </div>
  );
}
