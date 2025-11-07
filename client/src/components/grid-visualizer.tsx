import { DrumNote } from "@shared/schema";

interface GridVisualizerProps {
  notes: DrumNote[];
  steps: number;
  currentStep?: number;
  onNoteToggle?: (step: number, velocity: number) => void;
  label?: string;
  color?: string;
  height?: number;
}

export function GridVisualizer({
  notes,
  steps = 16,
  currentStep = -1,
  onNoteToggle,
  label,
  color = "hsl(var(--primary))",
  height = 32
}: GridVisualizerProps) {
  const noteMap = new Map(notes.map(n => [n.step, n.velocity]));

  const handleCellClick = (step: number) => {
    if (!onNoteToggle) return;
    
    const currentVelocity = noteMap.get(step) || 0;
    // Toggle: if note exists, remove it (velocity 0), otherwise add at full velocity
    const newVelocity = currentVelocity > 0 ? 0 : 1;
    onNoteToggle(step, newVelocity);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2">
          {label}
        </div>
      )}
      
      <div 
        className="grid gap-1 p-2 rounded-md bg-muted/30"
        style={{
          gridTemplateColumns: `repeat(${steps}, minmax(0, 1fr))`,
          height: `${height}px`
        }}
      >
        {Array.from({ length: steps }, (_, i) => {
          const velocity = noteMap.get(i) || 0;
          const isActive = velocity > 0;
          const isCurrent = i === currentStep;

          return (
            <button
              key={i}
              onClick={() => handleCellClick(i)}
              className={`
                rounded-sm transition-all duration-75 border
                ${isCurrent ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}
                ${isActive ? 'hover-elevate active-elevate-2' : 'hover:bg-muted active:bg-muted/80'}
                ${onNoteToggle ? 'cursor-pointer' : 'cursor-default'}
              `}
              style={{
                backgroundColor: isActive 
                  ? color
                  : 'transparent',
                opacity: isActive ? 0.3 + (velocity * 0.7) : 1,
                borderColor: isActive 
                  ? color
                  : 'hsl(var(--border))'
              }}
              data-testid={`grid-cell-${i}`}
              aria-label={`Step ${i + 1}${isActive ? `, velocity ${Math.round(velocity * 100)}%` : ', empty'}`}
            />
          );
        })}
      </div>
    </div>
  );
}
