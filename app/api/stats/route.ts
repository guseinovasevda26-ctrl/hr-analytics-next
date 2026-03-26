import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [total, hired, invited, lettersSent] = await Promise.all([
    prisma.candidate.count(),
    prisma.candidateVacancy.count({ where: { status: 'hired' } }),
    prisma.candidateVacancy.count({ where: { status: 'invited' } }),
    prisma.letterLog.count(),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const newToday = await prisma.candidate.count({ where: { dateAdded: { gte: today } } })

  // By vacancy
  const vacancies = await prisma.vacancy.findMany({
    include: {
      candidateVacancies: { select: { status: true, letterSent: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const byVacancy = vacancies.map(v => ({
    id: v.id,
    title: v.title,
    total: v.candidateVacancies.length,
    new: v.candidateVacancies.filter(c => c.status === 'new').length,
    contacted: v.candidateVacancies.filter(c => c.status === 'contacted').length,
    invited: v.candidateVacancies.filter(c => c.status === 'invited').length,
    offer: v.candidateVacancies.filter(c => c.status === 'offer').length,
    hired: v.candidateVacancies.filter(c => c.status === 'hired').length,
    rejected: v.candidateVacancies.filter(c => c.status === 'rejected').length,
    letters: v.candidateVacancies.filter(c => c.letterSent).length,
  }))

  // By recruiter
  const byRecruiter = await prisma.user.findMany({
    select: {
      id: true,
      fullName: true,
      username: true,
      candidates: { select: { id: true } },
      _count: { select: { candidates: true } },
    },
  })

  return NextResponse.json({
    total,
    hired,
    invited,
    newToday,
    lettersSent,
    byVacancy,
    byRecruiter: byRecruiter.map(r => ({
      id: r.id,
      name: r.fullName ?? r.username,
      candidates: r._count.candidates,
    })),
  })
}
