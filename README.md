# PECS Learning Platform

A web-based Picture Exchange Communication System (PECS) learning platform designed for children with autism and their support network (parents, therapists, educators).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fuvajed%2Fpecs-learning-platform)

## Features

- **All 6 PECS Phases** - Interactive activities for each phase of the PECS curriculum
  - Phase 1: Physical Exchange (drag-and-drop)
  - Phase 3: Picture Discrimination (select from array)
  - Phase 4: Sentence Structure (build "I want ___" sentences)
- **Picture Cards** - Visual communication cards with text-to-speech
- **Progress Tracking** - Track learning progress across sessions
- **Audio Feedback** - Text-to-speech and success sounds
- **Autism-Friendly Design** - Calming colors, large touch targets, consistent layouts

## Tech Stack

- Next.js 16 with App Router
- React 19, TypeScript
- Tailwind CSS v4
- @dnd-kit for drag-and-drop
- Radix UI for accessible components
- Zustand for state management
- Framer Motion for animations

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deploy

### One-Click Deploy

Click the button above to deploy your own instance to Vercel.

### Manual Deploy

1. Fork this repository
2. Import to [Vercel](https://vercel.com/new)
3. Deploy automatically on push

## License

MIT
