"use client";

import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import {
  BarChart, Bar, LineChart, Line,
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

interface ChartProps {
  chart: {
    type: "bar" | "line" | "area" | "pie";
    xKey: string;
    yKey: string;
    data: Record<string, any>[];
  };
}

export function AgentChart({ chart }: ChartProps) {
  const { type, xKey, yKey, data } = chart;
  // Generate chart config based on the yKey
  const chartConfig: ChartConfig = {
    [yKey]: {
      label: yKey.charAt(0).toUpperCase() + yKey.slice(1),
      color: "hsl(var(--chart-1))",
    },
  };

  // Generate colors for pie chart
  const pieColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <ChartTooltip content={<ChartTooltipContent />} />
    </>
  );
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      {type === "bar" ? (
        <BarChart data={data}>
          {common}
          <Bar dataKey={yKey} fill={`var(--color-${yKey})`} />
          <ChartLegend content={<ChartLegendContent />} />
        </BarChart>
      ) : type === "line" ? (
        <LineChart data={data}>
          {common}
          <Line dataKey={yKey} stroke={`var(--color-${yKey})`} strokeWidth={2} />
          <ChartLegend content={<ChartLegendContent />} />
        </LineChart>
      ) : type === "area" ? (
        <AreaChart data={data}>
          {common}
          <Area dataKey={yKey} stroke={`var(--color-${yKey})`} fill={`var(--color-${yKey})`} />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      ) : type === "pie" ? (
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Pie
            data={data}
            dataKey={yKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill={`var(--color-${yKey})`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <ChartLegend content={<ChartLegendContent />} />
        </PieChart>
      ) : (
        <></>
      )}
    </ChartContainer>
  );
}
