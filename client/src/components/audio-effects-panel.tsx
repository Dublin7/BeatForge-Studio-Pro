import { useState, useEffect } from "react";
import { Sliders, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as Tone from "tone";

interface AudioEffectsPanelProps {
  audioBuffer: AudioBuffer | null;
  onProcessedAudio: (buffer: AudioBuffer) => void;
}

export function AudioEffectsPanel({ audioBuffer, onProcessedAudio }: AudioEffectsPanelProps) {
  const [pitchShift, setPitchShift] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [voiceEffect, setVoiceEffect] = useState("normal");
  const [isProcessing, setIsProcessing] = useState(false);

  const applyPitchShift = async () => {
    if (!audioBuffer) return;
    
    setIsProcessing(true);
    
    try {
      const player = new Tone.Player(audioBuffer);
      const pitchShifter = new Tone.PitchShift(pitchShift);
      const recorder = new Tone.Recorder();
      
      player.chain(pitchShifter, recorder);
      
      recorder.start();
      await player.start();
      
      await new Promise(resolve => setTimeout(resolve, audioBuffer.duration * 1000 + 100));
      
      const recording = await recorder.stop();
      const arrayBuffer = await recording.arrayBuffer();
      const processedBuffer = await Tone.context.decodeAudioData(arrayBuffer);
      
      onProcessedAudio(processedBuffer);
      
      player.dispose();
      pitchShifter.dispose();
      recorder.dispose();
    } catch (error) {
      console.error('Pitch shift error:', error);
    }
    
    setIsProcessing(false);
  };

  const applySpeedChange = async () => {
    if (!audioBuffer) return;
    
    setIsProcessing(true);
    
    try {
      const sampleRate = audioBuffer.sampleRate;
      const newLength = Math.floor(audioBuffer.length / playbackRate);
      const newBuffer = Tone.context.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        sampleRate
      );

      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const oldData = audioBuffer.getChannelData(channel);
        const newData = newBuffer.getChannelData(channel);
        
        for (let i = 0; i < newLength; i++) {
          const oldIndex = Math.floor(i * playbackRate);
          if (oldIndex < oldData.length) {
            newData[i] = oldData[oldIndex];
          }
        }
      }

      onProcessedAudio(newBuffer);
    } catch (error) {
      console.error('Speed change error:', error);
    }
    
    setIsProcessing(false);
  };

  const applyReverse = () => {
    if (!audioBuffer) return;
    
    const newBuffer = Tone.context.createBuffer(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const oldData = audioBuffer.getChannelData(channel);
      const newData = newBuffer.getChannelData(channel);
      
      for (let i = 0; i < audioBuffer.length; i++) {
        newData[i] = oldData[audioBuffer.length - 1 - i];
      }
    }

    onProcessedAudio(newBuffer);
  };

  const applyVoiceEffect = async () => {
    if (!audioBuffer || voiceEffect === "normal") return;
    
    setIsProcessing(true);
    
    try {
      const player = new Tone.Player(audioBuffer);
      const recorder = new Tone.Recorder();
      
      if (voiceEffect === "robot") {
        const bitCrusher = new Tone.BitCrusher(4);
        const distortion = new Tone.Distortion(0.8);
        player.chain(bitCrusher, distortion, recorder);
      } else if (voiceEffect === "deep") {
        const pitchShifter = new Tone.PitchShift(-7);
        player.chain(pitchShifter, recorder);
      } else if (voiceEffect === "chipmunk") {
        const pitchShifter = new Tone.PitchShift(7);
        player.chain(pitchShifter, recorder);
      } else if (voiceEffect === "echo") {
        const delay = new Tone.FeedbackDelay("8n", 0.5);
        player.chain(delay, recorder);
      }
      
      recorder.start();
      await player.start();
      
      await new Promise(resolve => setTimeout(resolve, audioBuffer.duration * 1000 + 100));
      
      const recording = await recorder.stop();
      const arrayBuffer = await recording.arrayBuffer();
      const processedBuffer = await Tone.context.decodeAudioData(arrayBuffer);
      
      onProcessedAudio(processedBuffer);
      
      player.dispose();
      recorder.dispose();
    } catch (error) {
      console.error('Voice effect error:', error);
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sliders className="w-5 h-5" />
            Pitch & Speed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Pitch Shift</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {pitchShift > 0 ? '+' : ''}{pitchShift} semitones
              </span>
            </div>
            <Slider
              value={[pitchShift]}
              onValueChange={([v]) => setPitchShift(v)}
              min={-12}
              max={12}
              step={1}
              disabled={!audioBuffer}
              data-testid="slider-pitch-shift"
            />
            <Button
              onClick={applyPitchShift}
              disabled={!audioBuffer || pitchShift === 0 || isProcessing}
              className="w-full mt-2"
              variant="outline"
              data-testid="button-apply-pitch"
            >
              Apply Pitch Shift
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm">Speed</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {playbackRate.toFixed(2)}x
              </span>
            </div>
            <Slider
              value={[playbackRate]}
              onValueChange={([v]) => setPlaybackRate(v)}
              min={0.5}
              max={2}
              step={0.1}
              disabled={!audioBuffer}
              data-testid="slider-speed"
            />
            <Button
              onClick={applySpeedChange}
              disabled={!audioBuffer || playbackRate === 1 || isProcessing}
              className="w-full mt-2"
              variant="outline"
              data-testid="button-apply-speed"
            >
              Apply Speed Change
            </Button>
          </div>

          <Button
            onClick={applyReverse}
            disabled={!audioBuffer || isProcessing}
            className="w-full"
            variant="outline"
            data-testid="button-reverse"
          >
            Reverse Audio
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Voice Effects
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm mb-2 block">Effect Type</Label>
            <Select value={voiceEffect} onValueChange={setVoiceEffect}>
              <SelectTrigger data-testid="select-voice-effect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="robot">Robot Voice</SelectItem>
                <SelectItem value="deep">Deep Voice</SelectItem>
                <SelectItem value="chipmunk">Chipmunk</SelectItem>
                <SelectItem value="echo">Echo Effect</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={applyVoiceEffect}
            disabled={!audioBuffer || voiceEffect === "normal" || isProcessing}
            className="w-full"
            data-testid="button-apply-voice-effect"
          >
            {isProcessing ? "Processing..." : "Apply Voice Effect"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
