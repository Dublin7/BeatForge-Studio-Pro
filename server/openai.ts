import OpenAI from "openai";
import pLimit from "p-limit";
import pRetry from "p-retry";
import { BeatGeneratorParams, AIBeatResponse, DrumTrack } from "@shared/schema";

// Following the javascript_openai_ai_integrations blueprint
// This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});

// Helper function to check if error is rate limit or quota violation
function isRateLimitError(error: any): boolean {
  const errorMsg = error?.message || String(error);
  return (
    errorMsg.includes("429") ||
    errorMsg.includes("RATELIMIT_EXCEEDED") ||
    errorMsg.toLowerCase().includes("quota") ||
    errorMsg.toLowerCase().includes("rate limit")
  );
}

const GENRE_DESCRIPTIONS: Record<BeatGeneratorParams['genre'], string> = {
  'hip-hop': 'Classic hip-hop with boom-bap drums, emphasis on kick and snare on 2 and 4, with sparse hi-hats',
  'trap': 'Modern trap with heavy 808 kicks, rapid hi-hat rolls, snare on 3, and syncopated rhythms',
  'house': 'Four-on-the-floor house beat with kick on every beat, open hi-hats on off-beats, and claps on 2 and 4',
  'techno': 'Driving techno with steady kick drum, minimal percussion, and emphasis on groove and repetition',
  'dnb': 'Drum and bass with breakbeat patterns at high BPM, complex snare/kick patterns, and rapid hi-hats',
  'custom': 'Creative and experimental drum pattern with unique rhythmic elements'
};

const INSTRUMENTS = [
  "Kick",
  "Snare",
  "Hi-Hat Closed",
  "Hi-Hat Open",
  "Clap",
  "Rim",
  "Tom High",
  "Tom Low"
];

const INSTRUMENT_COLORS = [
  "hsl(280, 85%, 58%)",
  "hsl(160, 70%, 55%)",
  "hsl(50, 95%, 60%)",
  "hsl(200, 80%, 60%)",
  "hsl(340, 75%, 68%)",
  "hsl(32, 85%, 65%)",
  "hsl(280, 60%, 65%)",
  "hsl(220, 70%, 60%)"
];

