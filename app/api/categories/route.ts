import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
  }

  let tableName: string;
  if (type === 'lead_source') {
    tableName = 'lead_sources';
  } else if (type === 'lead_stage') {
    tableName = 'lead_stages';
  } else {
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from(tableName).select('*');

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error in GET /api/categories/${type}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const { name } = await request.json();

  if (!type || !name) {
    return NextResponse.json({ error: 'Missing type or name parameter' }, { status: 400 });
  }

  let tableName: string;
  if (type === 'lead_source') {
    tableName = 'lead_sources';
  } else if (type === 'lead_stage') {
    tableName = 'lead_stages';
  } else {
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase.from(tableName).insert({ name }).select().single();

    if (error) {
      console.error(`Error adding to ${tableName}:`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error(`Error in POST /api/categories/${type}:`, error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
