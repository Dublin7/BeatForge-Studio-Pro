import { useState } from "react";
import { Play, Square, Disc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clip, Scene, PerformTrack } from "@shared/schema";

interface ClipLauncherProps {
  tracks: PerformTrack[];
  scenes: Scene[];
  onClipTrigger: (trackIndex: number, sceneIndex: number) => void;
  onSceneTrigger: (sceneIndex: number) => void;
  onStopAll: () => void;
}

export function ClipLauncher({
  tracks,
  scenes,
  onClipTrigger,
  onSceneTrigger,
  onStopAll,
}: ClipLauncherProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-mono text-muted-foreground">CLIP LAUNCHER</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={onStopAll}
          data-testid="button-stop-all-clips"
        >
          <Square className="w-3 h-3 mr-1" />
          Stop All
        </Button>
      </div>

      <div className="flex gap-2">
        {/* Scene triggers column */}
        <div className="flex flex-col gap-1">
          <div className="h-8 flex items-center justify-center text-xs font-mono text-muted-foreground">
            SCENE
          </div>
          {scenes.map((scene, sceneIndex) => (
            <Button
              key={scene.id}
              size="icon"
              variant="outline"
              onClick={() => onSceneTrigger(sceneIndex)}
              className="h-16 w-12"
              style={{ borderColor: scene.color }}
              data-testid={`button-trigger-scene-${sceneIndex}`}
            >
              <Play className="w-4 h-4" />
            </Button>
          ))}
        </div>

        {/* Clip grid */}
        <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${tracks.length}, minmax(80px, 1fr))` }}>
          {/* Track headers */}
          {tracks.map((track, trackIndex) => (
            <div
              key={`header-${track.id}`}
              className="h-8 flex items-center justify-center text-xs font-mono truncate px-2"
              style={{ color: track.color }}
            >
              {track.name}
            </div>
          ))}

          {/* Clip slots */}
          {scenes.map((scene, sceneIndex) =>
            tracks.map((track, trackIndex) => {
              const clip = track.clips[sceneIndex];
              return (
                <ClipSlot
                  key={`${track.id}-${scene.id}`}
                  clip={clip}
                  trackIndex={trackIndex}
                  sceneIndex={sceneIndex}
                  onTrigger={() => onClipTrigger(trackIndex, sceneIndex)}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

interface ClipSlotProps {
  clip: Clip | null;
  trackIndex: number;
  sceneIndex: number;
  onTrigger: () => void;
}

function ClipSlot({ clip, trackIndex, sceneIndex, onTrigger }: ClipSlotProps) {
  if (!clip) {
    return (
      <div
        className="h-16 border border-dashed border-border rounded-md hover-elevate active-elevate-2 cursor-pointer flex items-center justify-center"
        onClick={onTrigger}
        data-testid={`clip-slot-${trackIndex}-${sceneIndex}`}
      >
        <span className="text-xs text-muted-foreground/50">Empty</span>
      </div>
    );
  }

  return (
    <Card
      className={`h-16 cursor-pointer hover-elevate active-elevate-2 flex flex-col justify-between p-2 ${
        clip.isPlaying ? 'ring-2 ring-primary' : ''
      }`}
      style={{ backgroundColor: `${clip.color}20`, borderColor: clip.color }}
      onClick={onTrigger}
      data-testid={`clip-slot-${trackIndex}-${sceneIndex}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium truncate" style={{ color: clip.color }}>
          {clip.name}
        </span>
        {clip.isPlaying && <Disc className="w-3 h-3 animate-spin" style={{ color: clip.color }} />}
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-mono">{clip.length}b</span>
        {clip.type === 'midi' && <span>MIDI</span>}
        {clip.type === 'audio' && <span>AUDIO</span>}
        {clip.type === 'pattern' && <span>PTN</span>}
      </div>
    </Card>
  );
}
