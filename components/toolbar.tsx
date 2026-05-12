"use client";

import {
  Play,
  Square,
  Save,
  FolderOpen,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Bug,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  onRun: () => void;
  onStop: () => void;
  onSave: () => void;
  isRunning: boolean;
}

export function Toolbar({ onRun, onStop, onSave, isRunning }: ToolbarProps) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Cpu className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">SciLab</span>
        </div>
        <div className="ml-4 hidden items-center gap-1 sm:flex">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            File
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Tools
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Help
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-2 hidden items-center gap-1 rounded-lg border border-border bg-secondary/50 p-1 sm:flex">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onRun}
            disabled={isRunning}
          >
            <Play className="h-4 w-4 text-chart-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onStop}
            disabled={!isRunning}
          >
            <Square className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSave}>
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Bug className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
