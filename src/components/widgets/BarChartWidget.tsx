"use client";

import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useAggregateSumByDate } from "@/hooks/useAggregateSumByDate";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface BarChartProps {
  table_name: string;
  date_column: string;
  sum_column: string;
  granularity?: 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  options?: ApexOptions;
}

export function BarChartWidget({
  table_name,
  date_column,
  sum_column,
  granularity = 'monthly',
  start_date,
  end_date,
  options: externalOptions,
}: BarChartProps) {
  const { data: aggregateData, isLoading } = useAggregateSumByDate({
    table_name,
    date_column,
    sum_column,
    granularity,
    start_date,
    end_date,
  });

  const chartSeries = aggregateData ? [{
    name: "Sales",
    data: aggregateData.map(row => row.total_sum),
  }] : undefined;

  const chartCategories = aggregateData ? aggregateData.map(row => row.period) : undefined;

  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toFixed(0);
  };

  const defaultOptions: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 180,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        formatter: function (value: number) {
          return formatNumber(value);
        },
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      enabled: true,
      followCursor: true,
      intersect: false,
      x: { show: false },
      y: {
        formatter: (val: number) => formatNumber(val),
      },
    },
    ...(chartCategories && { 
      xaxis: {
        categories: chartCategories,
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      } 
    }),
  };

  const finalOptions: ApexOptions = { ...defaultOptions, ...externalOptions };

  if (isLoading) {
    return <div className="h-[180px] flex items-center justify-center">Loading chart...</div>;
  }

  return (
    <div className="max-w-full overflow-x-auto no-scrollbar">
      <div id="chartOne">
        <ReactApexChart
          options={finalOptions}
          series={chartSeries || []}
          type="bar"
          height={180}
        />
      </div>
    </div>
  );
}
