import { useState } from "react";
import { Link } from "wouter";
import { Home, Download, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { LevelMeter } from "@/components/level-meter";
import { SpectrumAnalyzer } from "@/components/spectrum-analyzer";
import { XYPad } from "@/components/xy-pad";
import { MixerChannel, Effect, XYPadPosition } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INITIAL_CHANNELS: MixerChannel[] = [
  {
    trackId: "track-1",
    volume: 0.8,
    pan: 0,
    solo: false,
    mute: false,
    eq: { low: 0, mid: 0, high: 0, lowPassFreq: 20000, highPassFreq: 20 },
    effects: []
  },
  {
    trackId: "track-2",
    volume: 0.7,
    pan: 0.2,
    solo: false,
    mute: false,
    eq: { low: 0, mid: 0, high: 0, lowPassFreq: 20000, highPassFreq: 20 },
    effects: []
  },
  {
    trackId: "track-3",
    volume: 0.6,
    pan: -0.2,
    solo: false,
    mute: false,
    eq: { low: 0, mid: 0, high: 0, lowPassFreq: 20000, highPassFreq: 20 },
    effects: []
  },
];

const TRACK_NAMES = ["Kick", "Snare", "Hi-Hat"];

export default function Mixer() {
  const [channels, setChannels] = useState<MixerChannel[]>(INITIAL_CHANNELS);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<number>(0);
  const [xyPosition, setXyPosition] = useState<XYPadPosition>({ x: 0.5, y: 0.5 });

  const handleVolumeChange = (index: number, volume: number) => {
    setChannels(prev => prev.map((ch, i) =>
      i === index ? { ...ch, volume } : ch
    ));
  };

  const handlePanChange = (index: number, pan: number) => {
    setChannels(prev => prev.map((ch, i) =>
      i === index ? { ...ch, pan } : ch
    ));
  };

  const handleEQChange = (index: number, band: 'low' | 'mid' | 'high', value: number) => {
    setChannels(prev => prev.map((ch, i) =>
      i === index ? { ...ch, eq: { ...ch.eq, [band]: value } } : ch
    ));
  };

  const handleSoloToggle = (index: number) => {
    setChannels(prev => prev.map((ch, i) =>
      i === index ? { ...ch, solo: !ch.solo } : ch
    ));
  };

  const handleMuteToggle = (index: number) => {
    setChannels(prev => prev.map((ch, i) =>
      i === index ? { ...ch, mute: !ch.mute } : ch
    ));
  };

  const handleAddEffect = (channelIndex: number, effectType: Effect['type']) => {
    const newEffect: Effect = {
      id: `effect-${Date.now()}`,
      type: effectType,
      enabled: true,
      parameters: {}
    };

    setChannels(prev => prev.map((ch, i) =>
      i === channelIndex ? { ...ch, effects: [...ch.effects, newEffect] } : ch
    ));
  };

  const handleToggleEffect = (channelIndex: number, effectId: string) => {
    setChannels(prev => prev.map((ch, i) =>
      i === channelIndex
        ? {
            ...ch,
            effects: ch.effects.map(eff =>
              eff.id === effectId ? { ...eff, enabled: !eff.enabled } : eff
            )
          }
        : ch
    ));
  };

  const handleExport = () => {
    alert('Audio export will be implemented with Tone.js in the integration phase');
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
            <h1 className="text-lg font-semibold" data-testid="text-page-title">Professional Mixer</h1>
            <p className="text-xs text-muted-foreground">Studio-grade mixing & effects</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={isPlaying ? "default" : "secondary"}
            onClick={() => setIsPlaying(!isPlaying)}
            data-testid="button-play"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <div className="w-px h-8 bg-border" />
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2" data-testid="button-export">
            <Download className="w-4 h-4" />
            Export Mix
          </Button>
          <Link href="/sequencer">
            <Button size="sm" data-testid="button-to-sequencer">
              Back to Sequencer
            </Button>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Channel Strips */}
        <div className="flex-1 flex gap-2 p-4 overflow-x-auto bg-muted/20">
          {channels.map((channel, index) => (
            <div
              key={channel.trackId}
              className={`w-20 flex-shrink-0 flex flex-col gap-2 p-2 rounded-md border ${
                selectedChannel === index ? 'border-primary bg-card' : 'border-border bg-card/50'
              } hover-elevate cursor-pointer transition-all`}
              onClick={() => setSelectedChannel(index)}
              data-testid={`channel-strip-${index}`}
            >
              {/* Track Name */}
              <div className="text-xs font-medium text-center truncate" data-testid={`text-channel-name-${index}`}>
                {TRACK_NAMES[index] || `Track ${index + 1}`}
              </div>

              {/* Effects Indicators */}
              <div className="flex flex-wrap gap-1 justify-center min-h-[20px]">
                {channel.effects.map(effect => (
                  <Badge
                    key={effect.id}
                    variant={effect.enabled ? "default" : "outline"}
                    className="h-4 px-1 text-[10px] cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleEffect(index, effect.id);
                    }}
                    data-testid={`badge-effect-${effect.id}`}
                  >
                    {effect.type.slice(0, 3).toUpperCase()}
                  </Badge>
                ))}
              </div>

              {/* Level Meter */}
              <div className="flex-1 flex justify-center items-center py-2">
                <LevelMeter
                  level={channel.mute ? 0 : channel.volume * 0.7}
                  peak={channel.mute ? 0 : channel.volume * 0.85}
                  height={180}
                  width={16}
                />
              </div>

              {/* Volume Fader */}
              <div className="relative h-32">
                <Slider
                  orientation="vertical"
                  value={[channel.volume]}
                  onValueChange={([v]) => handleVolumeChange(index, v)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="h-full"
                  data-testid={`slider-volume-${index}`}
                />
                <div className="text-[10px] text-center text-muted-foreground font-mono mt-1" data-testid={`value-volume-${index}`}>
                  {Math.round(channel.volume * 100)}
                </div>
              </div>

              {/* Pan Knob (simplified as slider) */}
              <div className="space-y-1">
                <Label className="text-[10px] text-center block text-muted-foreground">Pan</Label>
                <Slider
                  value={[channel.pan]}
                  onValueChange={([v]) => handlePanChange(index, v)}
                  min={-1}
                  max={1}
                  step={0.01}
                  className="h-6"
                  data-testid={`slider-pan-${index}`}
                />
                <div className="text-[10px] text-center text-muted-foreground font-mono" data-testid={`value-pan-${index}`}>
                  {channel.pan > 0 ? 'R' : channel.pan < 0 ? 'L' : 'C'}{Math.abs(Math.round(channel.pan * 100))}
                </div>
              </div>

              {/* Solo/Mute */}
              <div className="flex gap-1">
                <Badge
                  variant={channel.solo ? "default" : "outline"}
                  className="flex-1 h-6 justify-center cursor-pointer text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSoloToggle(index);
                  }}
                  data-testid={`badge-solo-${index}`}
                >
                  S
                </Badge>
                <Badge
                  variant={channel.mute ? "destructive" : "outline"}
                  className="flex-1 h-6 justify-center cursor-pointer text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMuteToggle(index);
                  }}
                  data-testid={`badge-mute-${index}`}
                >
                  M
                </Badge>
              </div>
            </div>
          ))}

          {/* Master Channel */}
          <div className="w-32 flex-shrink-0 flex flex-col gap-2 p-3 rounded-md border-2 border-primary bg-card">
            <div className="text-sm font-semibold text-center text-primary" data-testid="text-master-label">
              MASTER
            </div>

            <div className="flex-1 flex justify-center items-center py-2">
              <LevelMeter
                level={masterVolume * 0.8}
                peak={masterVolume * 0.95}
                height={220}
                width={24}
              />
            </div>

            <div className="relative h-40">
              <Slider
                orientation="vertical"
                value={[masterVolume]}
                onValueChange={([v]) => setMasterVolume(v)}
                min={0}
                max={1}
                step={0.01}
                className="h-full"
                data-testid="slider-master-volume"
              />
              <div className="text-xs text-center text-muted-foreground font-mono mt-1" data-testid="value-master-volume">
                {Math.round(masterVolume * 100)}
              </div>
            </div>

            <div className="text-[10px] text-center text-muted-foreground">
              Main Output
            </div>
          </div>
        </div>

        {/* EQ & Effects Panel */}
        <div className="w-96 border-l border-border p-6 overflow-y-auto space-y-6 bg-card/30">
          <div>
            <h2 className="text-lg font-semibold mb-4" data-testid="text-channel-settings-title">
              Channel {selectedChannel + 1} - {TRACK_NAMES[selectedChannel] || `Track ${selectedChannel + 1}`}
            </h2>
          </div>

          {/* EQ Section */}
          <Card data-testid="card-eq">
            <CardHeader>
              <CardTitle className="text-base">3-Band EQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Low</Label>
                  <span className="text-sm font-mono text-muted-foreground" data-testid="value-eq-low">
                    {channels[selectedChannel]?.eq.low.toFixed(1)} dB
                  </span>
                </div>
                <Slider
                  value={[channels[selectedChannel]?.eq.low || 0]}
                  onValueChange={([v]) => handleEQChange(selectedChannel, 'low', v)}
                  min={-12}
                  max={12}
                  step={0.1}
                  data-testid="slider-eq-low"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Mid</Label>
                  <span className="text-sm font-mono text-muted-foreground" data-testid="value-eq-mid">
                    {channels[selectedChannel]?.eq.mid.toFixed(1)} dB
                  </span>
                </div>
                <Slider
                  value={[channels[selectedChannel]?.eq.mid || 0]}
                  onValueChange={([v]) => handleEQChange(selectedChannel, 'mid', v)}
                  min={-12}
                  max={12}
                  step={0.1}
                  data-testid="slider-eq-mid"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>High</Label>
                  <span className="text-sm font-mono text-muted-foreground" data-testid="value-eq-high">
                    {channels[selectedChannel]?.eq.high.toFixed(1)} dB
                  </span>
                </div>
                <Slider
                  value={[channels[selectedChannel]?.eq.high || 0]}
                  onValueChange={([v]) => handleEQChange(selectedChannel, 'high', v)}
                  min={-12}
                  max={12}
                  step={0.1}
                  data-testid="slider-eq-high"
                />
              </div>
            </CardContent>
          </Card>

          {/* Effects Section */}
          <Card data-testid="card-effects">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Effects
                <Select onValueChange={(v) => handleAddEffect(selectedChannel, v as Effect['type'])}>
                  <SelectTrigger className="w-32 h-8" data-testid="select-add-effect">
                    <SelectValue placeholder="Add..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reverb">Reverb</SelectItem>
                    <SelectItem value="delay">Delay</SelectItem>
                    <SelectItem value="distortion">Distortion</SelectItem>
                    <SelectItem value="compression">Compression</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {channels[selectedChannel]?.effects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-effects">
                  No effects added yet
                </p>
              ) : (
                channels[selectedChannel]?.effects.map((effect) => (
                  <div
                    key={effect.id}
                    className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/50"
                    data-testid={`effect-item-${effect.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={effect.enabled}
                        onCheckedChange={() => handleToggleEffect(selectedChannel, effect.id)}
                        data-testid={`switch-effect-${effect.id}`}
                      />
                      <span className="text-sm font-medium capitalize">{effect.type}</span>
                    </div>
                    <Badge variant={effect.enabled ? "default" : "outline"} data-testid={`badge-status-${effect.id}`}>
                      {effect.enabled ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Spectrum Analyzer */}
          <Card data-testid="card-spectrum">
            <CardHeader>
              <CardTitle className="text-base">Spectrum Analyzer</CardTitle>
            </CardHeader>
            <CardContent>
              <SpectrumAnalyzer width={800} height={160} />
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Real-time frequency analysis • Low (purple) to High (cyan)
              </p>
            </CardContent>
          </Card>

          {/* FX Modulation Pad */}
          <Card data-testid="card-fx-pad">
            <CardHeader>
              <CardTitle className="text-base">FX Modulation Pad</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-16">
              <XYPad
                position={xyPosition}
                onPositionChange={setXyPosition}
                parameter1Label="Filter Frequency"
                parameter2Label="Resonance"
                size={300}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
