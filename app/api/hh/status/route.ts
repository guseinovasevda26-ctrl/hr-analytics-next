import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getHhStatus } from '@/lib/hh'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await getHhStatus())
}
