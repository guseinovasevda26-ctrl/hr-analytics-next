/**
 * Run once to create default users:
 *   npx ts-node lib/seed.ts
 * Or add to prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const users = [
    { username: 'admin', password: 'admin123', fullName: 'Администратор', role: 'admin' },
    { username: 'sevda', password: 'sevda123', fullName: 'Севда Гусейнова', role: 'recruiter' },
  ]

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10)
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: { username: u.username, passwordHash: hash, fullName: u.fullName, role: u.role },
    })
    console.log(`✓ User ${u.username} ready`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
