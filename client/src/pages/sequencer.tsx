import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Home, Save, Download, Plus, Trash2 } from "lucide-react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useAutoSave } from "@/hooks/use-local-storage";
import { audioEngine } from "@/lib/audio-engine";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { TransportBar } from "@/components/transport-bar";
import { GridVisualizer } from "@/components/grid-visualizer";
import { SequencerTrack } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

const INITIAL_TRACKS: SequencerTrack[] = [
  {
    id: "track-1",
    instrument: "Kick",
    notes: [],
    volume: 0.8,
    pan: 0,
    solo: false,
    mute: false,
    color: "hsl(280, 85%, 58%)",
    effects: [],
    eq: { low: 0, mid: 0, high: 0, lowPassFreq: 20000, highPassFreq: 20 }
  },
  {
    id: "track-2",
    instrument: "Snare",
    notes: [],
    volume: 0.7,
    pan: 0,
    solo: false,
    mute: false,
    color: "hsl(160, 70%, 55%)",
    effects: [],
    eq: { low: 0, mid: 0, high: 0, lowPassFreq: 20000, highPassFreq: 20 }
  },
  {
    id: "track-3",
    instrument: "Hi-Hat",
    notes: [],
    volume: 0.6,
    pan: 0,
    solo: false,
    mute: false,
    color: "hsl(50, 95%, 60%)",
    effects: [],
    eq: { low: 0, mid: 0, high: 0, lowPassFreq: 20000, highPassFreq: 20 }
  },
];

