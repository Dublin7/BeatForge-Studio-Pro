import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

interface SpectrumAnalyzerProps {
  width?: number;
  height?: number;
}

export function SpectrumAnalyzer({ width = 800, height = 200 }: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create analyzer and connect to master output
    const analyzer = new Tone.Analyser('fft', 512);
    Tone.getDestination().connect(analyzer);
    analyzerRef.current = analyzer;

    const draw = () => {
      if (!ctx || !analyzerRef.current) return;

      const values = analyzerRef.current.getValue() as Float32Array;
      const barWidth = width / values.length;

      // Clear canvas
      ctx.fillStyle = 'hsl(270, 15%, 6%)';
      ctx.fillRect(0, 0, width, height);

      // Draw frequency bars
      values.forEach((value, i) => {
        const normalizedValue = (value + 100) / 100; // Normalize from -100dB to 0dB
        const barHeight = Math.max(0, normalizedValue * height);
        const x = i * barWidth;
        const y = height - barHeight;

        // Color gradient based on frequency (low=purple, mid=blue, high=cyan)
        const hue = 260 + (i / values.length) * 100;
        ctx.fillStyle = `hsl(${hue}, 85%, ${40 + normalizedValue * 30}%)`;
        ctx.fillRect(x, y, barWidth - 1, barHeight);
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (analyzerRef.current) {
        analyzerRef.current.dispose();
      }
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-md border border-border"
      style={{ width: '100%', height: 'auto' }}
      data-testid="spectrum-analyzer"
    />
  );
}
