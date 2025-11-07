import { useState } from "react";
import { Play, Pause, Square, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipLauncher } from "@/components/clip-launcher";
import { PianoRoll } from "@/components/piano-roll";
import { TransportBar } from "@/components/transport-bar";
import { Clip, PianoNote, PerformTrack, Scene } from "@shared/schema";

export default function PerformLive() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  
  // Demo data - 4 tracks, 8 scenes
  const [tracks, setTracks] = useState<PerformTrack[]>([
    {
      id: 'track-1',
      name: 'Drums',
      type: 'drum',
      color: 'hsl(0, 85%, 60%)',
      volume: 0.8,
      pan: 0,
      solo: false,
      mute: false,
      clips: Array(8).fill(null).map((_, i) => 
        i === 0 ? {
          id: `clip-1-${i}`,
          name: 'Drum Loop 1',
          type: 'pattern' as const,
          color: 'hsl(0, 85%, 60%)',
          length: 4,
          loop: true,
          isPlaying: false,
          volume: 0.8,
        } : null
      ),
    },
    {
      id: 'track-2',
      name: 'Bass',
      type: 'midi',
      color: 'hsl(280, 85%, 60%)',
      volume: 0.7,
      pan: 0,
      solo: false,
      mute: false,
      clips: Array(8).fill(null).map((_, i) => 
        i === 0 ? {
          id: `clip-2-${i}`,
          name: 'Bass Line',
          type: 'midi' as const,
          color: 'hsl(280, 85%, 60%)',
          notes: [
            { pitch: 48, start: 0, duration: 1, velocity: 0.8 },
            { pitch: 50, start: 1, duration: 1, velocity: 0.7 },
            { pitch: 52, start: 2, duration: 1, velocity: 0.8 },
            { pitch: 50, start: 3, duration: 1, velocity: 0.7 },
          ],
          length: 4,
          loop: true,
          isPlaying: false,
          volume: 0.7,
        } : null
      ),
    },
    {
      id: 'track-3',
      name: 'Melody',
      type: 'midi',
      color: 'hsl(160, 70%, 55%)',
      volume: 0.6,
      pan: 0,
      solo: false,
      mute: false,
      clips: Array(8).fill(null),
    },
    {
      id: 'track-4',
      name: 'Synth',
      type: 'audio',
      color: 'hsl(50, 95%, 60%)',
      volume: 0.5,
      pan: 0,
      solo: false,
      mute: false,
      clips: Array(8).fill(null),
    },
  ]);

  const [scenes] = useState<Scene[]>(
    Array(8).fill(null).map((_, i) => ({
      id: `scene-${i}`,
      name: `Scene ${i + 1}`,
      color: `hsl(${i * 45}, 70%, 60%)`,
    }))
  );

  const [selectedClip, setSelectedClip] = useState<{
    trackIndex: number;
    sceneIndex: number;
  } | null>(null);

  const handleClipTrigger = (trackIndex: number, sceneIndex: number) => {
    const clip = tracks[trackIndex].clips[sceneIndex];
    const track = tracks[trackIndex];
    
    if (!clip) {
      // Empty slot - allow creating new MIDI clip
      if (track.type === 'midi') {
        setSelectedClip({ trackIndex, sceneIndex });
      }
      return;
    }

    // For MIDI clips, select for editing
    if (clip.type === 'midi' && track.type === 'midi') {
      setSelectedClip({ trackIndex, sceneIndex });
    }

    // Also toggle clip playback
    setTracks(prevTracks => {
      const newTracks = [...prevTracks];
      const track = { ...newTracks[trackIndex] };
      const clips = [...track.clips];
      const updatedClip = { ...clips[sceneIndex]! };
      updatedClip.isPlaying = !updatedClip.isPlaying;
      clips[sceneIndex] = updatedClip;
      track.clips = clips;
      newTracks[trackIndex] = track;
      return newTracks;
    });
  };

  const handleSceneTrigger = (sceneIndex: number) => {
    // Trigger all clips in this scene
    setTracks(prevTracks => {
      return prevTracks.map(track => {
        const clips = [...track.clips];
        if (clips[sceneIndex]) {
          clips[sceneIndex] = {
            ...clips[sceneIndex]!,
            isPlaying: true,
          };
        }
        return { ...track, clips };
      });
    });
  };

  const handleStopAll = () => {
    setTracks(prevTracks => {
      return prevTracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => 
          clip ? { ...clip, isPlaying: false } : null
        ),
      }));
    });
    setIsPlaying(false);
  };

  const handlePianoRollChange = (notes: PianoNote[]) => {
    if (!selectedClip) return;

    const { trackIndex, sceneIndex } = selectedClip;
    setTracks(prevTracks => {
      const newTracks = [...prevTracks];
      const track = { ...newTracks[trackIndex] };
      const clips = [...track.clips];
      
      if (!clips[sceneIndex]) {
        // Create new clip
        clips[sceneIndex] = {
          id: `clip-${trackIndex}-${sceneIndex}`,
          name: `Clip ${sceneIndex + 1}`,
          type: 'midi',
          color: track.color,
          notes,
          length: 4,
          loop: true,
          isPlaying: false,
          volume: 0.7,
        };
      } else {
        // Update existing clip
        clips[sceneIndex] = {
          ...clips[sceneIndex]!,
          notes,
        };
      }
      
      track.clips = clips;
      newTracks[trackIndex] = track;
      return newTracks;
    });
  };

  const selectedClipData = selectedClip
    ? tracks[selectedClip.trackIndex].clips[selectedClip.sceneIndex]
    : null;

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Perform Live</h1>
          <p className="text-sm text-muted-foreground">
            Trigger clips and create melodies in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            data-testid="button-add-track"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Track
          </Button>
          <Button
            size="sm"
            variant="outline"
            data-testid="button-add-scene"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Scene
          </Button>
        </div>
      </div>

      {/* Transport */}
      <TransportBar
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onStop={() => {
          setIsPlaying(false);
          handleStopAll();
        }}
        bpm={bpm}
        onBpmChange={setBpm}
        currentStep={0}
        totalSteps={64}
      />

      {/* Main content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
        {/* Clip Launcher */}
        <Card className="p-4 overflow-auto">
          <ClipLauncher
            tracks={tracks}
            scenes={scenes}
            onClipTrigger={handleClipTrigger}
            onSceneTrigger={handleSceneTrigger}
            onStopAll={handleStopAll}
          />
        </Card>

        {/* Piano Roll / Editor */}
        <Card className="p-4 overflow-auto">
          {selectedClip && tracks[selectedClip.trackIndex].type === 'midi' ? (
            <PianoRoll
              notes={selectedClipData?.notes || []}
              onNotesChange={handlePianoRollChange}
              length={selectedClipData?.length || 4}
              zoom={60}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="mb-2">Select a MIDI clip to edit</p>
                <p className="text-xs">Click on an empty slot or existing MIDI clip in the launcher</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
