import { useEffect, useRef, useState } from "react";

interface WaveformVisualizerProps {
  audioBuffer: AudioBuffer | null;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  playbackPosition?: number;
  selectionStart?: number;
  selectionEnd?: number;
  onSelectionChange?: (start: number, end: number) => void;
  zoom?: number;
}

export function WaveformVisualizer({
  audioBuffer,
  width = 800,
  height = 120,
  color = "hsl(280, 85%, 58%)",
  backgroundColor = "hsl(270, 15%, 6%)",
  playbackPosition = 0,
  selectionStart,
  selectionEnd,
  onSelectionChange,
  zoom = 1,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / (width * zoom));
    const amp = height / 2;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const x = i;
      const yMin = (1 + min) * amp;
      const yMax = (1 + max) * amp;

      if (i === 0) {
        ctx.moveTo(x, yMin);
      } else {
        ctx.lineTo(x, yMin);
      }
    }

    ctx.stroke();
    ctx.beginPath();

    for (let i = width - 1; i >= 0; i--) {
      let min = 1.0;
      let max = -1.0;

      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const x = i;
      const yMax = (1 + max) * amp;
      ctx.lineTo(x, yMax);
    }

    ctx.closePath();
    ctx.fillStyle = color + "40";
    ctx.fill();

    if (selectionStart !== undefined && selectionEnd !== undefined) {
      const startX = (selectionStart / audioBuffer.duration) * width;
      const endX = (selectionEnd / audioBuffer.duration) * width;
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(startX, 0, endX - startX, height);
    }

    if (playbackPosition > 0) {
      const playX = (playbackPosition / audioBuffer.duration) * width;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, height);
      ctx.stroke();
    }
  }, [audioBuffer, width, height, color, backgroundColor, playbackPosition, selectionStart, selectionEnd, zoom]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!audioBuffer || !onSelectionChange) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const time = (x / width) * audioBuffer.duration;
    setIsDragging(true);
    setDragStart(time);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || dragStart === null || !audioBuffer || !onSelectionChange) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const time = (x / width) * audioBuffer.duration;
    
    const start = Math.min(dragStart, time);
    const end = Math.max(dragStart, time);
    onSelectionChange(start, end);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px`, cursor: onSelectionChange ? 'crosshair' : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      data-testid="canvas-waveform"
    />
  );
}
