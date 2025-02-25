"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
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
  { month: "January", tiktok: 32, instagram: 42 },
  { month: "February", tiktok: 52, instagram: 78 },
  { month: "March", tiktok: 132, instagram: 190 },
  { month: "April", tiktok: 190, instagram: 280 },
  { month: "May", tiktok: 321, instagram: 548 },
  { month: "June", tiktok: 1123, instagram: 1502 },
];

/**
 * Chart configuration specifying labels and colors for desktop and mobile data.
 */
const chartConfig = {
  tiktok: {
    label: "TikTok",
    color: "hsl(var(--chart-1))",
  },
  instagram: {
    label: "Instagram",
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
    <div className="flex flex-col gap-6 w-full h-52 p-4">
      {/* Header Section: Displays the chart title and description */}
      <div className="flex flex-col items-start h-1/6">
        <CardTitle className="text-sm leading-3">Follower Base Growth</CardTitle>
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
            {/* Axe des Y (ajouté ici) */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="tiktok" fill="#db2777" radius={4} />
            <Bar
              dataKey="instagram"
              fill="rgba(219,39,119,0.5)"  // couleur pink-600 avec alpha réduit
              stroke="#db2777"           // bordure en pink-600
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
}