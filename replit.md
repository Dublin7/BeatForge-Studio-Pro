# BeatForge Studio - Web-Based Music Production Suite

## Project Overview

BeatForge Studio is a comprehensive browser-based music production platform that combines AI-powered beat generation, advanced step sequencing, and professional-grade mixing tools. All audio processing runs locally in the browser using the Web Audio API and Tone.js framework.

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **Styling**: Tailwind CSS with custom music studio dark theme
- **UI Components**: Shadcn/ui component library
- **State Management**: React Query (TanStack Query v5)
- **Audio**: Tone.js (Web Audio API framework)
- **Fonts**: Inter (UI), JetBrains Mono (technical displays)

### Backend
- **Runtime**: Node.js with Express
- **AI Integration**: OpenAI via Replit AI Integrations (gpt-5 model)
- **Data Storage**: In-memory storage with LocalStorage for client-side persistence
- **Schema Validation**: Zod with Drizzle-Zod

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── home.tsx              # Landing page with features showcase
│   │   │   ├── beat-generator.tsx    # AI-powered drum pattern generator
│   │   │   ├── sequencer.tsx         # 16-track step sequencer
│   │   │   └── mixer.tsx             # Professional mixing interface
│   │   ├── components/
│   │   │   ├── transport-bar.tsx     # Playback controls (play/pause/stop, BPM)
│   │   │   ├── level-meter.tsx       # Audio level visualization (canvas-based)
│   │   │   └── grid-visualizer.tsx   # Step sequencer grid component
│   │   ├── App.tsx                   # Main app with routing
│   │   └── index.css                 # Dark theme configuration
│   └── index.html                    # HTML entry point with SEO meta tags
├── server/
│   ├── routes.ts                     # API endpoints
│   ├── storage.ts                    # In-memory data storage
│   └── openai.ts                     # OpenAI integration (to be created)
├── shared/
│   └── schema.ts                     # Shared TypeScript types and Zod schemas
└── design_guidelines.md              # Design system and UI guidelines
```

## Key Features

### 1. AI Beat Generator (`/beat-generator`)
- Genre-aware pattern generation (Hip-Hop, Trap, House, Techno, Drum & Bass)
- Adjustable parameters: complexity, swing, density, variation
- Real-time 8x16 grid visualization with velocity heat map
- Quick presets for common styles
- Pattern export to JSON

**Implementation Status**: ✅ Frontend complete, ⏳ Backend API pending

### 2. Advanced Sequencer (`/sequencer`)
- Up to 16 simultaneous tracks
- 64-step grid (16 visible with horizontal scroll)
- Per-note velocity control
- Track solo/mute functionality
- Individual track volume control
- Project save/load (LocalStorage + JSON export)
- Pattern chaining for song structure

**Implementation Status**: ✅ Frontend complete, ⏳ Audio engine integration pending

### 3. Professional Mixer (`/mixer`)
- Channel strips with vertical faders
- 3-band EQ per track (Low/Mid/High, ±12dB)
- Effect slots: Reverb, Delay, Distortion, Compression
- Pan control per channel
- Real-time level meters with peak indicators
- Master bus with dedicated controls
- Spectrum analyzer placeholder

**Implementation Status**: ✅ Frontend complete, ⏳ Audio processing integration pending

## Data Models

### BeatPattern
Stores AI-generated or user-created drum patterns.
- `name`, `genre`, `bpm`, `steps`
- `trackData`: Array of tracks with note data
- `parameters`: Generation parameters (complexity, swing, density, variation)

### Project
Full sequencer projects with multiple patterns.
- `name`, `bpm`
- `tracks`: Array of tracks with pattern chains
- `mixerSettings`: EQ, effects, and levels per channel

### Frontend Types
- `DrumNote`: Step + velocity data
- `DrumTrack`: Instrument, notes, volume, pan, solo/mute
- `SequencerTrack`: Extends DrumTrack with effects and EQ
- `Effect`: Type (reverb/delay/distortion/compression) + parameters
- `EQSettings`: 3-band EQ + filters
- `MixerChannel`: Track mixing settings

## API Endpoints

### POST `/api/beats/generate`
Generate AI-powered drum patterns based on genre and parameters.

**Request Body**:
```json
{
  "genre": "hip-hop" | "trap" | "house" | "techno" | "dnb" | "custom",
  "complexity": 0.5,
  "swing": 0.3,
  "density": 0.6,
  "variation": 0.4
}
```

**Response**:
```json
{
  "pattern": {
    "tracks": [
      {
        "id": "track-1",
        "instrument": "Kick",
        "notes": [{ "step": 0, "velocity": 1 }, ...],
        "volume": 0.8,
        "pan": 0,
        "solo": false,
        "mute": false,
        "color": "hsl(280, 85%, 58%)"
      }
    ],
    "bpm": 120,
    "steps": 16
  },
  "metadata": {
    "genre": "hip-hop",
    "parameters": { ... }
  }
}
```

**Implementation Status**: ⏳ Pending (Task 2)

## Design System

### Color Palette (Dark Theme)
- **Background**: Deep purple-black (`270 15% 6%`)
- **Card**: Slightly elevated purple (`270 12% 9%`)
- **Primary**: Vibrant purple (`280 85% 58%`) - for CTAs and active states
- **Data Visualization**: 
  - Chart 1: Purple (`280 85% 68%`)
  - Chart 2: Green (`160 70% 55%`)
  - Chart 3: Yellow (`50 95% 60%`)
  - Chart 4: Red (`0 85% 65%`)
  - Chart 5: Blue (`200 80% 60%`)

### Typography
- **Primary Font**: Inter (UI elements, body text)
- **Monospace**: JetBrains Mono (BPM, time codes, values)

### Spacing
- Tight: `p-2, gap-2` (controls)
- Standard: `p-4, gap-4` (components)
- Section: `p-8, gap-8` (major sections)
- Page: `p-16` (desktop margins)

### Component Standards
- Buttons: `rounded-md`, minimal animations for audio timing precision
- Sliders: Custom range inputs with value displays
- Grid cells: 24px × 24px (sequencer), 48px height (beat generator)
- Level meters: Canvas-based with green→yellow→red gradient

## Audio Engine (Tone.js Integration - Pending)

### Planned Implementation
1. **Transport Control**: BPM-synced playback using Tone.Transport
2. **Sound Sources**: 
   - Drum samples loaded via Tone.Sampler
   - 8 core instruments (Kick, Snare, Hi-Hats, Claps, Toms, etc.)
3. **Sequencing**: Tone.Sequence for step-based playback
4. **Effects Chain**:
   - Reverb: Tone.Reverb
   - Delay: Tone.FeedbackDelay
   - Distortion: Tone.Distortion
   - Compression: Tone.Compressor
5. **Mixing**:
   - Per-track Tone.Channel with volume/pan
   - 3-band EQ via Tone.EQ3
   - Master bus with Tone.Limiter
6. **Export**: Offline rendering via Tone.Offline to WAV

## User Experience Features

### Keyboard Shortcuts
- **Space**: Play/Pause
- **S**: Stop
- **R**: Reset to beginning
- **Ctrl+S**: Save project

### State Persistence
- **Auto-save**: Projects saved to LocalStorage on changes
- **Manual Export**: Download projects as JSON files
- **Audio Export**: Render to WAV (via Tone.Offline)

### Responsive Design
- **Desktop-first**: Optimized for screen widths ≥1280px
- **Landing page**: Fully responsive, stacks to single column on mobile
- **Production tools**: Show simplified view on mobile with "Best on desktop" message

## Development Workflow

### Current Phase: Task 1 Complete ✅
- All data schemas defined in `shared/schema.ts`
- Dark music studio theme configured in `index.css`
- All React components built:
  - Landing page with hero, features, tech stack
  - AI Beat Generator interface
  - Advanced Sequencer interface
  - Professional Mixer interface
  - Shared components (TransportBar, LevelMeter, GridVisualizer)
- Routing configured in App.tsx
- SEO meta tags added to index.html

### Next: Task 2 - Backend Implementation
1. Create `server/openai.ts` with AI integration
2. Implement `/api/beats/generate` endpoint
3. Add retry logic and rate limiting for AI calls

### Next: Task 3 - Integration & Testing
1. Connect frontend to backend APIs
2. Implement Tone.js audio engine
3. Add LocalStorage persistence
4. Implement WAV export
5. Test all user journeys
6. Polish loading/error states

## Known Limitations & Future Enhancements

### Current Limitations
- Audio playback not yet implemented (pending Tone.js integration)
- AI beat generation API not yet connected
- Effects are UI-only (processing pending)
- Spectrum analyzer is placeholder

### Planned Features (Post-MVP)
- Progressive Web App (PWA) functionality
- MIDI controller support via Web MIDI API
- Cloud save for cross-device access
- Collaborative editing (WebRTC)
- More AI models and genres
- Stem separation and advanced export

## Environment Variables

### Required (Auto-configured)
- `AI_INTEGRATIONS_OPENAI_BASE_URL`: Replit AI Integrations endpoint
- `AI_INTEGRATIONS_OPENAI_API_KEY`: Auth token for AI service

### Optional
- `SESSION_SECRET`: Session encryption key (already set)

## Running the Project

The project uses the "Start application" workflow which runs `npm run dev`:
- Express server on port 5000 (backend)
- Vite dev server on same port (frontend)
- Hot module replacement enabled

**Access**: Open the preview URL when workflow is running

## Credits

- **Audio Framework**: Tone.js
- **AI**: OpenAI (via Replit AI Integrations)
- **UI**: Shadcn/ui + Tailwind CSS
- **Design Inspiration**: Ableton Live, FL Studio, Linear, Vercel
