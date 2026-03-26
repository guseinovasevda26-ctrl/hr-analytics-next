import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const cands: Record<string, string>[] = data.candidates ?? []
  const vacancyId = data.vacancy_id ? Number(data.vacancy_id) : null

  let saved = 0
  let errors = 0

  for (const c of cands) {
    try {
      await prisma.candidate.create({
        data: {
          hhUrl:       c.hhUrl ?? c.hh_url ?? '',
          name:        c.name ?? '',
          position:    c.position ?? '',
          salary:      c.salary ?? '',
          city:        c.city ?? '',
          experience:  c.experience ?? '',
          resumeText:  c.skills ?? c.resume_text ?? '',
          recruiterId: Number(session.user?.id),
          ...(vacancyId ? {
            candidateVacancies: {
              create: { vacancyId, status: 'new' },
            },
          } : {}),
        },
      })
      saved++
    } catch {
      errors++
    }
  }

  return NextResponse.json({ success: true, saved, errors })
}
