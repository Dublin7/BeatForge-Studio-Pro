import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { Home, Upload, Play, Pause, Square, Download, Scissors, Merge, RotateCcw, Zap, Mic, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WaveformVisualizer } from "@/components/waveform-visualizer";
import { AudioRecorder } from "@/components/audio-recorder";
import { AudioEffectsPanel } from "@/components/audio-effects-panel";
import { TextToSpeechPanel } from "@/components/text-to-speech-panel";
import * as Tone from "tone";
import { useToast } from "@/hooks/use-toast";

export default function AudioEditor() {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<Tone.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [selectionStart, setSelectionStart] = useState<number | undefined>();
  const [selectionEnd, setSelectionEnd] = useState<number | undefined>();
  const [fileName, setFileName] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await Tone.start();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = await Tone.context.decodeAudioData(arrayBuffer);
      
      setAudioBuffer(buffer);
      setFileName(file.name);
      
      const player = new Tone.Player({
        url: buffer,
        loop: false,
      }).toDestination();
      
      setAudioPlayer(player);
      
      toast({
        title: "Audio loaded",
        description: `${file.name} (${buffer.duration.toFixed(2)}s)`,
      });
    } catch (error) {
      toast({
        title: "Error loading audio",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handlePlay = useCallback(async () => {
    if (!audioPlayer) return;
    
    await Tone.start();
    
    if (isPlaying) {
      audioPlayer.stop();
      setIsPlaying(false);
    } else {
      const startTime = selectionStart !== undefined ? selectionStart : 0;
      const duration = selectionEnd !== undefined && selectionStart !== undefined 
        ? selectionEnd - selectionStart 
        : undefined;
      
      audioPlayer.start(undefined, startTime, duration);
      setIsPlaying(true);
      
      audioPlayer.onstop = () => {
        setIsPlaying(false);
        setPlaybackPosition(0);
      };
    }
  }, [audioPlayer, isPlaying, selectionStart, selectionEnd]);

  const handleStop = useCallback(() => {
    if (audioPlayer) {
      audioPlayer.stop();
      setIsPlaying(false);
      setPlaybackPosition(0);
    }
  }, [audioPlayer]);

  const handleTrim = useCallback(() => {
    if (!audioBuffer || selectionStart === undefined || selectionEnd === undefined) {
      toast({
        title: "No selection",
        description: "Please select a region to trim",
        variant: "destructive",
      });
      return;
    }

    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.floor(selectionStart * sampleRate);
    const endSample = Math.floor(selectionEnd * sampleRate);
    const newLength = endSample - startSample;

    const newBuffer = Tone.context.createBuffer(
      audioBuffer.numberOfChannels,
      newLength,
      sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const oldData = audioBuffer.getChannelData(channel);
      const newData = newBuffer.getChannelData(channel);
      for (let i = 0; i < newLength; i++) {
        newData[i] = oldData[startSample + i];
      }
    }

    setAudioBuffer(newBuffer);
    setSelectionStart(undefined);
    setSelectionEnd(undefined);
    
    if (audioPlayer) {
      audioPlayer.dispose();
    }
    
    const player = new Tone.Player({
      url: newBuffer,
      loop: false,
    }).toDestination();
    
    setAudioPlayer(player);

    toast({
      title: "Audio trimmed",
      description: `New duration: ${newBuffer.duration.toFixed(2)}s`,
    });
  }, [audioBuffer, selectionStart, selectionEnd, audioPlayer, toast]);

  const handleAutoTrim = useCallback(() => {
    if (!audioBuffer) return;

    const channelData = audioBuffer.getChannelData(0);
    const threshold = 0.01;
    
    let start = 0;
    let end = channelData.length - 1;

    for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]) > threshold) {
        start = i;
        break;
      }
    }

    for (let i = channelData.length - 1; i >= 0; i--) {
      if (Math.abs(channelData[i]) > threshold) {
        end = i;
        break;
      }
    }

    const sampleRate = audioBuffer.sampleRate;
    const startTime = start / sampleRate;
    const endTime = end / sampleRate;

    setSelectionStart(startTime);
    setSelectionEnd(endTime);

    toast({
      title: "AI Auto-trim",
      description: `Detected audio from ${startTime.toFixed(2)}s to ${endTime.toFixed(2)}s`,
    });
  }, [audioBuffer, toast]);

  const handleExport = useCallback(() => {
    if (!audioBuffer) return;

    const length = audioBuffer.length;
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    
    const wavBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(wavBuffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const int16 = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
        view.setInt16(offset, int16, true);
        offset += 2;
      }
    }

    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.[^/.]+$/, '') + '_edited.wav';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: "Audio file downloaded",
    });
  }, [audioBuffer, fileName, toast]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-home">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Audio Editor</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline"
              data-testid="button-upload"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="input-file"
            />
          </div>
        </div>

        {audioBuffer ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {fileName || "Untitled"}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground font-mono">
                    Duration: {audioBuffer.duration.toFixed(2)}s
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-card-elevated rounded-md p-4">
                  <WaveformVisualizer
                    audioBuffer={audioBuffer}
                    width={1000}
                    height={150}
                    playbackPosition={playbackPosition}
                    selectionStart={selectionStart}
                    selectionEnd={selectionEnd}
                    onSelectionChange={(start, end) => {
                      setSelectionStart(start);
                      setSelectionEnd(end);
                    }}
                    zoom={zoom}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePlay}
                      size="icon"
                      variant="default"
                      data-testid="button-play"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      onClick={handleStop}
                      size="icon"
                      variant="outline"
                      data-testid="button-stop"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Zoom</Label>
                    <Slider
                      value={[zoom]}
                      onValueChange={([v]) => setZoom(v)}
                      min={1}
                      max={10}
                      step={0.5}
                      className="w-full"
                      data-testid="slider-zoom"
                    />
                  </div>
                </div>

                {selectionStart !== undefined && selectionEnd !== undefined && (
                  <div className="text-sm text-muted-foreground font-mono">
                    Selection: {selectionStart.toFixed(2)}s - {selectionEnd.toFixed(2)}s ({(selectionEnd - selectionStart).toFixed(2)}s)
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="edit" data-testid="tab-edit">
                  <Scissors className="w-4 h-4 mr-2" />
                  Edit Tools
                </TabsTrigger>
                <TabsTrigger value="effects" data-testid="tab-effects">
                  <Zap className="w-4 h-4 mr-2" />
                  Effects
                </TabsTrigger>
                <TabsTrigger value="ai" data-testid="tab-ai">
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI Tools
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover-elevate">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Trim Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleTrim}
                    className="w-full"
                    disabled={selectionStart === undefined || selectionEnd === undefined}
                    data-testid="button-trim"
                  >
                    Apply Trim
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    AI Auto-Trim
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleAutoTrim}
                    className="w-full"
                    variant="outline"
                    data-testid="button-auto-trim"
                  >
                    Detect Silence
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Clear Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => {
                      setSelectionStart(undefined);
                      setSelectionEnd(undefined);
                    }}
                    className="w-full"
                    variant="outline"
                    data-testid="button-clear-selection"
                  >
                    Clear
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleExport}
                    className="w-full"
                    data-testid="button-export"
                  >
                    Download WAV
                  </Button>
                </CardContent>
              </Card>
            </div>
              </TabsContent>

              <TabsContent value="effects" className="mt-4">
                <AudioEffectsPanel 
                  audioBuffer={audioBuffer} 
                  onProcessedAudio={(buffer) => {
                    setAudioBuffer(buffer);
                    setFileName(fileName + " (processed)");
                    
                    if (audioPlayer) {
                      audioPlayer.dispose();
                    }
                    
                    const player = new Tone.Player({
                      url: buffer,
                      loop: false,
                    }).toDestination();
                    
                    setAudioPlayer(player);
                    
                    toast({
                      title: "Effect applied",
                      description: "Audio has been processed",
                    });
                  }}
                />
              </TabsContent>

              <TabsContent value="ai" className="mt-4">
                <TextToSpeechPanel
                  onAudioGenerated={(buffer, filename) => {
                    setAudioBuffer(buffer);
                    setFileName(filename);
                    
                    if (audioPlayer) {
                      audioPlayer.dispose();
                    }
                    
                    const player = new Tone.Player({
                      url: buffer,
                      loop: false,
                    }).toDestination();
                    
                    setAudioPlayer(player);
                  }}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-8">
              <div className="text-center space-y-4">
                <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Upload Audio</h2>
                  <p className="text-muted-foreground mb-4">
                    Load an existing audio file to edit
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()} data-testid="button-upload-empty" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                </div>
              </div>
            </Card>

            <AudioRecorder 
              onRecordingComplete={(blob, buffer) => {
                setAudioBuffer(buffer);
                setFileName("Recording " + new Date().toLocaleTimeString());
                
                const player = new Tone.Player({
                  url: buffer,
                  loop: false,
                }).toDestination();
                
                setAudioPlayer(player);
                
                toast({
                  title: "Recording complete",
                  description: `Duration: ${buffer.duration.toFixed(2)}s`,
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
