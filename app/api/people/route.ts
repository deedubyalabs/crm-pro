import { NextResponse } from 'next/server';
import { personService } from '@/lib/people';

export async function GET() {
  try {
    const people = await personService.getPeople();
    return NextResponse.json(people || []); // Ensure it's always an array
  } catch (error) {
    console.error('Error in /api/people GET:', error);
    return NextResponse.json({ error: 'Failed to fetch people' }, { status: 500 });
  }
}