export default function Sequencer() {
  const [tracks, setTracks] = useState<SequencerTrack[]>(INITIAL_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentStep, setCurrentStep] = useState(-1);
  const [projectName, setProjectName] = useState("Untitled Project");

  // Initialize audio engine on mount
  useEffect(() => {
    audioEngine.initialize().catch(console.error);
    audioEngine.setBPM(bpm);

    // Load saved project
    const saved = localStorage.getItem('beatforge-project');
    if (saved) {
      try {
        const project = JSON.parse(saved);
        setProjectName(project.name);
        setBpm(project.bpm);
        setTracks(project.tracks);
      } catch (error) {
        console.error('Error loading saved project:', error);
      }
    }

    return () => {
      audioEngine.stop();
    };
  }, []);

  // Setup audio when tracks change
  useEffect(() => {
    if (tracks.length > 0) {
      audioEngine.setupTracks(tracks);
      audioEngine.setupSequence(tracks, 64);
    }
  }, [tracks]);

  // Update BPM when changed
  useEffect(() => {
    audioEngine.setBPM(bpm);
  }, [bpm]);

  // Auto-save project
  useAutoSave('beatforge-project', {
    name: projectName,
    bpm,
    tracks
  }, 2000);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: () => setIsPlaying(prev => !prev),
    onStop: () => {
      setIsPlaying(false);
      setCurrentStep(-1);
    },
    onSave: handleSave
  });

  // Handle playback
  useEffect(() => {
    if (isPlaying) {
      audioEngine.play();
      
      // Update current step indicator
      const interval = setInterval(() => {
        setCurrentStep(audioEngine.getCurrentStep());
      }, 100);

      return () => clearInterval(interval);
    } else {
      audioEngine.pause();
    }
  }, [isPlaying]);

  const handleNoteToggle = (trackId: string, step: number, velocity: number) => {
    setTracks(prev => prev.map(track => {
      if (track.id !== trackId) return track;

      const newNotes = velocity > 0
        ? [...track.notes.filter(n => n.step !== step), { step, velocity }]
        : track.notes.filter(n => n.step !== step);

      return { ...track, notes: newNotes };
    }));
  };

  const handleVolumeChange = (trackId: string, volume: number) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, volume } : track
    ));
  };

  const handleSoloToggle = (trackId: string) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, solo: !track.solo } : track
    ));
  };

  const handleMuteToggle = (trackId: string) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, mute: !track.mute } : track
    ));
  };

  const handleAddTrack = () => {
    const newTrack: SequencerTrack = {
      id: `track-${Date.now()}`,
      instrument: `Track ${tracks.length + 1}`,
      notes: [],
      volume: 0.7,
      pan: 0,
      solo: false,
      mute: false,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      effects: [],
      eq: { low: 0, mid: 0, high: 0, lowPassFreq: 20000, highPassFreq: 20 }
    };
    setTracks(prev => [...prev, newTrack]);
  };

  const handleDeleteTrack = (trackId: string) => {
    setTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const handleSave = () => {
    const project = {
      name: projectName,
      bpm,
      tracks,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('beatforge-project', JSON.stringify(project));
    
    // Show toast notification (simple alert for now)
    const toast = document.createElement('div');
    toast.textContent = '✓ Project saved';
    toast.style.cssText = 'position:fixed;top:20px;right:20px;background:hsl(var(--primary));color:white;padding:12px 24px;border-radius:6px;z-index:9999;animation:fadeOut 2s forwards';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const handleExport = async () => {
    // Offer choice between JSON and WAV export
    const choice = confirm('Export as audio (WAV)? Click Cancel for JSON export.');
    
    if (choice) {
      // Export as WAV
      try {
        const { exportToWAV } = await import('@/lib/export-audio');
        const wavBlob = await exportToWAV(tracks, bpm, 8);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.wav`;
        a.click();
        URL.revokeObjectURL(url);

        // Show success notification
        const toast = document.createElement('div');
        toast.textContent = '✓ Audio exported as WAV';
        toast.style.cssText = 'position:fixed;top:20px;right:20px;background:hsl(var(--primary));color:white;padding:12px 24px;border-radius:6px;z-index:9999;animation:fadeOut 2s forwards';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      } catch (error) {
        console.error('WAV export failed:', error);
        alert('Failed to export audio. Please try again.');
      }
    } else {
      // Export as JSON
      const project = {
        name: projectName,
        bpm,
        tracks,
      };

      const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-home">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold" data-testid="text-page-title">Advanced Sequencer</h1>
              <p className="text-xs text-muted-foreground">16-track step sequencer</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-48 h-9"
            placeholder="Project name"
            data-testid="input-project-name"
          />
          <Button variant="outline" size="sm" onClick={handleSave} className="gap-2" data-testid="button-save">
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2" data-testid="button-export">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/mixer">
            <Button size="sm" data-testid="button-to-mixer">
              Open Mixer
            </Button>
          </Link>
        </div>
      </header>

      {/* Transport Bar */}
      <TransportBar
        isPlaying={isPlaying}
        bpm={bpm}
        currentStep={currentStep}
        totalSteps={16}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onStop={() => {
          setIsPlaying(false);
          setCurrentStep(-1);
        }}
        onBpmChange={setBpm}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers (Left Side) */}
        <div className="w-64 border-r border-border flex flex-col bg-card/30">
          {/* Header for track controls */}
          <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Tracks
            </span>
            <Button size="sm" variant="ghost" onClick={handleAddTrack} data-testid="button-add-track">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Track List */}
          <div className="flex-1 overflow-y-auto">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="h-16 border-b border-border p-2 flex items-center gap-2 hover:bg-muted/30"
                data-testid={`track-header-${track.id}`}
              >
                <div
                  className="w-1 h-full rounded-full"
                  style={{ backgroundColor: track.color }}
                />

                <div className="flex-1 min-w-0">
                  <Input
                    value={track.instrument}
                    onChange={(e) => {
                      setTracks(prev => prev.map(t =>
                        t.id === track.id ? { ...t, instrument: e.target.value } : t
                      ));
                    }}
                    className="h-7 text-sm font-medium border-none bg-transparent px-1 focus-visible:ring-1"
                    data-testid={`input-track-name-${track.id}`}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={track.solo ? "default" : "outline"}
                      className="h-5 px-1.5 text-xs cursor-pointer hover-elevate"
                      onClick={() => handleSoloToggle(track.id)}
                      data-testid={`badge-solo-${track.id}`}
                    >
                      S
                    </Badge>
                    <Badge
                      variant={track.mute ? "destructive" : "outline"}
                      className="h-5 px-1.5 text-xs cursor-pointer hover-elevate"
                      onClick={() => handleMuteToggle(track.id)}
                      data-testid={`badge-mute-${track.id}`}
                    >
                      M
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={() => handleDeleteTrack(track.id)}
                      data-testid={`button-delete-${track.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="w-16">
                  <Slider
                    value={[track.volume]}
                    onValueChange={([v]) => handleVolumeChange(track.id, v)}
                    min={0}
                    max={1}
                    step={0.01}
                    className="h-8"
                    data-testid={`slider-volume-${track.id}`}
                  />
                  <div className="text-xs text-center text-muted-foreground font-mono mt-0.5">
                    {Math.round(track.volume * 100)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sequencer Grid (Right Side) */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-2 min-w-max">
            {tracks.map((track) => (
              <GridVisualizer
                key={track.id}
                notes={track.notes}
                steps={64}
                currentStep={currentStep % 64}
                onNoteToggle={(step, velocity) => handleNoteToggle(track.id, step, velocity)}
                label={track.instrument}
                color={track.color}
                height={48}
              />
            ))}

            {tracks.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4" data-testid="text-no-tracks">
                  No tracks yet. Click the + button to add a track.
                </p>
                <Button onClick={handleAddTrack} className="gap-2" data-testid="button-add-first-track">
                  <Plus className="w-4 h-4" />
                  Add Your First Track
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
