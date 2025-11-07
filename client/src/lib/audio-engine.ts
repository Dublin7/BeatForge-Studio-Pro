import * as Tone from 'tone';
import { DrumTrack, SequencerTrack, Effect } from '@shared/schema';

class AudioEngine {
  private transport: typeof Tone.Transport;
  private samplers: Map<string, Tone.Sampler>;
  private channels: Map<string, Tone.Channel>;
  private masterChannel: Tone.Channel;
  private effects: Map<string, Tone.ToneAudioNode>;
  private isInitialized: boolean = false;
  private currentSequence: Tone.Sequence | null = null;

  constructor() {
    this.transport = Tone.getTransport();
    this.samplers = new Map();
    this.channels = new Map();
    this.effects = new Map();
    this.masterChannel = new Tone.Channel().toDestination();
    this.masterChannel.volume.value = -6; // Slight reduction for headroom
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      await Tone.start();
      console.log('Tone.js initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Tone.js:', error);
      throw error;
    }
  }

  createDrumSampler(instrumentName: string): Tone.Synth | Tone.MembraneSynth | Tone.MetalSynth | Tone.NoiseSynth {
    // Create synthesized drum sounds using Tone.js synths
    // This provides actual audio output without requiring sample files
    const lowerName = instrumentName.toLowerCase();

    if (lowerName.includes('kick')) {
      // Deep kick drum using membrane synth
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
      // Snare/clap using noise synth
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
      // Hi-hat using metal synth
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
      // Tom using membrane synth at higher pitch
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
      // Rim shot using metal synth
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
      // Default percussion sound
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

  setupTracks(tracks: DrumTrack[]) {
    // Clear existing setup
    this.stop();
    this.clearTracks();

    tracks.forEach(track => {
      // Create synth for this track
      const synth = this.createDrumSampler(track.instrument);
      
      // Create channel with volume and pan
      const channel = new Tone.Channel({
        volume: Tone.gainToDb(Math.max(0.01, track.volume)),
        pan: track.pan
      });

      // Create effects chain if track has effects
      let currentNode: Tone.ToneAudioNode = synth;
      
      track.effects?.forEach((effect) => {
        if (!effect.enabled) return;

        let effectNode: Tone.ToneAudioNode | null = null;
        const params = effect.parameters || {};

        switch (effect.type) {
          case 'reverb':
            effectNode = new Tone.Reverb({
              decay: typeof params.decay === 'number' ? params.decay : 1.5,
              wet: typeof params.mix === 'number' ? params.mix : 0.3
            });
            break;
          case 'delay':
            effectNode = new Tone.FeedbackDelay({
              delayTime: typeof params.time === 'number' ? params.time : 0.25,
              feedback: typeof params.feedback === 'number' ? params.feedback : 0.3,
              wet: typeof params.mix === 'number' ? params.mix : 0.3
            });
            break;
          case 'distortion':
            effectNode = new Tone.Distortion({
              distortion: typeof params.drive === 'number' ? params.drive : 0.4,
              wet: typeof params.mix === 'number' ? params.mix : 0.5
            });
            break;
          case 'compression':
            effectNode = new Tone.Compressor({
              threshold: -24,
              ratio: typeof params.ratio === 'number' ? params.ratio : 4,
              attack: 0.003,
              release: 0.25
            });
            break;
        }

        if (effectNode) {
          currentNode.connect(effectNode);
          currentNode = effectNode;
          this.effects.set(`${track.id}-${effect.type}`, effectNode);
        }
      });

      // Connect final node to channel
      currentNode.connect(channel);
      channel.connect(this.masterChannel);

      this.samplers.set(track.id, synth as any);
      this.channels.set(track.id, channel);
    });
  }

  setupSequence(tracks: DrumTrack[], steps: number = 64) {
    if (this.currentSequence) {
      this.currentSequence.dispose();
    }

    // Create time array for all steps
    const times = Array.from({ length: steps }, (_, i) => i);

    this.currentSequence = new Tone.Sequence(
      (time, step) => {
        tracks.forEach(track => {
          if (track.mute) return;

          const note = track.notes.find(n => n.step === step);
          if (note && note.velocity > 0) {
            const synth = this.samplers.get(track.id) as any;
            if (synth) {
              const velocity = Math.max(0.1, Math.min(1, note.velocity));
              
              // Different trigger methods for different synth types
              if (synth instanceof Tone.NoiseSynth) {
                synth.triggerAttackRelease('16n', time, velocity);
              } else if (synth instanceof Tone.MetalSynth) {
                synth.triggerAttackRelease('C6', '16n', time, velocity);
              } else if (synth instanceof Tone.MembraneSynth) {
                synth.triggerAttackRelease('C2', '16n', time, velocity);
              } else {
                synth.triggerAttackRelease('C4', '16n', time, velocity);
              }
            }
          }
        });
      },
      times,
      '16n'
    ).start(0);
  }

  play() {
    if (!this.isInitialized) {
      console.warn('Audio engine not initialized');
      return;
    }
    this.transport.start();
  }

  pause() {
    this.transport.pause();
  }

  stop() {
    this.transport.stop();
    this.transport.position = 0;
  }

  setBPM(bpm: number) {
    this.transport.bpm.value = bpm;
  }

  setTrackVolume(trackId: string, volume: number) {
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.volume.value = Tone.gainToDb(volume);
    }
  }

  setTrackPan(trackId: string, pan: number) {
    const channel = this.channels.get(trackId);
    if (channel) {
      channel.pan.value = pan;
    }
  }

  setMasterVolume(volume: number) {
    this.masterChannel.volume.value = Tone.gainToDb(volume);
  }

  clearTracks() {
    this.samplers.forEach(sampler => sampler.dispose());
    this.channels.forEach(channel => channel.dispose());
    this.effects.forEach(effect => effect.dispose());
    this.samplers.clear();
    this.channels.clear();
    this.effects.clear();
  }

  getCurrentStep(): number {
    const position = this.transport.position as string;
    const [bars, beats, sixteenths] = position.split(':').map(Number);
    return Math.floor((bars * 16 + beats * 4 + sixteenths * 16) % 16);
  }

  get isPlaying(): boolean {
    return this.transport.state === 'started';
  }

  dispose() {
    this.stop();
    this.clearTracks();
    if (this.currentSequence) {
      this.currentSequence.dispose();
    }
    this.masterChannel.dispose();
  }
}

// Singleton instance
export const audioEngine = new AudioEngine();

// Hook for React components
export function useAudioEngine() {
  return audioEngine;
}
