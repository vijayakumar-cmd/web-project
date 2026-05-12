"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ImageIcon,
  Upload,
  Sliders,
  RotateCcw,
  ZoomIn,
  Contrast,
  Sun,
  Droplet,
  Filter,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageProcessingProps {
  onProcessImage: (operation: string) => void;
}

export function ImageProcessing({ onProcessImage }: ImageProcessingProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setRotation(0);
    setSelectedFilter(null);
  };

  const applyFilter = (filterId: string) => {
    setSelectedFilter(filterId);
    onProcessImage(filterId);
  };

  const drawImage = useCallback(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const maxWidth = 400;
      const maxHeight = 300;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      if (blur > 0) filterStr += ` blur(${blur}px)`;
      if (selectedFilter === "grayscale") filterStr += " grayscale(100%)";
      if (selectedFilter === "sepia") filterStr += " sepia(100%)";
      if (selectedFilter === "invert") filterStr += " invert(100%)";

      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
    };
  }, [imageSrc, brightness, contrast, saturation, blur, rotation, selectedFilter]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  const filters = [
    { id: "grayscale", label: "Grayscale" },
    { id: "sepia", label: "Sepia" },
    { id: "invert", label: "Invert" },
    { id: "edge", label: "Edge Detect" },
    { id: "sharpen", label: "Sharpen" },
  ];

  const kernelOperations = [
    { id: "sobel_x", label: "Sobel X" },
    { id: "sobel_y", label: "Sobel Y" },
    { id: "laplacian", label: "Laplacian" },
    { id: "emboss", label: "Emboss" },
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <ImageIcon className="h-4 w-4 text-primary" />
          Image Processing
        </h3>

        <div className="mb-4 flex flex-wrap gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button variant="secondary" asChild>
              <span className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Image
              </span>
            </Button>
          </label>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Sun className="h-3 w-3" /> Brightness: {brightness}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Contrast className="h-3 w-3" /> Contrast: {contrast}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Droplet className="h-3 w-3" /> Saturation: {saturation}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => setSaturation(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
            />
          </div>
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Filter className="h-3 w-3" /> Blur: {blur}px
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs text-muted-foreground">
            Rotation: {rotation} deg
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-accent"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <Sliders className="h-4 w-4 text-accent" />
          Filters & Effects
        </h3>
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => applyFilter(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
        <h4 className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Grid3X3 className="h-3 w-3" />
          Kernel Operations
        </h4>
        <div className="flex flex-wrap gap-2">
          {kernelOperations.map((op) => (
            <Button
              key={op.id}
              variant="secondary"
              size="sm"
              onClick={() => applyFilter(op.id)}
            >
              {op.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 rounded-lg border border-border bg-card p-4">
        <h3 className="mb-4 text-sm font-medium text-foreground">Preview</h3>
        <div className="flex min-h-48 items-center justify-center overflow-auto rounded-lg border border-border bg-secondary/30 p-4">
          {imageSrc ? (
            <canvas ref={canvasRef} className="max-w-full" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ZoomIn className="h-12 w-12 opacity-50" />
              <span className="text-sm">Upload an image to process</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
