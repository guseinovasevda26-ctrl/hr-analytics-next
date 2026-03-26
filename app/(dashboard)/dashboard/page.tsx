'use client'

import { useEffect, useState } from 'react'
import { Users, UserPlus, CalendarCheck, Trophy, Wifi, WifiOff, Plus, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface Stats {
  total: number
  newToday: number
  invited: number
  hired: number
  byVacancy: {
    id: number; title: string; total: number
    new: number; contacted: number; invited: number
    offer: number; hired: number; rejected: number
  }[]
}

interface HhStatus { connected: boolean; expiresAt: string | null }

const STATUS_COLORS: Record<string, string> = {
  new:       '#1565c0',
  contacted: '#e65100',
  invited:   '#7b1fa2',
  offer:     '#2e7d32',
  hired:     '#1b5e20',
  rejected:  '#b71c1c',
}

export default function DashboardPage() {
  const [stats, setStats]       = useState<Stats | null>(null)
  const [hh, setHh]             = useState<HhStatus | null>(null)
  const [adding, setAdding]     = useState(false)
  const [newVacancy, setNewVacancy] = useState('')

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
    fetch('/api/hh/status').then(r => r.json()).then(setHh)
  }, [])

  async function addVacancy() {
    if (!newVacancy.trim()) return
    const res = await fetch('/api/vacancies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newVacancy.trim() }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Вакансия добавлена')
      setNewVacancy('')
      setAdding(false)
      fetch('/api/stats').then(r => r.json()).then(setStats)
    }
  }

  const kpi = [
    { label: 'Кандидатов', value: stats?.total ?? '—', icon: Users,        color: '#e53935' },
    { label: 'Добавлено сегодня', value: stats?.newToday ?? '—', icon: UserPlus,  color: '#2e7d32' },
    { label: 'На интервью',      value: stats?.invited ?? '—', icon: CalendarCheck, color: '#1565c0' },
    { label: 'Принято',          value: stats?.hired ?? '—',   icon: Trophy,        color: '#e65100' },
  ]

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* HH Status */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5">
          {hh?.connected
            ? <Wifi size={18} style={{ color: '#4caf50' }} />
            : <WifiOff size={18} style={{ color: '#e53935' }} />}
          <span className="text-sm font-medium" style={{ color: hh?.connected ? '#4caf50' : '#e53935' }}>
            {hh?.connected ? 'HH подключён' : 'HH не подключён'}
          </span>
          {hh?.expiresAt && (
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
              · до {new Date(hh.expiresAt).toLocaleDateString('ru')}
            </span>
          )}
        </div>
        {!hh?.connected && (
          <a
            href="/hh/oauth/start"
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--color-red)', color: '#fff' }}
          >
            Подключить HH
          </a>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpi.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${color}20` }}
            >
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color }}>{value}</div>
              <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Vacancy Funnel */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <span className="font-semibold text-sm">Воронка по вакансиям</span>
          <button
            onClick={() => setAdding(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: adding ? 'var(--color-red-soft)' : 'transparent', color: 'var(--color-red)', border: '1px solid var(--color-red)' }}
          >
            <Plus size={13} /> Вакансия
          </button>
        </div>

        {adding && (
          <div className="flex gap-2 px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <input
              autoFocus
              value={newVacancy}
              onChange={e => setNewVacancy(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addVacancy()}
              placeholder="Название вакансии..."
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <button
              onClick={addVacancy}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--color-red)', color: '#fff' }}
            >
              Добавить
            </button>
          </div>
        )}

        {stats?.byVacancy && stats.byVacancy.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Вакансия', 'Новых', 'Связались', 'Интервью', 'Оффер', 'Принято', 'Всего'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.byVacancy.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td className="px-4 py-3 font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{v.title}</td>
                    {[
                      { val: v.new,       color: STATUS_COLORS.new },
                      { val: v.contacted, color: STATUS_COLORS.contacted },
                      { val: v.invited,   color: STATUS_COLORS.invited },
                      { val: v.offer,     color: STATUS_COLORS.offer },
                      { val: v.hired,     color: STATUS_COLORS.hired },
                    ].map(({ val, color }, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {val > 0 && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style={{ background: `${color}20`, color }}
                          >{val}</span>
                        )}
                        {val === 0 && <span style={{ color: 'var(--color-muted)' }}>—</span>}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center text-sm" style={{ color: 'var(--color-muted)' }}>{v.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-10" style={{ color: 'var(--color-muted)' }}>
            <Users size={36} />
            <span className="text-sm">Нет вакансий. Добавь первую.</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <a
          href="/candidates"
          className="flex items-center gap-3 p-4 rounded-xl transition-all hover:opacity-80"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-red-soft)' }}>
            <Users size={20} style={{ color: 'var(--color-red)' }} />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Кандидаты</div>
            <div className="text-xs" style={{ color: 'var(--color-muted)' }}>Все кандидаты, поиск HH, оценки</div>
          </div>
          <ExternalLink size={14} className="ml-auto" style={{ color: 'var(--color-muted)' }} />
        </a>

        <a
          href="/analytics"
          className="flex items-center gap-3 p-4 rounded-xl transition-all hover:opacity-80"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(21,101,192,0.15)' }}>
            <Trophy size={20} style={{ color: '#1565c0' }} />
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Аналитика</div>
            <div className="text-xs" style={{ color: 'var(--color-muted)' }}>Графики, воронка, статистика</div>
          </div>
          <ExternalLink size={14} className="ml-auto" style={{ color: 'var(--color-muted)' }} />
        </a>
      </div>

    </div>
  )
}
