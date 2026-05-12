"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts";
import { Download, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PlotType = "line" | "area" | "bar" | "scatter";

export interface PlotData {
  data: Array<Record<string, number>>;
  xKey: string;
  yKeys: string[];
  title: string;
  type: PlotType;
}

interface PlotPanelProps {
  plots: PlotData[];
  onClear: () => void;
}

const COLORS = [
  "oklch(0.7 0.18 180)",
  "oklch(0.65 0.2 30)",
  "oklch(0.6 0.15 280)",
  "oklch(0.7 0.15 120)",
  "oklch(0.65 0.18 330)",
];

function PlotRenderer({ plot }: { plot: PlotData }) {
  const commonProps = {
    data: plot.data,
    margin: { top: 10, right: 30, left: 0, bottom: 0 },
  };

  const renderLines = () =>
    plot.yKeys.map((key, idx) => (
      <Line
        key={key}
        type="monotone"
        dataKey={key}
        stroke={COLORS[idx % COLORS.length]}
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 4, fill: COLORS[idx % COLORS.length] }}
      />
    ));

  const renderAreas = () =>
    plot.yKeys.map((key, idx) => (
      <Area
        key={key}
        type="monotone"
        dataKey={key}
        stroke={COLORS[idx % COLORS.length]}
        fill={COLORS[idx % COLORS.length]}
        fillOpacity={0.3}
        strokeWidth={2}
      />
    ));

  const renderBars = () =>
    plot.yKeys.map((key, idx) => (
      <Bar
        key={key}
        dataKey={key}
        fill={COLORS[idx % COLORS.length]}
        radius={[4, 4, 0, 0]}
      />
    ));

  const renderScatters = () =>
    plot.yKeys.map((key, idx) => (
      <Scatter
        key={key}
        dataKey={key}
        fill={COLORS[idx % COLORS.length]}
        name={key}
      />
    ));

  const gridAndAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 260)" />
      <XAxis
        dataKey={plot.xKey}
        stroke="oklch(0.5 0 0)"
        tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
      />
      <YAxis
        stroke="oklch(0.5 0 0)"
        tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }}
      />
      <Tooltip
        contentStyle={{
          backgroundColor: "oklch(0.16 0.02 260)",
          border: "1px solid oklch(0.28 0.02 260)",
          borderRadius: "8px",
          color: "oklch(0.95 0 0)",
        }}
      />
      <Legend
        wrapperStyle={{ fontSize: 12, color: "oklch(0.65 0 0)" }}
      />
    </>
  );

  switch (plot.type) {
    case "area":
      return (
        <AreaChart {...commonProps}>
          {gridAndAxes}
          {renderAreas()}
        </AreaChart>
      );
    case "bar":
      return (
        <BarChart {...commonProps}>
          {gridAndAxes}
          {renderBars()}
        </BarChart>
      );
    case "scatter":
      return (
        <ScatterChart {...commonProps}>
          {gridAndAxes}
          {renderScatters()}
        </ScatterChart>
      );
    default:
      return (
        <LineChart {...commonProps}>
          {gridAndAxes}
          {renderLines()}
        </LineChart>
      );
  }
}

export function PlotPanel({ plots, onClear }: PlotPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-foreground">Plots & Visualizations</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {plots.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <span className="text-sm">Run code with plot() to visualize data</span>
          </div>
        ) : (
          <div className="grid gap-6">
            {plots.map((plot, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-secondary/30 p-4">
                <h3 className="mb-4 text-sm font-medium text-foreground">{plot.title}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PlotRenderer plot={plot} />
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
