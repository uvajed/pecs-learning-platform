import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/children/[id] - Get a single child
export async function GET(request: NextRequest, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  const { id } = await params;

  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// PUT /api/children/[id] - Update a child
export async function PUT(request: NextRequest, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  const { id } = await params;

  try {
    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = String(body.name).trim();
    if (body.current_phase !== undefined) updateData.current_phase = body.current_phase;
    if (body.progress !== undefined) updateData.progress = body.progress;
    if (body.sessions !== undefined) updateData.sessions = body.sessions;
    if (body.date_of_birth !== undefined) updateData.date_of_birth = body.date_of_birth;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.preferences !== undefined) updateData.preferences = body.preferences;

    const { data, error } = await supabase
      .from('children')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Child not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

// DELETE /api/children/[id] - Delete a child
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  const { id } = await params;

  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
