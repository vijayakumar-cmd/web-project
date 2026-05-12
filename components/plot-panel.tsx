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
import { Download, Maximize2, Trash2, BarChart3 } from "lucide-react";
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
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function PlotChart({ plot }: { plot: PlotData }) {
  const commonProps = {
    data: plot.data,
    margin: { top: 10, right: 30, left: 0, bottom: 0 },
  };

  const axisStyle = {
    stroke: "var(--muted-foreground)",
    fontSize: 11,
  };

  const gridStyle = {
    strokeDasharray: "3 3",
    stroke: "var(--border)",
  };

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
  };

  if (plot.type === "area") {
    return (
      <AreaChart {...commonProps}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey={plot.xKey} {...axisStyle} />
        <YAxis {...axisStyle} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        {plot.yKeys.map((key, idx) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[idx % COLORS.length]}
            fill={COLORS[idx % COLORS.length]}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    );
  }

  if (plot.type === "bar") {
    return (
      <BarChart {...commonProps}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey={plot.xKey} {...axisStyle} />
        <YAxis {...axisStyle} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        {plot.yKeys.map((key, idx) => (
          <Bar
            key={key}
            dataKey={key}
            fill={COLORS[idx % COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    );
  }

  if (plot.type === "scatter") {
    return (
      <ScatterChart {...commonProps}>
        <CartesianGrid {...gridStyle} />
        <XAxis dataKey={plot.xKey} {...axisStyle} />
        <YAxis {...axisStyle} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend />
        {plot.yKeys.map((key, idx) => (
          <Scatter
            key={key}
            dataKey={key}
            fill={COLORS[idx % COLORS.length]}
            name={key}
          />
        ))}
      </ScatterChart>
    );
  }

  return (
    <LineChart {...commonProps}>
      <CartesianGrid {...gridStyle} />
      <XAxis dataKey={plot.xKey} {...axisStyle} />
      <YAxis {...axisStyle} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend />
      {plot.yKeys.map((key, idx) => (
        <Line
          key={key}
          type="monotone"
          dataKey={key}
          stroke={COLORS[idx % COLORS.length]}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      ))}
    </LineChart>
  );
}

export function PlotPanel({ plots, onClear }: PlotPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <span className="text-sm font-medium text-foreground">
          Plots & Visualizations
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={onClear}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {plots.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <BarChart3 className="h-12 w-12 opacity-50" />
            <span className="text-sm">
              {"Run code with plot() to visualize data"}
            </span>
          </div>
        ) : (
          <div className="grid gap-6">
            {plots.map((plot, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-secondary/30 p-4"
              >
                <h3 className="mb-4 text-sm font-medium text-foreground">
                  {plot.title}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PlotChart plot={plot} />
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
