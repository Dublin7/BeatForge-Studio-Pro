import { Play, Pause, Square, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TransportBarProps {
  isPlaying: boolean;
  bpm: number;
  currentStep: number;
  totalSteps: number;
  onPlayPause: () => void;
  onStop: () => void;
  onBpmChange: (bpm: number) => void;
}

export function TransportBar({
  isPlaying,
  bpm,
  currentStep,
  totalSteps,
  onPlayPause,
  onStop,
  onBpmChange
}: TransportBarProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card border-b border-border">
      {/* Transport Controls */}
      <div className="flex gap-2">
        <Button
          size="icon"
          variant={isPlaying ? "default" : "secondary"}
          onClick={onPlayPause}
          data-testid="button-play-pause"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          size="icon"
          variant="secondary"
          onClick={onStop}
          data-testid="button-stop"
        >
          <Square className="w-4 h-4" />
        </Button>
        
        <Button
          size="icon"
          variant="secondary"
          onClick={() => {}}
          data-testid="button-reset"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-border" />

      {/* BPM Control */}
      <div className="flex items-center gap-2">
        <Label htmlFor="bpm" className="text-xs text-muted-foreground uppercase tracking-wide">
          BPM
        </Label>
        <Input
          id="bpm"
          type="number"
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="w-20 h-8 text-center font-mono"
          min={40}
          max={300}
          data-testid="input-bpm"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-border" />

      {/* Position Display */}
      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Position
        </Label>
        <div className="font-mono text-sm" data-testid="text-position">
          {currentStep + 1} / {totalSteps}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Keyboard Shortcuts Hint */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd>
          <span>Play/Pause</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd>
          <span>Stop</span>
        </div>
      </div>
    </div>
  );
}
