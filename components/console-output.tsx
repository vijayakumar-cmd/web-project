"use client";

import { Terminal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConsoleOutputProps {
  output: string[];
  onClear: () => void;
}

export function ConsoleOutput({ output, onClear }: ConsoleOutputProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Console Output</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClear}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {output.length === 0 ? (
          <span className="text-muted-foreground">{"// Output will appear here..."}</span>
        ) : (
          output.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap">
              {line.startsWith("Error:") ? (
                <span className="text-destructive">{line}</span>
              ) : line.startsWith(">>>") ? (
                <span className="text-primary">{line}</span>
              ) : (
                <span className="text-foreground">{line}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
