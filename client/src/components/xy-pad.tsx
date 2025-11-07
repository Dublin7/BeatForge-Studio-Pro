import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { XYPadPosition } from "@shared/schema";

interface XYPadProps {
  position: XYPadPosition;
  onPositionChange: (position: XYPadPosition) => void;
  parameter1Label: string;
  parameter2Label: string;
  size?: number;
}

export function XYPad({
  position,
  onPositionChange,
  parameter1Label,
  parameter2Label,
  size = 300,
}: XYPadProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = (clientX: number, clientY: number) => {
    const pad = padRef.current;
    if (!pad) return;

    const rect = pad.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height)); // Invert Y

    onPositionChange({ x, y });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updatePosition(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsDragging(true);
      const touch = e.touches[0];
      updatePosition(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updatePosition(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground">FX PAD</h3>
        <div className="text-xs font-mono text-muted-foreground">
          X: {(position.x * 100).toFixed(0)}% | Y: {(position.y * 100).toFixed(0)}%
        </div>
      </div>

      <div className="relative">
        <Card
          ref={padRef}
          className="cursor-crosshair overflow-hidden relative"
          style={{ width: size, height: size }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          data-testid="xy-pad"
        >
          {/* Grid lines */}
          <svg className="absolute inset-0 pointer-events-none" width={size} height={size}>
            {/* Vertical lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((x) => (
              <line
                key={`v-${x}`}
                x1={x * size}
                y1={0}
                x2={x * size}
                y2={size}
                stroke="hsl(270, 12%, 15%)"
                strokeWidth={x === 0.5 ? 2 : 1}
              />
            ))}
            {/* Horizontal lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((y) => (
              <line
                key={`h-${y}`}
                x1={0}
                y1={y * size}
                x2={size}
                y2={y * size}
                stroke="hsl(270, 12%, 15%)"
                strokeWidth={y === 0.5 ? 2 : 1}
              />
            ))}
          </svg>

          {/* Position indicator */}
          <div
            className="absolute w-6 h-6 bg-primary rounded-full border-4 border-background shadow-lg pointer-events-none"
            style={{
              left: `${position.x * 100}%`,
              top: `${(1 - position.y) * 100}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 20px hsla(280, 85%, 58%, 0.5)',
            }}
            data-testid="xy-pad-indicator"
          />

          {/* Crosshair */}
          <svg className="absolute inset-0 pointer-events-none" width={size} height={size}>
            <line
              x1={position.x * size}
              y1={0}
              x2={position.x * size}
              y2={size}
              stroke="hsla(280, 85%, 58%, 0.3)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <line
              x1={0}
              y1={(1 - position.y) * size}
              x2={size}
              y2={(1 - position.y) * size}
              stroke="hsla(280, 85%, 58%, 0.3)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </svg>
        </Card>

        {/* Axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-muted-foreground font-mono">
          {parameter1Label}
        </div>
        <div
          className="absolute top-0 -left-12 text-xs text-muted-foreground font-mono"
          style={{ 
            transformOrigin: 'center',
            transform: 'rotate(-90deg) translateX(-50%)',
            width: size,
          }}
        >
          <div className="text-center">{parameter2Label}</div>
        </div>
      </div>
    </div>
  );
}
