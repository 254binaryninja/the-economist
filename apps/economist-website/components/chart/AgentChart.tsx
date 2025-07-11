"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
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

  // Generate chart config based on the data keys
  const chartConfig: ChartConfig = {
    [yKey]: {
      label:
        yKey.charAt(0).toUpperCase() + yKey.slice(1).replace(/([A-Z])/g, " $1"),
      color: "hsl(var(--chart-1))",
    },
  };

  // For pie charts, we might want to use the xKey as the label
  if (type === "pie") {
    chartConfig[xKey] = {
      label:
        xKey.charAt(0).toUpperCase() + xKey.slice(1).replace(/([A-Z])/g, " $1"),
      color: "hsl(var(--chart-2))",
    };
  }

  // Generate colors for pie chart
  const pieColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  // Ensure data is properly formatted
  const formattedData = data.map((item) => ({
    ...item,
    [yKey]:
      typeof item[yKey] === "string" ? parseFloat(item[yKey]) || 0 : item[yKey],
  }));

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  return (
    //@ts-ignore
    <ChartContainer config={chartConfig}>
      {type === "bar" && (
        <BarChart data={formattedData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar
            dataKey={yKey}
            fill={chartConfig[yKey]?.color || "hsl(var(--chart-1))"}
            radius={8}
          />
        </BarChart>
      )}

      {type === "line" && (
        <LineChart data={formattedData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey={yKey}
            type="monotone"
            stroke={chartConfig[yKey]?.color || "hsl(var(--chart-1))"}
            strokeWidth={2}
            dot={{
              fill: chartConfig[yKey]?.color || "hsl(var(--chart-1))",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      )}

      {type === "area" && (
        <AreaChart data={formattedData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Area
            dataKey={yKey}
            type="natural"
            fill={chartConfig[yKey]?.color || "hsl(var(--chart-1))"}
            fillOpacity={0.4}
            stroke={chartConfig[yKey]?.color || "hsl(var(--chart-1))"}
            stackId="a"
          />
        </AreaChart>
      )}

      {type === "pie" && (
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie
            data={formattedData}
            dataKey={yKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={pieColors[index % pieColors.length]}
              />
            ))}
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey={xKey} />}
            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
          />
        </PieChart>
      )}
    </ChartContainer>
  );
}
