"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Code,
  BarChart3,
  Activity,
  Image,
  Atom,
  Terminal,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/toolbar";
import { ConsoleOutput } from "@/components/console-output";
import { FileExplorer } from "@/components/file-explorer";
import { PlotPanel, PlotData } from "@/components/plot-panel";
import { SignalProcessing } from "@/components/signal-processing";
import { ImageProcessing } from "@/components/image-processing";
import { SimulationEngine } from "@/components/simulation-engine";
import { cn } from "@/lib/utils";

const CodeEditor = dynamic(
  () => import("@/components/code-editor").then((mod) => mod.CodeEditor),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-muted-foreground">Loading editor...</div> }
);

type TabId = "editor" | "plots" | "signals" | "images" | "simulation";

interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

const initialFiles: FileNode[] = [
  {
    id: "1",
    name: "projects",
    type: "folder",
    children: [
      {
        id: "2",
        name: "signal_analysis.py",
        type: "file",
        content: `# Signal Analysis Script
import numpy as np

# Generate a sample signal
t = np.linspace(0, 1, 1000)
frequency = 5  # Hz
amplitude = 1.0
signal = amplitude * np.sin(2 * np.pi * frequency * t)

# Add some noise
noise = 0.2 * np.random.randn(len(t))
noisy_signal = signal + noise

# Plot the results
plot(t, signal, title="Clean Signal")
plot(t, noisy_signal, title="Noisy Signal")

print(f"Signal frequency: {frequency} Hz")
print(f"Signal amplitude: {amplitude}")
print(f"Noise level: 0.2")
`,
      },
      {
        id: "3",
        name: "image_filter.py",
        type: "file",
        content: `# Image Processing Example
import numpy as np

# Define convolution kernels
sobel_x = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
]

sobel_y = [
    [-1, -2, -1],
    [0,  0,  0],
    [1,  2,  1]
]

gaussian_blur = [
    [1/16, 2/16, 1/16],
    [2/16, 4/16, 2/16],
    [1/16, 2/16, 1/16]
]

print("Edge detection kernels loaded")
print("Apply to images in the Image tab")
`,
      },
    ],
  },
  {
    id: "4",
    name: "examples",
    type: "folder",
    children: [
      {
        id: "5",
        name: "pendulum_sim.py",
        type: "file",
        content: `# Pendulum Simulation
import numpy as np

# Physical parameters
g = 9.81  # gravity (m/s^2)
L = 1.0   # length (m)
theta0 = np.pi / 4  # initial angle

# Time parameters
dt = 0.01
t_end = 10

# Simulation
t = np.arange(0, t_end, dt)
theta = theta0 * np.cos(np.sqrt(g/L) * t)

plot(t, theta, title="Pendulum Angle vs Time")
print(f"Period: {2*np.pi*np.sqrt(L/g):.3f} seconds")
`,
      },
      {
        id: "6",
        name: "fft_demo.py",
        type: "file",
        content: `# FFT Demonstration
import numpy as np

# Create a signal with multiple frequencies
fs = 1000  # Sample rate
t = np.linspace(0, 1, fs)

# Sum of sinusoids
signal = (
    1.0 * np.sin(2*np.pi*10*t) +  # 10 Hz
    0.5 * np.sin(2*np.pi*25*t) +  # 25 Hz
    0.3 * np.sin(2*np.pi*50*t)    # 50 Hz
)

# Compute FFT
fft_result = np.fft.fft(signal)
freqs = np.fft.fftfreq(len(signal), 1/fs)

plot(freqs[:len(freqs)//2], np.abs(fft_result)[:len(freqs)//2], 
     title="Frequency Spectrum", type="bar")

print("Detected frequencies: 10 Hz, 25 Hz, 50 Hz")
`,
      },
    ],
  },
  {
    id: "7",
    name: "main.py",
    type: "file",
    content: `# SciLab - Scientific Computing Environment
# 
# Welcome to SciLab! This is a Python/MATLAB-like
# environment for scientific computing.
#
# Features:
# - Signal Processing (FFT, filters, waveforms)
# - Image Processing (filters, transformations)
# - Modeling & Simulation (physics, systems)
# - Interactive Plotting (charts, graphs)
#
# Try running this code:

x = [i * 0.1 for i in range(100)]
y = [math.sin(val) for val in x]
y2 = [math.cos(val) for val in x]

plot(x, y, title="Sine Wave", type="line")
plot(x, y2, title="Cosine Wave", type="area")

print("Hello, SciLab!")
print(">>> Ready for scientific computing")
`,
  },
];

