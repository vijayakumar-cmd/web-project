"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Settings, Atom, Orbit, Waves, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

type SimulationType = "pendulum" | "particles" | "wave" | "nbody";

interface SimulationEngineProps {
  onDataUpdate: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
}

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  color: string;
}

export function SimulationEngine({ onDataUpdate }: SimulationEngineProps) {
  const [simulationType, setSimulationType] = useState<SimulationType>("pendulum");
  const [isRunning, setIsRunning] = useState(false);
  const [params, setParams] = useState({
    gravity: 9.81,
    length: 1,
    damping: 0.01,
    mass: 1,
    dt: 0.016,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const stateRef = useRef({
    angle: Math.PI / 4,
    angularVelocity: 0,
    time: 0,
    particles: [] as Particle[],
    wavePhase: 0,
    bodies: [] as Body[],
  });

  const initializeSimulation = useCallback(() => {
    stateRef.current.time = 0;

    if (simulationType === "pendulum") {
      stateRef.current.angle = Math.PI / 4;
      stateRef.current.angularVelocity = 0;
    } else if (simulationType === "particles") {
      stateRef.current.particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * 350 + 25,
        y: Math.random() * 200 + 25,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      }));
    } else if (simulationType === "wave") {
      stateRef.current.wavePhase = 0;
    } else if (simulationType === "nbody") {
      stateRef.current.bodies = [
        { x: 200, y: 150, vx: 0, vy: 1, mass: 100, color: "#f97316" },
        { x: 280, y: 150, vx: 0, vy: -2, mass: 10, color: "#22d3ee" },
        { x: 120, y: 150, vx: 0, vy: 2, mass: 10, color: "#4ade80" },
      ];
    }
  }, [simulationType]);

  const simulate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    const state = stateRef.current;
    state.time += params.dt;

    if (simulationType === "pendulum") {
      const { gravity, length, damping } = params;
      const angularAcceleration =
        (-gravity / (length * 100)) * Math.sin(state.angle) -
        damping * state.angularVelocity;
      state.angularVelocity += angularAcceleration * params.dt * 60;
      state.angle += state.angularVelocity * params.dt * 60;

      const pivotX = canvas.width / 2;
      const pivotY = 40;
      const bobX = pivotX + Math.sin(state.angle) * length * 100;
      const bobY = pivotY + Math.cos(state.angle) * length * 100;

      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      ctx.fillStyle = "#22d3ee";
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = "#f97316";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.arc(bobX, bobY, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (simulationType === "particles") {
      state.particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += params.gravity * 0.01;
        p.vy *= 1 - params.damping;
        p.vx *= 1 - params.damping * 0.5;

        if (p.x < 5 || p.x > canvas.width - 5) {
          p.vx *= -0.9;
          p.x = Math.max(5, Math.min(canvas.width - 5, p.x));
        }
        if (p.y < 5 || p.y > canvas.height - 5) {
          p.vy *= -0.9;
          p.y = Math.max(5, Math.min(canvas.height - 5, p.y));
        }

        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    } else if (simulationType === "wave") {
      state.wavePhase += 0.05;

      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#22d3ee";
      ctx.shadowBlur = 10;
      ctx.beginPath();

      for (let x = 0; x < canvas.width; x++) {
        const y =
          canvas.height / 2 +
          Math.sin(x * 0.02 + state.wavePhase) * 50 +
          Math.sin(x * 0.01 + state.wavePhase * 0.5) * 30;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "#f97316";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#f97316";
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y =
          canvas.height / 2 +
          Math.sin(x * 0.03 + state.wavePhase * 1.5) * 30 +
          Math.sin(x * 0.015 + state.wavePhase * 0.8) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (simulationType === "nbody") {
      const G = 0.5;

      state.bodies.forEach((b1, i) => {
        let ax = 0;
        let ay = 0;
        state.bodies.forEach((b2, j) => {
          if (i !== j) {
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 1;
            const force = (G * b2.mass) / (dist * dist);
            ax += (force * dx) / dist;
            ay += (force * dy) / dist;
          }
        });
        b1.vx += ax;
        b1.vy += ay;
      });

      state.bodies.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < 0 || b.x > canvas.width) b.vx *= -0.5;
        if (b.y < 0 || b.y > canvas.height) b.vy *= -0.5;
        b.x = Math.max(0, Math.min(canvas.width, b.x));
        b.y = Math.max(0, Math.min(canvas.height, b.y));

        ctx.shadowColor = b.color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, Math.sqrt(b.mass) * 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    }

    if (isRunning) {
      animationRef.current = requestAnimationFrame(simulate);
    }
  }, [simulationType, params, isRunning]);

  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(simulate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRunning, simulate]);

  const simulations = [
    { id: "pendulum" as const, label: "Pendulum", icon: Orbit },
    { id: "particles" as const, label: "Particles", icon: Atom },
    { id: "wave" as const, label: "Wave", icon: Waves },
    { id: "nbody" as const, label: "N-Body", icon: Zap },
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <Settings className="h-4 w-4 text-primary" />
          Simulation Controls
        </h3>

        <div className="mb-4 flex flex-wrap gap-2">
          {simulations.map((sim) => (
            <Button
              key={sim.id}
              variant={simulationType === sim.id ? "default" : "secondary"}
              size="sm"
              onClick={() => {
                setSimulationType(sim.id);
                setIsRunning(false);
              }}
            >
              <sim.icon className="mr-2 h-4 w-4" />
              {sim.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant={isRunning ? "destructive" : "default"}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? (
              <>
                <Pause className="mr-2 h-4 w-4" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" /> Run
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setIsRunning(false);
              initializeSimulation();
            }}
          >
            <RotateCcw className="mr-2 h-4 w-4" /> Reset
          </Button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Gravity: {params.gravity.toFixed(2)}
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={params.gravity}
              onChange={(e) =>
                setParams({ ...params, gravity: Number(e.target.value) })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Length/Scale: {params.length.toFixed(2)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={params.length}
              onChange={(e) =>
                setParams({ ...params, length: Number(e.target.value) })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Damping: {params.damping.toFixed(3)}
            </label>
            <input
              type="range"
              min="0"
              max="0.1"
              step="0.005"
              value={params.damping}
              onChange={(e) =>
                setParams({ ...params, damping: Number(e.target.value) })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">
              Time Step: {params.dt.toFixed(3)}
            </label>
            <input
              type="range"
              min="0.001"
              max="0.05"
              step="0.001"
              value={params.dt}
              onChange={(e) =>
                setParams({ ...params, dt: Number(e.target.value) })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-accent"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium text-foreground">
          Simulation Viewport
        </h3>
        <div className="flex items-center justify-center overflow-hidden rounded-lg border border-border bg-[#0a0a12]">
          <canvas ref={canvasRef} width={400} height={300} className="max-w-full" />
        </div>
      </div>
    </div>
  );
}
