import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const profiles = await prisma.vacancyProfile.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(profiles)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  if (!data.title?.trim()) return NextResponse.json({ error: 'Укажите название' }, { status: 400 })
  const profile = await prisma.vacancyProfile.create({
    data: {
      title:       data.title.trim(),
      description: data.description ?? null,
      keywords:    data.keywords ?? null,
      experience:  data.experience ?? null,
      city:        data.city ?? null,
    },
  })
  return NextResponse.json(profile)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await prisma.vacancyProfile.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
