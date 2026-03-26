import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as { role?: string })?.role !== 'admin') return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })

  const users = await prisma.user.findMany({
    select: { id: true, username: true, fullName: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as { role?: string })?.role !== 'admin') return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })

  const data = await req.json()
  if (!data.username?.trim() || !data.password?.trim()) return NextResponse.json({ error: 'Логин и пароль обязательны' }, { status: 400 })

  const exists = await prisma.user.findUnique({ where: { username: data.username.trim() } })
  if (exists) return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 400 })

  const user = await prisma.user.create({
    data: {
      username: data.username.trim(),
      passwordHash: await bcrypt.hash(data.password, 10),
      fullName: data.fullName?.trim() || null,
      role: data.role === 'admin' ? 'admin' : 'recruiter',
    },
    select: { id: true, username: true, fullName: true, role: true, createdAt: true },
  })
  return NextResponse.json(user)
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as { role?: string })?.role !== 'admin') return NextResponse.json({ error: 'Доступ запрещён' }, { status: 403 })

  const { id } = await req.json()
  await prisma.user.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
