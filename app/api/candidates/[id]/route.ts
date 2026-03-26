import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const candidate = await prisma.candidate.findUnique({
    where: { id: Number(id) },
    include: {
      candidateVacancies: {
        include: { vacancy: true },
        orderBy: { dateAdded: 'desc' },
      },
      aiComments: { orderBy: { createdAt: 'desc' }, take: 5 },
      letterLogs: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  })

  if (!candidate) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(candidate)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const data = await req.json()

  // Update status
  if (data.status !== undefined && data.vacancy_id) {
    await prisma.candidateVacancy.upsert({
      where: { candidateId_vacancyId: { candidateId: Number(id), vacancyId: Number(data.vacancy_id) } },
      update: { status: data.status, changedBy: Number(session.user?.id) },
      create: { candidateId: Number(id), vacancyId: Number(data.vacancy_id), status: data.status },
    })
  }

  // Update rating
  if (data.rating !== undefined && data.vacancy_id) {
    await prisma.candidateVacancy.upsert({
      where: { candidateId_vacancyId: { candidateId: Number(id), vacancyId: Number(data.vacancy_id) } },
      update: { rating: Number(data.rating) },
      create: { candidateId: Number(id), vacancyId: Number(data.vacancy_id), rating: Number(data.rating) },
    })
  }

  // Add comment
  if (data.comment !== undefined) {
    await prisma.candidate.update({
      where: { id: Number(id) },
      data: { resumeText: data.comment },
    })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.candidate.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
