import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { scrapeTasks } from '@/lib/scrape-tasks'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId } = await params
  const task = scrapeTasks[taskId]
  if (!task) return NextResponse.json({ status: 'not_found' }, { status: 404 })

  if (task.status === 'running') {
    return NextResponse.json({ status: 'running', progress: task.progress, total: task.total, label: task.label })
  }

  const result = { ...task }
  delete scrapeTasks[taskId]
  return NextResponse.json(result)
}
