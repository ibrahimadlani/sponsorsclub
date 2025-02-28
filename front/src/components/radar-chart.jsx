"use client";

import { TrendingUp } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

/**
 * Données des notes sur 10 pour évaluer la qualité des plateformes et performances.
 */
const chartData = [
  { category: "Performances", score: 7 },
  { category: "TikTok", score: 6 },
  { category: "Facebook", score: 5 },
  { category: "Instagram", score: 7 },
  { category: "Press", score: 8 },
  { category: "Rep.", score: 6 },

];

/**
 * Configuration du graphique
 */
const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
};

/**
 * RadarChartComponent - Affiche un radar chart avec les notes d'évaluation.
 */
export default function RadarChartComponent() {
  return (



    <div className="flex flex-col w-full p-4">
      {/* Header Section: Displays the chart title and description */}
      {/* <div className="flex flex-col items-center h-1/6">
        <CardTitle className="text-sm leading-3">Notation General</CardTitle>
        <CardDescription className="text-xs leading-3 text-pink-500 font-semibold">
          PREMIUM DATA
        </CardDescription>
      </div> */}

      {/* Chart Container: Ensures the chart occupies the full available height */}
      <div className=" flex-1 h-full">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart
            data={chartData}
            outerRadius={80}
            margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <PolarGrid />
            <PolarAngleAxis
              dataKey="category"
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Radar dataKey="score" fill="#db2777" fillOpacity={0.6} stroke="#db2777" />
          </RadarChart>
        </ChartContainer>
      </div>
    </div>

  );
}