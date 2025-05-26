import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  // Use the cookies function directly as required by createRouteHandlerClient
  const supabase = createRouteHandlerClient({ cookies }, {
    supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  })

  try {
    const { data: agents, error } = await supabase.from('agents').select('*')

    if (error) {
      console.error('Error fetching agents:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(agents)
  } catch (error) {
    console.error('Unexpected error fetching agents:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
