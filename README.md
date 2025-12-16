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
- **User Authentication** - Secure login/registration with Supabase Auth
- **Autism-Friendly Design** - Calming colors, large touch targets, consistent layouts

## Tech Stack

- Next.js 16 with App Router
- React 19, TypeScript
- Tailwind CSS v4
- @dnd-kit for drag-and-drop
- Radix UI for accessible components
- Zustand for state management
- Framer Motion for animations
- Supabase for database (optional)

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

## Database Setup

The app works without a database in demo mode (data stored locally, lost on refresh). For persistent storage:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to be provisioned

### 2. Run the Schema

1. Go to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase/schema.sql`
3. Run the SQL to create tables and policies

### 3. Enable Authentication

1. In your Supabase dashboard, go to Authentication > Providers
2. Ensure Email provider is enabled
3. (Optional) Configure email templates in Authentication > Email Templates

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials (found in Project Settings > API):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. For Vercel deployment, add these same variables in your Vercel project settings.

## Deploy

### One-Click Deploy

Click the button above to deploy your own instance to Vercel.

### Manual Deploy

1. Fork this repository
2. Import to [Vercel](https://vercel.com/new)
3. Deploy automatically on push

## License

MIT
