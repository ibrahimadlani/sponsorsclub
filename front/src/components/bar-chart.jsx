"use client";

import { 
    Bar,
    BarChart,
    CartesianGrid,
    XAxis
} from "recharts";
import {
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

/**
 * Sample chart data representing monthly follower growth on desktop and mobile platforms.
 */
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

/**
 * Chart configuration specifying labels and colors for desktop and mobile data.
 */
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

/**
 * FollowerGrowthChart Component
 *
 * Renders a bar chart displaying follower growth over the last six months.
 * The chart distinguishes between desktop and mobile data using different colors.
 *
 * @returns {JSX.Element} The rendered chart component.
 */
export default function FollowerGrowthChart() {
  return (
    <div className="flex flex-col gap-6 w-full h-full p-4">
      {/* Header Section: Displays the chart title and description */}
      <div className="flex flex-col items-start h-1/6">
        <CardTitle className="text-sm leading-3">Follower Growth</CardTitle>
        <CardDescription className="text-xs leading-3">
          Last six months
        </CardDescription>
      </div>

      {/* Chart Container: Ensures the chart occupies the full available height */}
      <div className="w-full flex-1 h-full">
        <ChartContainer className="w-full h-full" config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}