export async function generateBeatPattern(params: BeatGeneratorParams): Promise<AIBeatResponse> {
  const { genre, complexity, swing, density, variation } = params;

  // Create a detailed prompt for the AI
  const prompt = `You are a professional music producer creating drum patterns. Generate a 16-step drum pattern for ${genre} music.

Genre style: ${GENRE_DESCRIPTIONS[genre]}

Parameters:
- Complexity: ${(complexity * 100).toFixed(0)}% (${complexity < 0.3 ? 'simple' : complexity < 0.7 ? 'moderate' : 'complex'})
- Swing: ${(swing * 100).toFixed(0)}% (${swing < 0.3 ? 'straight' : swing < 0.7 ? 'moderate swing' : 'heavy swing'})
- Density: ${(density * 100).toFixed(0)}% (${density < 0.3 ? 'sparse' : density < 0.7 ? 'moderate' : 'dense'})
- Variation: ${(variation * 100).toFixed(0)}% (${variation < 0.3 ? 'repetitive' : variation < 0.7 ? 'some variation' : 'highly varied'})

Available instruments: ${INSTRUMENTS.join(', ')}

Create a pattern that:
1. Follows ${genre} conventions
2. Has appropriate complexity level (more complex = more fills and ghost notes)
3. Applies swing if specified (delay off-beat notes)
4. Matches the requested density (more notes vs fewer notes)
5. Includes variation if requested (different patterns across the 16 steps)

Return ONLY a valid JSON object with this exact structure:
{
  "tracks": [
    {
      "instrument": "Kick",
      "notes": [
        { "step": 0, "velocity": 1.0 },
        { "step": 4, "velocity": 0.9 }
      ]
    }
  ],
  "bpm": 120
}

Rules:
- Each instrument should be on a separate track
- step: integer from 0-15 (representing the 16 steps)
- velocity: float from 0.0-1.0 (representing how hard the hit is)
- Include 3-6 instrument tracks depending on complexity
- Higher complexity = more tracks and notes
- Higher density = more notes per track
- Apply musical knowledge for the genre
- Return ONLY valid JSON, no markdown or explanation`;

  try {
    // Use pRetry for automatic retry with exponential backoff
    const response = await pRetry(
      async () => {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
            messages: [
              {
                role: "system",
                content: "You are an expert music producer and drum programmer. You create authentic, musical drum patterns that respect genre conventions while being creative and interesting."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 8192,
          });

          const content = completion.choices[0]?.message?.content;
          if (!content) {
            throw new Error('No response from AI');
          }

          const parsed = JSON.parse(content);
          return parsed;
        } catch (error: any) {
          // Check if it's a rate limit error
          if (isRateLimitError(error)) {
            throw error; // Rethrow to trigger p-retry
          }
          // For non-rate-limit errors, throw immediately (don't retry)
          throw new pRetry.AbortError(error);
        }
      },
      {
        retries: 7,
        minTimeout: 2000,
        maxTimeout: 128000,
        factor: 2,
      }
    );

    // Transform the AI response into our DrumTrack format
    const tracks: DrumTrack[] = response.tracks.map((track: any, index: number) => ({
      id: `track-${index + 1}`,
      instrument: track.instrument,
      notes: track.notes || [],
      volume: 0.8,
      pan: 0,
      solo: false,
      mute: false,
      color: INSTRUMENT_COLORS[index % INSTRUMENT_COLORS.length]
    }));

    // Ensure we have at least 3 tracks for a basic pattern
    const numTracks = Math.max(3, Math.min(8, Math.round(3 + complexity * 5)));
    while (tracks.length < numTracks && tracks.length < INSTRUMENTS.length) {
      const idx = tracks.length;
      tracks.push({
        id: `track-${idx + 1}`,
        instrument: INSTRUMENTS[idx],
        notes: [],
        volume: 0.8,
        pan: 0,
        solo: false,
        mute: false,
        color: INSTRUMENT_COLORS[idx % INSTRUMENT_COLORS.length]
      });
    }

    return {
      pattern: {
        tracks,
        bpm: response.bpm || 120,
        steps: 16
      },
      metadata: {
        genre,
        parameters: params
      }
    };

  } catch (error) {
    console.error('Error generating beat pattern:', error);
    
    // Return a fallback basic pattern if AI fails
    const fallbackTracks: DrumTrack[] = [
      {
        id: 'track-1',
        instrument: 'Kick',
        notes: [
          { step: 0, velocity: 1 },
          { step: 4, velocity: 0.9 },
          { step: 8, velocity: 1 },
          { step: 12, velocity: 0.9 }
        ],
        volume: 0.8,
        pan: 0,
        solo: false,
        mute: false,
        color: INSTRUMENT_COLORS[0]
      },
      {
        id: 'track-2',
        instrument: 'Snare',
        notes: [
          { step: 4, velocity: 1 },
          { step: 12, velocity: 0.95 }
        ],
        volume: 0.7,
        pan: 0,
        solo: false,
        mute: false,
        color: INSTRUMENT_COLORS[1]
      },
      {
        id: 'track-3',
        instrument: 'Hi-Hat Closed',
        notes: Array.from({ length: 16 }, (_, i) => ({
          step: i,
          velocity: i % 2 === 0 ? 0.8 : 0.4
        })),
        volume: 0.6,
        pan: 0,
        solo: false,
        mute: false,
        color: INSTRUMENT_COLORS[2]
      }
    ];

    return {
      pattern: {
        tracks: fallbackTracks,
        bpm: 120,
        steps: 16
      },
      metadata: {
        genre,
        parameters: params
      }
    };
  }
}
