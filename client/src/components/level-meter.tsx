import { useEffect, useRef } from "react";

interface LevelMeterProps {
  level: number; // 0-1
  peak?: number; // 0-1
  vertical?: boolean;
  height?: number;
  width?: number;
  className?: string;
}

export function LevelMeter({
  level,
  peak = 0,
  vertical = true,
  height = 200,
  width = 24,
  className = ""
}: LevelMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = "hsl(var(--muted))";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (vertical) {
      // Calculate filled height
      const filledHeight = canvas.height * level;
      const peakPosition = canvas.height * (1 - peak);

      // Create gradient from green to yellow to red
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, "hsl(160, 70%, 55%)"); // Green
      gradient.addColorStop(0.6, "hsl(50, 95%, 60%)"); // Yellow
      gradient.addColorStop(1, "hsl(0, 85%, 65%)"); // Red

      // Draw level
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - filledHeight, canvas.width, filledHeight);

      // Draw peak indicator
      if (peak > 0) {
        ctx.fillStyle = "hsl(0, 85%, 65%)";
        ctx.fillRect(0, peakPosition, canvas.width, 2);
      }

      // Draw scale marks
      ctx.strokeStyle = "hsl(var(--border))";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const y = (canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(i % 2 === 0 ? 4 : 2, y);
        ctx.stroke();
      }
    } else {
      // Horizontal meter (not implemented, for future use)
      const filledWidth = canvas.width * level;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "hsl(160, 70%, 55%)");
      gradient.addColorStop(0.6, "hsl(50, 95%, 60%)");
      gradient.addColorStop(1, "hsl(0, 85%, 65%)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, filledWidth, canvas.height);
    }
  }, [level, peak, vertical]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded-sm ${className}`}
      data-testid="canvas-level-meter"
    />
  );
}
