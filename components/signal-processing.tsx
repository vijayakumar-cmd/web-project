"use client";

import { useState } from "react";
import { Activity, Waves, Zap, Filter, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SignalProcessingProps {
  onGenerateSignal: (type: string, params: Record<string, number>) => void;
  signalData: Array<{ x: number; y: number; filtered?: number }>;
}

export function SignalProcessing({ onGenerateSignal, signalData }: SignalProcessingProps) {
  const [frequency, setFrequency] = useState(5);
  const [amplitude, setAmplitude] = useState(1);
  const [noiseLevel, setNoiseLevel] = useState(0.2);
  const [filterCutoff, setFilterCutoff] = useState(10);

  const signalTypes = [
    { id: "sine", label: "Sine Wave", icon: Waves },
    { id: "square", label: "Square Wave", icon: BarChart3 },
    { id: "sawtooth", label: "Sawtooth", icon: Zap },
    { id: "noise", label: "White Noise", icon: Activity },
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <Waves className="h-4 w-4 text-primary" />
          Signal Generator
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {signalTypes.map((type) => (
            <Button
              key={type.id}
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() =>
                onGenerateSignal(type.id, { frequency, amplitude, noiseLevel })
              }
            >
              <type.icon className="h-4 w-4" />
              <span className="text-xs">{type.label}</span>
            </Button>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Frequency (Hz): {frequency}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={frequency}
              onChange={(e) => setFrequency(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Amplitude: {amplitude.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={amplitude}
              onChange={(e) => setAmplitude(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Noise Level: {noiseLevel.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={noiseLevel}
              onChange={(e) => setNoiseLevel(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4 text-accent" />
          Digital Filters
        </h3>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onGenerateSignal("lowpass", { cutoff: filterCutoff })
            }
          >
            Low-Pass Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onGenerateSignal("highpass", { cutoff: filterCutoff })
            }
          >
            High-Pass Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerateSignal("fft", {})}
          >
            FFT Analysis
          </Button>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Filter Cutoff: {filterCutoff} Hz
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={filterCutoff}
            onChange={(e) => setFilterCutoff(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
      </div>

      <div className="flex-1 rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium text-foreground">Signal Visualization</h3>
        <div className="h-64">
          {signalData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.28 0.02 260)" />
                <XAxis
                  dataKey="x"
                  stroke="oklch(0.5 0 0)"
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }}
                  tickFormatter={(v) => v.toFixed(2)}
                />
                <YAxis
                  stroke="oklch(0.5 0 0)"
                  tick={{ fill: "oklch(0.65 0 0)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.16 0.02 260)",
                    border: "1px solid oklch(0.28 0.02 260)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0 0)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="y"
                  stroke="oklch(0.7 0.18 180)"
                  strokeWidth={1.5}
                  dot={false}
                  name="Original"
                />
                {signalData[0]?.filtered !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="filtered"
                    stroke="oklch(0.65 0.2 30)"
                    strokeWidth={2}
                    dot={false}
                    name="Filtered"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-sm">Generate a signal to visualize</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
