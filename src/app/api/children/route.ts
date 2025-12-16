import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

// GET /api/children - List all children
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured. Please set up Supabase environment variables.' },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/children - Create a new child
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured. Please set up Supabase environment variables.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    if (!body.name || String(body.name).trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('children')
      .insert({
        name: String(body.name).trim(),
        current_phase: body.current_phase || 1,
        progress: body.progress || 0,
        sessions: body.sessions || 0,
        date_of_birth: body.date_of_birth || null,
        notes: body.notes || null,
        preferences: body.preferences || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
