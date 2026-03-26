'use client'

import { useEffect, useState } from 'react'
import { Users, CheckCircle, Mail, XCircle, Star, Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

interface Stats {
  total: number; hired: number; lettersSent: number; invited: number
  byVacancy: { id: number; title: string; total: number; hired: number; rejected: number; letters: number }[]
  byRecruiter: { id: number; name: string; candidates: number }[]
}

const PIE_COLORS = ['#e53935', '#1565c0', '#7b1fa2', '#e65100', '#2e7d32', '#546e7a']

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
  }, [])

  const kpi = [
    { label: 'Всего кандидатов', value: stats?.total ?? '—',       icon: Users,        color: '#1565c0' },
    { label: 'Принято',          value: stats?.hired ?? '—',        icon: CheckCircle,  color: '#2e7d32' },
    { label: 'Писем отправлено', value: stats?.lettersSent ?? '—',  icon: Mail,         color: '#e65100' },
    { label: 'На интервью',      value: stats?.invited ?? '—',      icon: Star,         color: '#7b1fa2' },
  ]

  const pieData = stats?.byVacancy?.map(v => ({ name: v.title, value: v.total })) ?? []

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {kpi.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color }}>{value}</div>
              <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* By Vacancy Bar */}
        <div className="rounded-xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="font-semibold text-sm mb-4">Кандидаты по вакансиям</div>
          {(stats?.byVacancy?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats!.byVacancy.map(v => ({ name: v.title.slice(0, 20), Всего: v.total, Принято: v.hired, Отказ: v.rejected }))}>
                <XAxis dataKey="name" tick={{ fill: '#8b8fa8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8b8fa8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#161928', border: '1px solid #252840', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#e4e6f0' }}
                />
                <Bar dataKey="Всего"   fill="#e53935" radius={[4,4,0,0]} />
                <Bar dataKey="Принято" fill="#2e7d32" radius={[4,4,0,0]} />
                <Bar dataKey="Отказ"   fill="#546e7a" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-sm" style={{ color: 'var(--color-muted)' }}>Нет данных</div>
          )}
        </div>

        {/* By Vacancy Pie */}
        <div className="rounded-xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="font-semibold text-sm mb-4">Распределение по вакансиям</div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#161928', border: '1px solid #252840', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8b8fa8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-52 text-sm" style={{ color: 'var(--color-muted)' }}>Нет данных</div>
          )}
        </div>
      </div>

      {/* By Vacancy Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="px-5 py-3.5 font-semibold text-sm" style={{ borderBottom: '1px solid var(--color-border)' }}>
          По вакансиям
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Вакансия', 'Кандидатов', 'Принято', 'Отказ', 'Писем'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(stats?.byVacancy ?? []).map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text)' }}>{v.title}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text)' }}>{v.total}</td>
                <td className="px-4 py-3" style={{ color: '#4caf50' }}>{v.hired}</td>
                <td className="px-4 py-3" style={{ color: '#e53935' }}>{v.rejected}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-muted)' }}>{v.letters}</td>
              </tr>
            ))}
            {!stats?.byVacancy?.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-muted)' }}>Нет данных</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* By Recruiter Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="px-5 py-3.5 font-semibold text-sm" style={{ borderBottom: '1px solid var(--color-border)' }}>
          По рекрутерам
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Рекрутер', 'Кандидатов'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(stats?.byRecruiter ?? []).map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text)' }}>{r.name}</td>
                <td className="px-4 py-3" style={{ color: 'var(--color-text)' }}>{r.candidates}</td>
              </tr>
            ))}
            {!stats?.byRecruiter?.length && (
              <tr><td colSpan={2} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-muted)' }}>Нет данных</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
