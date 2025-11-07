# BeatForge Studio - Web-Based Music Production Suite

## Overview
BeatForge Studio is a comprehensive browser-based music production platform designed to empower creators with AI-powered beat generation, advanced step sequencing, professional mixing tools, and a full-featured audio editor. The platform aims to provide a seamless and intuitive music creation experience, running all audio processing locally in the browser. It combines cutting-edge AI capabilities for creative assistance with robust audio engineering features, positioning itself as a leading-edge tool for both amateur and professional music producers. The project vision includes becoming a collaborative, cloud-integrated music production hub with extensive MIDI support and advanced AI features.

## User Preferences
I prefer detailed explanations.
I want an iterative development process where I can review changes frequently.
Please ask me before making any major architectural changes or adding new external dependencies.
I prefer functional programming paradigms where applicable.
Ensure code is well-commented and follows best practices for readability.
Do not make changes to the `design_guidelines.md` file.

## System Architecture

### UI/UX Decisions
The application features a modern, dark-themed music studio interface using Tailwind CSS and Shadcn/ui. The design prioritizes clarity and functionality, with a color palette featuring deep purple-black backgrounds, vibrant purple accents for interactive elements, and distinct colors for data visualizations. Typography uses 'Inter' for UI text and 'JetBrains Mono' for technical displays like BPM and time codes. Spacing is meticulously defined for various components, ranging from tight controls to expansive page margins, ensuring a consistent visual hierarchy. Interactive elements like buttons and sliders are designed for precision, with minimal animations to maintain audio timing accuracy.

### Technical Implementations
The frontend is built with React 18 and TypeScript, utilizing Wouter for routing and React Query for state management. Audio processing is handled by Tone.js, leveraging the Web Audio API for in-browser sound generation and manipulation. The backend uses Node.js with Express, backed by a PostgreSQL database (Neon) managed with Drizzle ORM. Zod is used for schema validation across the stack.

### Feature Specifications
**AI Beat Generator**: Generates genre-aware drum patterns with adjustable parameters (complexity, swing, density, variation) and an 8x16 grid visualization.
**Advanced Sequencer**: Supports up to 16 tracks, a 64-step grid with per-note velocity, track solo/mute, individual volume, and project save/load.
**Professional Mixer**: Features channel strips with faders, 3-band EQ, effect slots (Reverb, Delay, Distortion, Compression), pan control, real-time level meters, and a spectrum analyzer. Includes an XY Pad for real-time FX modulation.
**Audio Editor**: Provides canvas-based waveform editing (trim, split, merge), browser-based recording, and an effects panel for pitch shifting, time-stretching, and voice effects. Integrates AI for Text-to-Speech.
**Perform Live**: An Ableton-style session view with a clip launcher (4 tracks × 8 scenes) for real-time clip triggering, supporting MIDI, pattern, and audio clips. Includes a canvas-based Piano Roll Editor for MIDI note editing.

### System Design Choices
All audio processing is designed to run client-side for low latency and responsiveness. AI features, such as beat generation and text-to-speech, are integrated via Replit AI Integrations with OpenAI. Data persistence for beat patterns and projects is managed through a PostgreSQL database. The system includes robust error handling with `p-retry` and exponential backoff for API calls. The project emphasizes a desktop-first responsive design, with a focus on delivering a high-fidelity production environment.

## External Dependencies
- **OpenAI**: Via Replit AI Integrations for AI beat generation (gpt-5) and Text-to-Speech (tts-1).
- **PostgreSQL (Neon)**: Database for storing beat patterns and projects.
- **Tone.js**: JavaScript framework for Web Audio API interactions.
- **React**: Frontend UI library.
- **Wouter**: Client-side routing for React.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Shadcn/ui**: UI component library.
- **React Query (TanStack Query)**: Data fetching and state management.
- **Node.js/Express**: Backend runtime and web framework.
- **Drizzle ORM**: TypeScript ORM for PostgreSQL.
- **Zod**: Schema declaration and validation library.