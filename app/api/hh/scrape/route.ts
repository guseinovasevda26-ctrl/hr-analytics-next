import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getHhHeaders, HH_API_BASE } from '@/lib/hh'

// In-memory task store (resets on redeploy — acceptable for short-lived tasks)
export const scrapeTasks: Record<string, {
  status: 'running' | 'done' | 'error'
  result: unknown[] | null
  error: string | null
  progress?: number
  total?: number
  label?: string
}> = {}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const query = data.query?.trim() ?? ''
  const area  = data.area ?? 'almaty'
  const limit = Math.max(5, Math.min(Number(data.limit ?? 20), 50))

  if (!query) return NextResponse.json({ success: false, error: 'Введите поисковый запрос' }, { status: 400 })

  const hhResult = await getHhHeaders()
  if ('error' in hhResult) {
    return NextResponse.json({ success: false, error: hhResult.error, need_auth: true })
  }

  const areaMap: Record<string, string> = { almaty: '160', astana: '162', kz: '' }
  const areaCode = areaMap[area] ?? '160'

  const taskId = Math.random().toString(36).slice(2, 12)
  scrapeTasks[taskId] = { status: 'running', result: null, error: null, progress: 0, total: limit }

  // Run in background (Edge runtime doesn't support threads, but Node.js does)
  ;(async () => {
    try {
      const params = new URLSearchParams({ text: query, per_page: String(limit), page: '0', order_by: 'relevance' })
      if (areaCode) params.set('area', areaCode)

      const resp = await fetch(`${HH_API_BASE}/resumes?${params}`, { headers: hhResult.headers })

      if (resp.status === 403) {
        scrapeTasks[taskId] = { status: 'error', result: null, error: 'Нет доступа к базе резюме HH. Нужна активная подписка.' }
        return
      }
      if (!resp.ok) {
        scrapeTasks[taskId] = { status: 'error', result: null, error: `HH API ошибка ${resp.status}` }
        return
      }

      const json = await resp.json()
      const items: Record<string, unknown>[] = json.items ?? []

      const results = items.map((r: Record<string, unknown>) => {
        const last  = String(r.last_name  ?? '').trim()
        const first = String(r.first_name ?? '').trim()
        const name  = last || first ? `${last} ${first}`.trim() : `${String(r.title ?? '').split(' ')[0]}-${String(r.id ?? '').slice(0, 6)}` || 'Кандидат'
        const salary = r.salary as Record<string, unknown> | null
        const exp    = r.total_experience as Record<string, unknown> | null
        const months = Number(exp?.months ?? 0)

        return {
          name,
          position:   String(r.title ?? ''),
          city:       String((r.area as Record<string, unknown>)?.name ?? ''),
          salary:     salary?.amount ? `${salary.amount} ${salary.currency}` : '',
          experience: months ? `${Math.floor(months / 12)} л. ${months % 12} мес.` : 'Без опыта',
          skills:     String(r.skills ?? '').slice(0, 400),
          hhUrl:      String(r.alternate_url ?? r.url ?? ''),
        }
      })

      scrapeTasks[taskId] = { status: 'done', result: results, error: null }
    } catch (e) {
      scrapeTasks[taskId] = { status: 'error', result: null, error: String(e) }
    }
  })()

  return NextResponse.json({ success: true, task_id: taskId })
}
