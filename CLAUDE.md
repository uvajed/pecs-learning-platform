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
- **Database**: Supabase (optional, works in demo mode without it)
- **Drag & Drop**: @dnd-kit/core
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Audio**: Web Speech API (TTS), custom sound effects

### Core Directories

- `src/app/` - Next.js App Router pages
  - `api/children/` - REST API routes for CRUD operations
  - `practice/phase/[phaseId]/` - Dynamic PECS phase practice routes

- `src/components/` - React components
  - `ui/` - Base UI components (Button, Card, Input, Dialog, etc.)
  - `layout/` - Shell layouts (DashboardShell, Header, Sidebar)
  - `cards/` - PictureCard, CardGrid, SentenceStrip
  - `phases/` - PECS phase activities (phase-1/ through phase-6/)
  - `feedback/` - SuccessAnimation, reinforcement components

- `src/lib/` - Utilities and services
  - `audio/tts.ts` - Text-to-speech with voice selection
  - `audio/sounds.ts` - Sound effect playback
  - `cards/cardData.ts` - All picture card definitions (56+ cards)
  - `supabase/client.ts` - Database client (lazy-loaded)
  - `utils.ts` - Classname merging (cn function)

- `src/stores/` - Zustand state stores
  - `sessionStore.ts` - Active practice session state
  - `uiStore.ts` - Persisted UI preferences (sound, animations)

- `src/types/index.ts` - All TypeScript types and PECS_PHASES constant

### PECS Phase Implementation

Each phase is a self-contained component in `src/components/phases/phase-N/`:
- Phase 1: Physical exchange (drag card to hand icon)
- Phase 2: Distance and persistence (multi-step exchange)
- Phase 3: Picture discrimination (select correct card from array)
- Phase 4: Sentence structure (build "I want ___" with sentence strip)
- Phase 5: Responsive requesting (respond to "What do you want?")
- Phase 6: Commenting (use "I see" / "I hear" starters)

### Database

Supabase backend is optional. Without environment variables, the app runs in demo mode.

Tables: `children` (profiles), `sessions` (practice tracking)

API routes check `isSupabaseConfigured()` and return 503 if not configured.

### Card System

Cards defined in `src/lib/cards/cardData.ts` across categories:
- FOOD_CARDS, TOY_CARDS, ACTION_CARDS, PEOPLE_CARDS
- FEELING_CARDS, PLACE_CARDS, STARTER_CARDS

Card SVGs stored in `public/cards/` (e.g., cookie.svg, juice.svg)

### Design Patterns

**Autism-Friendly UI**: CSS variables in `globals.css` for calming colors. Large touch targets (88px minimum). Reduced motion support.

**Component Variants**: UI components use `class-variance-authority`. The `cn()` utility merges Tailwind classes.

**Drag & Drop**: @dnd-kit with `useDraggable` for cards, `useDroppable` for zones, `DragOverlay` for visual feedback.

### Key Types

```typescript
type PECSPhase = 1 | 2 | 3 | 4 | 5 | 6;
type CardType = "noun" | "verb" | "adjective" | "sentence_starter" | "social";
type PromptLevel = "independent" | "gestural" | "verbal" | "physical" | "full_physical";
```
