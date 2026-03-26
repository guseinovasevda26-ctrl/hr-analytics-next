import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q         = searchParams.get('q') ?? ''
  const status    = searchParams.get('status') ?? ''
  const vacancyId = searchParams.get('vacancy_id') ?? ''
  const rating    = searchParams.get('rating') ?? ''

  const candidates = await prisma.candidate.findMany({
    where: {
      ...(q ? {
        OR: [
          { name:     { contains: q, mode: 'insensitive' } },
          { position: { contains: q, mode: 'insensitive' } },
          { city:     { contains: q, mode: 'insensitive' } },
        ],
      } : {}),
      ...(vacancyId ? { candidateVacancies: { some: { vacancyId: Number(vacancyId) } } } : {}),
      ...(status ? { candidateVacancies: { some: { status } } } : {}),
      ...(rating ? { candidateVacancies: { some: { rating: Number(rating) } } } : {}),
    },
    include: {
      candidateVacancies: {
        include: { vacancy: { select: { title: true } } },
        orderBy: { dateAdded: 'desc' },
        take: 1,
      },
    },
    orderBy: { dateAdded: 'desc' },
    take: 200,
  })

  return NextResponse.json(candidates.map(c => ({
    id: c.id,
    name: c.name,
    position: c.position,
    city: c.city,
    experience: c.experience,
    salary: c.salary,
    phone: c.phone,
    hhUrl: c.hhUrl,
    dateAdded: c.dateAdded,
    vacancyTitle: c.candidateVacancies[0]?.vacancy?.title ?? null,
    vacancyId: c.candidateVacancies[0]?.vacancyId ?? null,
    status: c.candidateVacancies[0]?.status ?? null,
    rating: c.candidateVacancies[0]?.rating ?? null,
  })))
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()

  const candidate = await prisma.candidate.create({
    data: {
      hhUrl:       data.hh_url ?? '',
      name:        data.name ?? '',
      position:    data.position ?? '',
      salary:      data.salary ?? '',
      city:        data.city ?? '',
      experience:  data.experience ?? '',
      phone:       data.phone ?? '',
      email:       data.email ?? '',
      resumeText:  data.resume_text ?? '',
      recruiterId: Number(session.user?.id),
      ...(data.vacancy_id ? {
        candidateVacancies: {
          create: { vacancyId: Number(data.vacancy_id), status: 'new' },
        },
      } : {}),
    },
  })

  return NextResponse.json({ success: true, candidateId: candidate.id })
}
