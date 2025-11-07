# BeatForge Studio - Design Guidelines

## Design Approach

**Reference-Based Hybrid**: Drawing inspiration from professional DAW software (Ableton Live, FL Studio) combined with modern web app aesthetics (Linear, Vercel). Music production tools demand specialized, functional interfaces with strong visual feedback.

## Core Design Principles

1. **Studio Professional**: Dark-themed interface to reduce eye strain during extended production sessions
2. **Visual Feedback First**: Every audio interaction provides immediate visual confirmation
3. **Density with Clarity**: Information-rich interfaces that remain navigable and clear
4. **Performance-Oriented**: Minimize animations that could interfere with audio timing

## Typography

**Font Stack**: 
- Primary: 'Inter' (Google Fonts) - UI elements, labels, navigation
- Monospace: 'JetBrains Mono' (Google Fonts) - Time codes, BPM displays, technical readouts

**Hierarchy**:
- Hero Headlines: text-5xl to text-7xl, font-bold
- Section Headers: text-2xl to text-3xl, font-semibold
- Tool Labels: text-sm, font-medium, uppercase tracking
- Parameter Values: text-base, font-mono
- Helper Text: text-xs

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, and 16 for consistency
- Tight spacing: p-2, gap-2 (within controls)
- Standard spacing: p-4, gap-4 (component padding)
- Section spacing: p-8, gap-8 (between major sections)
- Page margins: p-16 (desktop outer margins)

**Grid System**:
- Landing page: max-w-7xl container
- Tool interfaces: Full-width with internal max-w-screen-2xl
- Sequencer grid: CSS Grid with 16-step columns
- Mixer channels: Flex layout with fixed 80px channel strips

## Component Library

### Navigation
- Top navigation bar: Fixed header with tool switcher, BPM display, transport controls
- Height: h-16
- Layout: Flex with space-between, items centered
- Active tool indicator: Border-b-2 highlight

### Landing Page Structure
1. **Hero Section** (80vh min):
   - Full-width gradient background (dark purple to black)
   - Centered content with main CTA
   - Waveform visualization background (subtle, animated)
   - "Trusted by X producers" social proof badge

2. **Features Grid** (3 columns on desktop):
   - Icon + Title + Description cards
   - Each tool (AI Generator, Sequencer, Mixer) with screenshot preview
   - Hover states: Subtle lift (translate-y-1) and glow

3. **Interactive Demo Section**:
   - 2-column layout: Live beat preview player + feature highlights
   - Embedded mini sequencer visualization

4. **Tech Stack Section**: 
   - 4-column grid showing Web Audio API, Tone.js, AI, PWA badges
   - Icon-forward design

5. **CTA Section**:
   - Centered, generous padding (py-24)
   - Primary + Secondary actions
   - "No installation required" subtext

### AI Beat Generator Interface
- Left Panel (30%): Genre selector, parameter sliders (Complexity, Swing, Density)
- Center (50%): 8x16 grid visualization of generated pattern with velocity heat map
- Right Panel (20%): Preset browser, export options, AI settings

### Sequencer Interface
- Top: Track headers with instrument names, solo/mute, volume sliders
- Center: Step sequencer grid (16 tracks × 64 steps visible, horizontal scroll)
- Bottom: Transport bar with play/pause/stop, BPM, timeline ruler
- Grid cells: 24px × 24px, clickable with velocity intensity shading

### Mixer Interface
- Channel strips: Vertical faders, pan knobs, solo/mute buttons
- Each channel: 80px width, full height
- Insert effects slots: Stacked horizontally above fader
- Master section: Right-most channel, wider (120px), includes master meter
- EQ visualization: Inline frequency response curve per channel

### Form Elements
- Sliders: Custom range inputs with value display, track color showing active range
- Buttons: Rounded (rounded-md), solid backgrounds, clear hover states (opacity-90)
- Toggle switches: iOS-style for solo/mute/effect bypass
- Dropdowns: Minimal style with chevron icon

### Data Displays
- Level meters: Vertical bars with peak indicators, gradient from green→yellow→red
- Waveform displays: Canvas-based, real-time audio visualization
- Spectrum analyzer: Frequency bars, logarithmic scale
- BPM counter: Large, monospace, prominent positioning

### Overlays
- Modal dialogs: Centered, max-w-2xl, backdrop blur (backdrop-blur-sm)
- Tooltips: Small, positioned contextually, appear on hover with delay
- Context menus: Appear on right-click, compact vertical lists

## Responsive Behavior

**Desktop-First Approach** (music production is primarily desktop):
- Landing page: Fully responsive, stacks to single column on mobile
- Production tools: Optimized for ≥1280px, show simplified mobile view with "Best experienced on desktop" message
- Tablet (md): 2-column layouts, reduced track visibility
- Mobile: Landing page only, with install prompts for PWA

## Icons

**Library**: Heroicons (via CDN)
- Navigation: Outline style
- Tool interfaces: Solid style for active states
- Sizes: 16px (inline), 24px (buttons), 32px (feature cards)

## Images

**Hero Section**:
- Large background image: Abstract waveform visualization or studio setup (dark, moody aesthetic)
- Placement: Full-width, subtle parallax effect on scroll
- Overlay: Dark gradient (top to bottom) for text legibility

**Feature Screenshots**:
- Tool interface previews showing actual sequencer/mixer layouts
- Placement: Feature cards on landing page
- Style: Floating with subtle shadow, slight tilt (rotate-1)

**No images** needed in production tools themselves - rely on generated visualizations

## Animation Principles

**Minimal and Purposeful**:
- Transport controls: No animation (instant response critical)
- UI transitions: Fast (150ms) fade/slide for panels
- Waveform/meters: Real-time, performance-critical (60fps)
- Landing page: Subtle fade-in on scroll for sections
- Avoid: Decorative animations that could cause audio timing issues

## Accessibility

- High contrast ratios for all text on dark backgrounds
- Keyboard shortcuts prominently documented
- Focus indicators on all interactive elements (ring-2 ring-offset-2)
- Screen reader labels for all visual-only controls
- ARIA labels for custom audio controls

## Production Tool Color Strategy

While specific colors defined later, establish semantic zones:
- Transport/playback controls: Distinct zone (suggest accent treatment)
- Parameter controls: Neutral zone
- Audio feedback (meters, waveforms): Data visualization zone with intensity mapping
- Modal overlays: Elevated surface treatment