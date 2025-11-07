import { useState, useRef, useEffect } from "react";
import { PianoNote } from "@shared/schema";

interface PianoRollProps {
  notes: PianoNote[];
  onNotesChange: (notes: PianoNote[]) => void;
  length: number; // Length in beats
  zoom: number;   // Pixels per beat
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_HEIGHT = 16;
const MIN_PITCH = 36; // C2
const MAX_PITCH = 96; // C7
const OCTAVE_COUNT = Math.ceil((MAX_PITCH - MIN_PITCH) / 12);

export function PianoRoll({ notes, onNotesChange, length, zoom }: PianoRollProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);

  const width = length * zoom;
  const height = (MAX_PITCH - MIN_PITCH + 1) * NOTE_HEIGHT;

  useEffect(() => {
    drawPianoRoll();
  }, [notes, zoom, length]);

  const drawPianoRoll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = 'hsl(270, 15%, 6%)';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'hsl(270, 12%, 15%)';
    ctx.lineWidth = 1;

    // Horizontal lines (piano keys)
    for (let i = 0; i <= MAX_PITCH - MIN_PITCH; i++) {
      const y = i * NOTE_HEIGHT;
      const pitch = MAX_PITCH - i;
      const noteInOctave = pitch % 12;
      
      // Highlight white keys
      if (![1, 3, 6, 8, 10].includes(noteInOctave)) {
        ctx.fillStyle = 'hsl(270, 12%, 9%)';
        ctx.fillRect(0, y, width, NOTE_HEIGHT);
      }

      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical lines (beats)
    ctx.strokeStyle = 'hsl(270, 12%, 15%)';
    for (let beat = 0; beat <= length; beat++) {
      const x = beat * zoom;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      
      // Thicker line every 4 beats
      ctx.lineWidth = beat % 4 === 0 ? 2 : 1;
      ctx.stroke();
    }

    // Draw notes
    notes.forEach((note) => {
      const x = note.start * zoom;
      const y = (MAX_PITCH - note.pitch) * NOTE_HEIGHT;
      const w = note.duration * zoom;
      const h = NOTE_HEIGHT - 2;

      // Note rectangle
      const alpha = note.velocity;
      ctx.fillStyle = `hsla(280, 85%, 58%, ${alpha * 0.8})`;
      ctx.fillRect(x, y + 1, w, h);

      // Note border
      ctx.strokeStyle = `hsla(280, 85%, 68%, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y + 1, w, h);
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const beat = Math.floor(x / zoom);
    const pitch = MAX_PITCH - Math.floor(y / NOTE_HEIGHT);

    // Check if clicking existing note
    const clickedNote = notes.find(
      n => 
        pitch === n.pitch &&
        beat >= n.start &&
        beat < n.start + n.duration
    );

    if (clickedNote) {
      // Remove note
      onNotesChange(notes.filter(n => n !== clickedNote));
    } else {
      // Add new note
      const newNote: PianoNote = {
        pitch,
        start: beat,
        duration: 1, // Default 1 beat
        velocity: 0.8,
      };
      onNotesChange([...notes, newNote]);
    }
  };

  const getPitchName = (pitch: number): string => {
    const octave = Math.floor(pitch / 12) - 1;
    const noteName = NOTE_NAMES[pitch % 12];
    return `${noteName}${octave}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground">PIANO ROLL</h3>
        <div className="flex gap-2 text-xs text-muted-foreground font-mono">
          <span>{notes.length} notes</span>
          <span>|</span>
          <span>{length} beats</span>
        </div>
      </div>

      <div className="flex gap-2">
        {/* Piano keys */}
        <div className="flex flex-col" style={{ width: '48px' }}>
          {Array.from({ length: MAX_PITCH - MIN_PITCH + 1 }).map((_, i) => {
            const pitch = MAX_PITCH - i;
            const noteInOctave = pitch % 12;
            const isBlackKey = [1, 3, 6, 8, 10].includes(noteInOctave);

            return (
              <div
                key={pitch}
                className={`flex items-center justify-end px-1 text-xs font-mono ${
                  isBlackKey ? 'bg-card text-muted-foreground' : 'bg-background text-foreground'
                }`}
                style={{ height: `${NOTE_HEIGHT}px`, lineHeight: `${NOTE_HEIGHT}px` }}
              >
                {noteInOctave === 0 && getPitchName(pitch)}
              </div>
            );
          })}
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-x-auto border border-border rounded-md">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            onClick={handleCanvasClick}
            className="cursor-crosshair"
            data-testid="piano-roll-canvas"
          />
        </div>
      </div>
    </div>
  );
}
