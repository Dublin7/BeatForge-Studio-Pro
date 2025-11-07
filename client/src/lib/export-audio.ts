import * as Tone from 'tone';
import { DrumTrack } from '@shared/schema';

export async function exportToWAV(
  tracks: DrumTrack[],
  bpm: number,
  duration: number = 8 // Duration in seconds
): Promise<Blob> {
  try {
    // Use Tone.Offline to render audio
    const buffer = await Tone.Offline(
      ({ transport }) => {
        // Set BPM
        transport.bpm.value = bpm;

        // Create synths and channels for each track
        const synths = new Map<string, Tone.ToneAudioNode>();
        const channels = new Map<string, Tone.Channel>();

        tracks.forEach((track) => {
          if (track.mute) return;

          // Create synth based on instrument type
          const synth = createSynthForInstrument(track.instrument);
          const channel = new Tone.Channel({
            volume: Tone.gainToDb(Math.max(0.01, track.volume)),
            pan: track.pan
          }).toDestination();

          synth.connect(channel);
          synths.set(track.id, synth);
          channels.set(track.id, channel);

          // Schedule all notes for this track
          track.notes.forEach((note) => {
            const time = Tone.Time('16n').toSeconds() * note.step;
            const velocity = Math.max(0.1, Math.min(1, note.velocity));

            if (synth instanceof Tone.NoiseSynth) {
              synth.triggerAttackRelease('16n', time, velocity);
            } else if (synth instanceof Tone.MetalSynth) {
              synth.triggerAttackRelease('C6', '16n', time, velocity);
            } else if (synth instanceof Tone.MembraneSynth) {
              synth.triggerAttackRelease('C2', '16n', time, velocity);
            } else if (synth instanceof Tone.Synth) {
              synth.triggerAttackRelease('C4', '16n', time, velocity);
            }
          });
        });

        // Start transport
        transport.start(0);
      },
      duration
    );

    // Convert to WAV blob
    const wavBlob = await bufferToWave(buffer, 0, buffer.length);
    return wavBlob;
  } catch (error) {
    console.error('Error exporting audio:', error);
    throw error;
  }
}

function createSynthForInstrument(instrumentName: string): Tone.Synth | Tone.MembraneSynth | Tone.MetalSynth | Tone.NoiseSynth {
  const lowerName = instrumentName.toLowerCase();

  if (lowerName.includes('kick')) {
    return new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
        attackCurve: 'exponential'
      }
    });
  } else if (lowerName.includes('snare') || lowerName.includes('clap')) {
    return new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.2
      }
    });
  } else if (lowerName.includes('hat') || lowerName.includes('hi-hat')) {
    return new Tone.MetalSynth({
      frequency: 200,
      envelope: {
        attack: 0.001,
        decay: lowerName.includes('open') ? 0.3 : 0.1,
        release: lowerName.includes('open') ? 0.3 : 0.05
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5
    });
  } else if (lowerName.includes('tom')) {
    return new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.8
      }
    });
  } else if (lowerName.includes('rim')) {
    return new Tone.MetalSynth({
      frequency: 400,
      envelope: {
        attack: 0.001,
        decay: 0.05,
        release: 0.05
      },
      harmonicity: 3.1,
      modulationIndex: 16,
      resonance: 3000,
      octaves: 1
    });
  } else {
    return new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      }
    });
  }
}

// Helper function to convert AudioBuffer to WAV Blob
async function bufferToWave(audioBuffer: AudioBuffer, offset: number, length: number): Promise<Blob> {
  const numOfChan = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;
  if (numOfChan === 2) {
    result = interleave(
      audioBuffer.getChannelData(0).slice(offset, offset + length),
      audioBuffer.getChannelData(1).slice(offset, offset + length)
    );
  } else {
    result = audioBuffer.getChannelData(0).slice(offset, offset + length);
  }

  const buffer = new ArrayBuffer(44 + result.length * 2);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + result.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numOfChan, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
  view.setUint16(32, numOfChan * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, result.length * 2, true);

  // Write audio data
  floatTo16BitPCM(view, 44, result);

  return new Blob([buffer], { type: 'audio/wav' });
}

function interleave(inputL: Float32Array, inputR: Float32Array): Float32Array {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array): void {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}
