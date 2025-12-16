# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PECS Learn is a web-based Picture Exchange Communication System (PECS) learning platform designed for children with autism. It implements all 6 PECS phases with interactive activities, drag-and-drop exchanges, and text-to-speech support.

## Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
npm start        # Start production server
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS v4 (CSS-based config in `globals.css`)
- **State**: Zustand for UI/session state
- **Drag & Drop**: @dnd-kit/core
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Audio**: Web Speech API (TTS), custom sound effects

### Core Directories

- `src/app/` - Next.js App Router pages
  - `(dashboard)/` - Authenticated dashboard pages (route group)
  - `(learning)/` - Practice session pages (distraction-free layout)
  - `practice/phase/[phaseId]/` - Dynamic PECS phase practice routes

- `src/components/` - React components
  - `ui/` - Base UI components (Button, Card, Input, Dialog, etc.)
  - `layout/` - Shell layouts (DashboardShell, LearningShell)
  - `cards/` - PictureCard, CardGrid, SentenceStrip
  - `phases/` - PECS phase activities (phase-1/, phase-3/, phase-4/)
  - `feedback/` - SuccessAnimation, reinforcement components

- `src/lib/` - Utilities and services
  - `audio/tts.ts` - Text-to-speech with Web Speech API
  - `audio/sounds.ts` - Sound effect playback
  - `utils.ts` - Classname merging (cn function)

- `src/stores/` - Zustand state stores
  - `sessionStore.ts` - Active practice session state
  - `uiStore.ts` - Persisted UI preferences (sound, animations)

- `src/types/index.ts` - All TypeScript types and PECS_PHASES constant

### PECS Phase Implementation

Each phase activity is a self-contained component in `src/components/phases/phase-N/`:
- Phase 1: Physical exchange (drag card to hand icon)
- Phase 3: Picture discrimination (select correct card from array)
- Phase 4: Sentence structure (build "I want ___" with sentence strip)

### Design Patterns

**Autism-Friendly UI**: Components use CSS variables from `globals.css` for a calming color palette. Large touch targets (88px minimum) via `.touch-target-lg` class. Reduced motion support via `prefers-reduced-motion`.

**Component Props**: UI components use `class-variance-authority` for variants. The `cn()` utility merges Tailwind classes.

**Drag & Drop**: Uses @dnd-kit with `useDraggable` for cards and `useDroppable` for drop zones. DragOverlay renders the dragged item.

### Key Types

```typescript
type PECSPhase = 1 | 2 | 3 | 4 | 5 | 6;
type CardType = "noun" | "verb" | "adjective" | "sentence_starter" | "social";
type PromptLevel = "independent" | "gestural" | "verbal" | "physical" | "full_physical";
```

### Static Assets

- `public/cards/` - Picture card SVG images (cookie.svg, juice.svg, etc.)
- `public/icons/` - PWA icons
- `public/sounds/` - Audio files for feedback (success.mp3, etc.)
