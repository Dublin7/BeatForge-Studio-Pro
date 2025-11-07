import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { audioEngine } from "@/lib/audio-engine";
import { useBeatGenerator } from "@/lib/use-beat-generator";
import { Home, Download, Play, Pause, Wand2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GridVisualizer } from "@/components/grid-visualizer";
import { BeatGeneratorParams, DrumTrack } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

const INSTRUMENTS = [
  { name: "Kick", color: "hsl(280, 85%, 58%)" },
  { name: "Snare", color: "hsl(160, 70%, 55%)" },
  { name: "Hi-Hat Closed", color: "hsl(50, 95%, 60%)" },
  { name: "Hi-Hat Open", color: "hsl(200, 80%, 60%)" },
  { name: "Clap", color: "hsl(340, 75%, 68%)" },
  { name: "Rim", color: "hsl(32, 85%, 65%)" },
  { name: "Tom High", color: "hsl(280, 60%, 65%)" },
  { name: "Tom Low", color: "hsl(220, 70%, 60%)" },
];

export default function BeatGenerator() {
  const [genre, setGenre] = useState<BeatGeneratorParams['genre']>('hip-hop');
  const [complexity, setComplexity] = useState(0.5);
  const [swing, setSwing] = useState(0.3);
  const [density, setDensity] = useState(0.6);
  const [variation, setVariation] = useState(0.4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [tracks, setTracks] = useState<DrumTrack[]>([]);

  const { mutate: generateBeat, isPending: isGenerating } = useBeatGenerator();

  // Initialize audio engine
  useEffect(() => {
    audioEngine.initialize().catch(console.error);
    audioEngine.setBPM(120);

    return () => {
      audioEngine.stop();
    };
  }, []);

  // Setup audio when tracks change
  useEffect(() => {
    if (tracks.length > 0) {
      audioEngine.setupTracks(tracks);
      audioEngine.setupSequence(tracks, 16);
    }
  }, [tracks]);

  // Handle playback
  useEffect(() => {
    if (isPlaying) {
      audioEngine.play();
      
      const interval = setInterval(() => {
        setCurrentStep(audioEngine.getCurrentStep());
      }, 100);

      return () => clearInterval(interval);
    } else {
      audioEngine.pause();
    }
  }, [isPlaying]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlayPause: () => setIsPlaying(prev => !prev),
    onStop: () => {
      setIsPlaying(false);
      setCurrentStep(-1);
    }
  });

  const handleGenerate = () => {
    generateBeat(
      { genre, complexity, swing, density, variation },
      {
        onSuccess: (data) => {
          console.log('Beat generation response:', data);
          
          // Validate response structure
          if (!data || !data.pattern || !Array.isArray(data.pattern.tracks)) {
            console.error('Invalid response structure:', data);
            alert('Received invalid response from server. Please try again.');
            return;
          }

          setTracks(data.pattern.tracks);
          localStorage.setItem('beatforge-last-pattern', JSON.stringify(data.pattern));
        },
        onError: (error) => {
          console.error('Beat generation error:', error);
          alert(error instanceof Error ? error.message : 'Failed to generate beat. Please try again.');
        }
      }
    );
  };

  const handleExport = async () => {
    // Offer choice between JSON and WAV export
    const choice = confirm('Export as audio (WAV)? Click Cancel for JSON export.');
    
    if (choice && tracks.length > 0) {
      // Export as WAV
      try {
        const { exportToWAV } = await import('@/lib/export-audio');
        const wavBlob = await exportToWAV(tracks, 120, 4);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beatforge-${genre}-pattern.wav`;
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
      // Export pattern as JSON
      const data = {
        tracks,
        genre,
        bpm: 120,
        parameters: { genre, complexity, swing, density, variation }
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beatforge-${genre}-pattern.json`;
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
          <div>
            <h1 className="text-lg font-semibold" data-testid="text-page-title">AI Beat Generator</h1>
            <p className="text-xs text-muted-foreground">Create intelligent drum patterns</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono" data-testid="badge-genre">
            {genre.toUpperCase()}
          </Badge>
          <Link href="/sequencer">
            <Button variant="outline" size="sm" data-testid="button-to-sequencer">
              Open in Sequencer
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Panel - Controls */}
        <div className="w-80 border-r border-border p-6 flex flex-col gap-6 overflow-y-auto">
          <Card data-testid="card-genre-settings">
            <CardHeader>
              <CardTitle className="text-base">Genre & Style</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Select value={genre} onValueChange={(v) => setGenre(v as any)}>
                  <SelectTrigger id="genre" data-testid="select-genre">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hip-hop">Hip-Hop</SelectItem>
                    <SelectItem value="trap">Trap</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="techno">Techno</SelectItem>
                    <SelectItem value="dnb">Drum & Bass</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-parameters">
            <CardHeader>
              <CardTitle className="text-base">Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="complexity">Complexity</Label>
                  <span className="text-sm font-mono text-muted-foreground" data-testid="value-complexity">
                    {Math.round(complexity * 100)}%
                  </span>
                </div>
                <Slider
                  id="complexity"
                  value={[complexity]}
                  onValueChange={([v]) => setComplexity(v)}
                  min={0}
                  max={1}
                  step={0.01}
                  data-testid="slider-complexity"
                />
                <p className="text-xs text-muted-foreground">
                  More complex patterns have additional fills and variations
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="swing">Swing</Label>
                  <span className="text-sm font-mono text-muted-foreground" data-testid="value-swing">
                    {Math.round(swing * 100)}%
                  </span>
                </div>
                <Slider
                  id="swing"
                  value={[swing]}
                  onValueChange={([v]) => setSwing(v)}
                  min={0}
                  max={1}
                  step={0.01}
                  data-testid="slider-swing"
                />
                <p className="text-xs text-muted-foreground">
                  Adds groove by delaying off-beat notes
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="density">Density</Label>
                  <span className="text-sm font-mono text-muted-foreground" data-testid="value-density">
                    {Math.round(density * 100)}%
                  </span>
                </div>
                <Slider
                  id="density"
                  value={[density]}
                  onValueChange={([v]) => setDensity(v)}
                  min={0}
                  max={1}
                  step={0.01}
                  data-testid="slider-density"
                />
                <p className="text-xs text-muted-foreground">
                  Controls how many notes are in the pattern
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="variation">Variation</Label>
                  <span className="text-sm font-mono text-muted-foreground" data-testid="value-variation">
                    {Math.round(variation * 100)}%
                  </span>
                </div>
                <Slider
                  id="variation"
                  value={[variation]}
                  onValueChange={([v]) => setVariation(v)}
                  min={0}
                  max={1}
                  step={0.01}
                  data-testid="slider-variation"
                />
                <p className="text-xs text-muted-foreground">
                  How much the pattern changes over time
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2"
              size="lg"
              data-testid="button-generate"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate Beat
                </>
              )}
            </Button>

            {tracks.length > 0 && (
              <Button
                onClick={handleExport}
                variant="outline"
                className="w-full gap-2"
                data-testid="button-export"
              >
                <Download className="w-4 h-4" />
                Export Pattern
              </Button>
            )}
          </div>
        </div>

        {/* Center - Pattern Visualization */}
        <div className="flex-1 flex flex-col">
          {/* Playback Controls */}
          <div className="border-b border-border p-4 flex items-center gap-4">
            <Button
              size="icon"
              variant={isPlaying ? "default" : "secondary"}
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={tracks.length === 0}
              data-testid="button-play"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>

            <div className="text-sm text-muted-foreground">
              {tracks.length === 0 ? (
                <span data-testid="text-empty-state">Generate a beat to get started</span>
              ) : (
                <span data-testid="text-track-count">{tracks.length} tracks, 16 steps</span>
              )}
            </div>
          </div>

          {/* Pattern Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {tracks.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Wand2 className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2" data-testid="text-empty-title">
                    Ready to Create
                  </h3>
                  <p className="text-muted-foreground mb-6" data-testid="text-empty-description">
                    Choose your genre and adjust the parameters on the left, 
                    then click Generate Beat to create an AI-powered drum pattern.
                  </p>
                  <Button onClick={handleGenerate} className="gap-2" data-testid="button-generate-empty">
                    <Wand2 className="w-4 h-4" />
                    Generate Your First Beat
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-5xl">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-lg font-semibold" data-testid="text-pattern-title">Generated Pattern</h2>
                  <Badge variant="outline" data-testid="badge-step-indicator">
                    Step {currentStep + 1} / 16
                  </Badge>
                </div>

                {tracks.map((track, idx) => (
                  <GridVisualizer
                    key={track.id}
                    notes={track.notes}
                    steps={16}
                    currentStep={currentStep}
                    label={track.instrument}
                    color={INSTRUMENTS[idx % INSTRUMENTS.length]?.color || "hsl(var(--primary))"}
                    height={40}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Presets & Export */}
        <div className="w-64 border-l border-border p-6 flex flex-col gap-6 overflow-y-auto">
          <Card data-testid="card-quick-presets">
            <CardHeader>
              <CardTitle className="text-base">Quick Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setGenre('hip-hop');
                  setComplexity(0.4);
                  setSwing(0.3);
                  setDensity(0.5);
                  setVariation(0.3);
                }}
                data-testid="button-preset-boom-bap"
              >
                Boom Bap
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setGenre('trap');
                  setComplexity(0.6);
                  setSwing(0.5);
                  setDensity(0.7);
                  setVariation(0.5);
                }}
                data-testid="button-preset-trap"
              >
                Trap Bangers
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setGenre('house');
                  setComplexity(0.3);
                  setSwing(0.2);
                  setDensity(0.8);
                  setVariation(0.2);
                }}
                data-testid="button-preset-four-floor"
              >
                Four on Floor
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setGenre('dnb');
                  setComplexity(0.8);
                  setSwing(0.1);
                  setDensity(0.9);
                  setVariation(0.6);
                }}
                data-testid="button-preset-breakbeat"
              >
                Breakbeat
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-info">
            <CardHeader>
              <CardTitle className="text-base">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Complexity:</strong> Start low for simple grooves, increase for intricate patterns
              </p>
              <p>
                <strong className="text-foreground">Swing:</strong> Around 30% gives classic hip-hop feel
              </p>
              <p>
                <strong className="text-foreground">Density:</strong> Less is often more — leave room for other instruments
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
