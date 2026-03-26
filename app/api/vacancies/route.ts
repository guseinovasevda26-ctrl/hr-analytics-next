import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const vacancies = await prisma.vacancy.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { candidateVacancies: true } } },
  })

  return NextResponse.json(vacancies.map(v => ({
    id: v.id,
    title: v.title,
    candidateCount: v._count.candidateVacancies,
    createdAt: v.createdAt,
  })))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Укажите название' }, { status: 400 })

  const vacancy = await prisma.vacancy.create({
    data: { title: title.trim(), recruiterId: Number(session.user?.id) },
  })

  return NextResponse.json({ success: true, vacancy })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()
  await prisma.vacancy.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