export default function SciLabPage() {
  const [activeTab, setActiveTab] = useState<TabId>("editor");
  const [code, setCode] = useState(initialFiles[2].content || "");
  const [output, setOutput] = useState<string[]>([
    "SciLab v1.0 - Scientific Computing Environment",
    ">>> Type code and press Run to execute",
    "",
  ]);
  const [plots, setPlots] = useState<PlotData[]>([]);
  const [signalData, setSignalData] = useState<Array<{ x: number; y: number; filtered?: number }>>([]);
  const [simData, setSimData] = useState<Array<{ t: number; value: number }>>([]);
  const [files, setFiles] = useState<FileNode[]>(initialFiles);
  const [selectedFileId, setSelectedFileId] = useState<string | null>("7");
  const [isRunning, setIsRunning] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const tabs = [
    { id: "editor" as const, label: "Editor", icon: Code },
    { id: "plots" as const, label: "Plots", icon: BarChart3 },
    { id: "signals" as const, label: "Signals", icon: Activity },
    { id: "images" as const, label: "Images", icon: Image },
    { id: "simulation" as const, label: "Simulation", icon: Atom },
  ];

  const handleRun = () => {
    setIsRunning(true);
    setOutput((prev) => [...prev, `>>> Running code...`, ""]);

    // Simple code parser for demonstration
    const lines = code.split("\n");
    const newPlots: PlotData[] = [];
    const printOutputs: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Handle print statements
      const printMatch = trimmed.match(/print\(["'`](.*)["'`]\)/);
      if (printMatch) {
        printOutputs.push(printMatch[1]);
      }

      // Handle print with f-strings (simplified)
      const fPrintMatch = trimmed.match(/print\(f["'`](.*)["'`]\)/);
      if (fPrintMatch) {
        printOutputs.push(fPrintMatch[1].replace(/\{[^}]+\}/g, "[value]"));
      }

      // Handle plot commands
      const plotMatch = trimmed.match(/plot\(.*title=["'`](.*)["'`].*type=["'`](.*)["'`]/);
      if (plotMatch) {
        const sampleData = Array.from({ length: 50 }, (_, i) => ({
          x: i,
          y: Math.sin(i * 0.2) * 50 + Math.random() * 10,
          y2: Math.cos(i * 0.2) * 30 + Math.random() * 5,
        }));
        newPlots.push({
          data: sampleData,
          xKey: "x",
          yKeys: ["y"],
          title: plotMatch[1],
          type: plotMatch[2] as PlotData["type"],
        });
      } else if (trimmed.includes("plot(")) {
        const titleMatch = trimmed.match(/title=["'`](.*)["'`]/);
        const sampleData = Array.from({ length: 50 }, (_, i) => ({
          x: i,
          y: Math.sin(i * 0.15) * 40 + Math.random() * 10,
        }));
        newPlots.push({
          data: sampleData,
          xKey: "x",
          yKeys: ["y"],
          title: titleMatch ? titleMatch[1] : "Plot Output",
          type: "line",
        });
      }
    });

    setTimeout(() => {
      setOutput((prev) => [
        ...prev,
        ...printOutputs,
        "",
        `>>> Execution completed successfully`,
        `>>> Generated ${newPlots.length} plot(s)`,
        "",
      ]);
      if (newPlots.length > 0) {
        setPlots(newPlots);
        setActiveTab("plots");
      }
      setIsRunning(false);
    }, 500);
  };

  const handleStop = () => {
    setIsRunning(false);
    setOutput((prev) => [...prev, ">>> Execution stopped", ""]);
  };

  const handleSave = () => {
    setOutput((prev) => [...prev, ">>> File saved", ""]);
  };

  const handleClearOutput = () => {
    setOutput([]);
  };

  const handleFileSelect = (file: FileNode) => {
    if (file.type === "file" && file.content) {
      setCode(file.content);
      setSelectedFileId(file.id);
    }
  };

  const handleCreateFile = (parentId: string | null, name: string, type: "file" | "folder") => {
    const newFile: FileNode = {
      id: Date.now().toString(),
      name,
      type,
      children: type === "folder" ? [] : undefined,
      content: type === "file" ? "# New file\n" : undefined,
    };
    setFiles((prev) => [...prev, newFile]);
  };

  const handleDeleteFile = (id: string) => {
    const removeNode = (nodes: FileNode[]): FileNode[] =>
      nodes.filter((n) => n.id !== id).map((n) => ({
        ...n,
        children: n.children ? removeNode(n.children) : undefined,
      }));
    setFiles(removeNode);
  };

  const handleGenerateSignal = useCallback((type: string, params: Record<string, number>) => {
    const samples = 500;
    const data: Array<{ x: number; y: number; filtered?: number }> = [];

    for (let i = 0; i < samples; i++) {
      const x = i / 100;
      let y = 0;

      switch (type) {
        case "sine":
          y = params.amplitude * Math.sin(2 * Math.PI * params.frequency * x);
          y += (Math.random() - 0.5) * 2 * params.noiseLevel;
          break;
        case "square":
          y = params.amplitude * Math.sign(Math.sin(2 * Math.PI * params.frequency * x));
          y += (Math.random() - 0.5) * 2 * params.noiseLevel;
          break;
        case "sawtooth":
          y = params.amplitude * ((x * params.frequency) % 1);
          y += (Math.random() - 0.5) * 2 * params.noiseLevel;
          break;
        case "noise":
          y = (Math.random() - 0.5) * 2 * params.amplitude;
          break;
        default:
          y = Math.sin(2 * Math.PI * 5 * x);
      }

      data.push({ x, y });
    }

    // Apply simple low-pass filter if requested
    if (type === "lowpass" && signalData.length > 0) {
      const filtered = signalData.map((d, i) => {
        if (i < 3) return d;
        const avg = (signalData[i - 2].y + signalData[i - 1].y + d.y + (signalData[i + 1]?.y || d.y) + (signalData[i + 2]?.y || d.y)) / 5;
        return { ...d, filtered: avg };
      });
      setSignalData(filtered);
      return;
    }

    setSignalData(data);
  }, [signalData]);

  const handleImageProcess = (operation: string, params: Record<string, number>) => {
    setOutput((prev) => [...prev, `>>> Applied ${operation} filter`, ""]);
  };

  const handleSimDataUpdate = useCallback((data: Array<{ t: number; value: number }>) => {
    setSimData(data);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <Toolbar
        onRun={handleRun}
        onStop={handleStop}
        onSave={handleSave}
        isRunning={isRunning}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-16 z-10 h-8 w-8 sm:hidden"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>

        {/* File Explorer Sidebar */}
        <aside
          className={cn(
            "w-56 flex-shrink-0 border-r border-border bg-sidebar transition-all",
            !showSidebar && "hidden sm:block"
          )}
        >
          <FileExplorer
            files={files}
            onFileSelect={handleFileSelect}
            selectedFileId={selectedFileId}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
          />
        </aside>

        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 border-b border-border bg-card px-2 py-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  activeTab === tab.id && "bg-secondary text-foreground"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main Panel */}
            <div className="flex-1 overflow-hidden p-2">
              {activeTab === "editor" && (
                <CodeEditor value={code} onChange={setCode} language="python" />
              )}
              {activeTab === "plots" && (
                <PlotPanel plots={plots} onClear={() => setPlots([])} />
              )}
              {activeTab === "signals" && (
                <SignalProcessing
                  onGenerateSignal={handleGenerateSignal}
                  signalData={signalData}
                />
              )}
              {activeTab === "images" && (
                <ImageProcessing onProcessImage={handleImageProcess} />
              )}
              {activeTab === "simulation" && (
                <SimulationEngine onDataUpdate={handleSimDataUpdate} />
              )}
            </div>

            {/* Right Panel - Console */}
            <div className="hidden w-80 flex-shrink-0 border-l border-border p-2 lg:block">
              <ConsoleOutput output={output} onClear={handleClearOutput} />
            </div>
          </div>

          {/* Bottom Console (Mobile/Tablet) */}
          <div className="h-40 border-t border-border p-2 lg:hidden">
            <ConsoleOutput output={output} onClear={handleClearOutput} />
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="flex h-6 items-center justify-between border-t border-border bg-card px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className={cn("h-2 w-2 rounded-full", isRunning ? "bg-chart-2 animate-pulse" : "bg-chart-4")} />
            {isRunning ? "Running" : "Ready"}
          </span>
          <span>Python 3.11</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>Line 1, Col 1</span>
        </div>
      </footer>
    </div>
  );
}
