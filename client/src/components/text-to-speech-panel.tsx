import { useState } from "react";
import { Mic2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import * as Tone from "tone";

interface TextToSpeechPanelProps {
  onAudioGenerated: (buffer: AudioBuffer, filename: string) => void;
}

export function TextToSpeechPanel({ onAudioGenerated }: TextToSpeechPanelProps) {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({
        title: "No text provided",
        description: "Please enter some text to convert to speech",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      onAudioGenerated(audioBuffer, `TTS_${voice}_${Date.now()}`);

      toast({
        title: "Speech generated",
        description: `Generated ${audioBuffer.duration.toFixed(2)}s of audio`,
      });

      setText("");
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Mic2 className="w-5 h-5" />
          Text-to-Speech
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm mb-2 block">Voice</Label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger data-testid="select-tts-voice">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
              <SelectItem value="echo">Echo (Male)</SelectItem>
              <SelectItem value="fable">Fable (British Male)</SelectItem>
              <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
              <SelectItem value="nova">Nova (Female)</SelectItem>
              <SelectItem value="shimmer">Shimmer (Soft Female)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm mb-2 block">Text to Convert</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to convert to speech..."
            className="min-h-[120px]"
            data-testid="textarea-tts-text"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {text.length} characters
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!text.trim() || isGenerating}
          className="w-full"
          data-testid="button-generate-speech"
        >
          {isGenerating ? (
            <>Processing...</>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Speech
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Powered by OpenAI • High-quality AI voices
        </p>
      </CardContent>
    </Card>
  );
}
