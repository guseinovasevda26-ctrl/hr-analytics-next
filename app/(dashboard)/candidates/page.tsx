'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Plus, Star, ExternalLink, Loader2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'

type Status = 'new' | 'contacted' | 'invited' | 'on_hold' | 'offer' | 'rejected' | 'hired'

interface Candidate {
  id: number; name: string; position: string | null; city: string | null
  experience: string | null; salary: string | null; phone: string | null
  hhUrl: string | null; dateAdded: string; vacancyTitle: string | null
  vacancyId: number | null; status: Status | null; rating: number | null
}

interface Vacancy { id: number; title: string }

interface SearchResult {
  name: string; position: string; city: string; salary: string
  experience: string; skills: string; hhUrl: string
}

const STATUS_LABELS: Record<Status, string> = {
  new: 'Новый', contacted: 'Связались', invited: 'Приглашён',
  on_hold: 'На рассмотрении', offer: 'Оффер', rejected: 'Отказ', hired: 'Принят',
}
const STATUS_COLORS: Record<Status, string> = {
  new: '#1565c0', contacted: '#e65100', invited: '#7b1fa2',
  on_hold: '#546e7a', offer: '#2e7d32', rejected: '#b71c1c', hired: '#1b5e20',
}

type Tab = 'all' | 'search' | 'rating'

export default function CandidatesPage() {
  const [tab, setTab]           = useState<Tab>('all')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [vacancies, setVacancies]   = useState<Vacancy[]>([])
  const [query, setQuery]       = useState('')
  const [statusFilter, setStatus] = useState('')
  const [vacancyFilter, setVacFilter] = useState('')
  const [ratingFilter, setRating] = useState('')
  const [loading, setLoading]   = useState(false)

  // HH Search
  const [hhQuery, setHhQuery]   = useState('')
  const [hhArea, setHhArea]     = useState('almaty')
  const [hhLimit, setHhLimit]   = useState('20')
  const [hhLoading, setHhLoading] = useState(false)
  const [hhResults, setHhResults] = useState<SearchResult[]>([])
  const [hhSelected, setHhSelected] = useState<Set<number>>(new Set())
  const [hhVacancy, setHhVacancy] = useState('')

  // Add candidate modal
  const [showAdd, setShowAdd]   = useState(false)
  const [addForm, setAddForm]   = useState({ name: '', position: '', city: '', phone: '', hh_url: '', experience: '', vacancy_id: '' })

  const loadCandidates = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (statusFilter) params.set('status', statusFilter)
    if (vacancyFilter) params.set('vacancy_id', vacancyFilter)
    if (ratingFilter) params.set('rating', ratingFilter)
    const res = await fetch(`/api/candidates?${params}`)
    const data = await res.json()
    setCandidates(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [query, statusFilter, vacancyFilter, ratingFilter])

  useEffect(() => {
    fetch('/api/vacancies').then(r => r.json()).then(d => setVacancies(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => {
    if (tab === 'all' || tab === 'rating') loadCandidates()
  }, [tab, loadCandidates])

  async function updateStatus(id: number, vacancyId: number | null, status: string) {
    if (!vacancyId) { toast.error('Кандидат не привязан к вакансии'); return }
    await fetch(`/api/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, vacancy_id: vacancyId }),
    })
    toast.success('Статус обновлён')
    loadCandidates()
  }

  async function updateRating(id: number, vacancyId: number | null, rating: number) {
    if (!vacancyId) { toast.error('Кандидат не привязан к вакансии'); return }
    await fetch(`/api/candidates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, vacancy_id: vacancyId }),
    })
    toast.success('Оценка сохранена')
    loadCandidates()
  }

  async function addCandidate() {
    const res = await fetch('/api/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addForm }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success('Кандидат добавлен')
      setShowAdd(false)
      setAddForm({ name: '', position: '', city: '', phone: '', hh_url: '', experience: '', vacancy_id: '' })
      loadCandidates()
    }
  }

  async function hhSearch() {
    if (!hhQuery.trim()) return
    setHhLoading(true)
    setHhResults([])
    setHhSelected(new Set())
    const res = await fetch('/api/hh/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: hhQuery, area: hhArea, limit: Number(hhLimit) }),
    })
    const data = await res.json()
    if (!data.success) { toast.error(data.error ?? 'Ошибка поиска'); setHhLoading(false); return }

    // Poll for result
    const taskId = data.task_id
    const poll = async () => {
      const r = await fetch(`/api/hh/scrape/${taskId}`)
      const d = await r.json()
      if (d.status === 'running') { setTimeout(poll, 1500); return }
      setHhLoading(false)
      if (d.status === 'error') { toast.error(d.error ?? 'Ошибка'); return }
      setHhResults(d.result ?? [])
      toast.success(`Найдено ${d.result?.length ?? 0} резюме`)
    }
    setTimeout(poll, 1500)
  }

  async function importSelected() {
    const toImport = hhResults.filter((_, i) => hhSelected.has(i))
    if (!toImport.length) { toast.error('Выберите кандидатов'); return }
    const res = await fetch('/api/hh/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidates: toImport, vacancy_id: hhVacancy || null }),
    })
    const data = await res.json()
    if (data.success) {
      toast.success(`Импортировано ${data.saved} кандидатов`)
      setHhResults([])
      setHhSelected(new Set())
    }
  }

  const filtered = tab === 'rating'
    ? candidates.filter(c => c.rating)
    : candidates

  return (
    <div className="p-6 flex flex-col gap-4">

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {([['all', 'Все кандидаты'], ['search', 'Поиск HH'], ['rating', 'Оценки']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t ? 'var(--color-red)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--color-muted)',
            }}
          >{label}</button>
        ))}
      </div>

      {/* ── TAB: ALL / RATING ── */}
      {(tab === 'all' || tab === 'rating') && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-muted)' }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadCandidates()}
                placeholder="Поиск по имени, должности..."
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
            <select
              value={vacancyFilter}
              onChange={e => setVacFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="">Все вакансии</option>
              {vacancies.map(v => <option key={v.id} value={String(v.id)}>{v.title}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatus(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="">Все статусы</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            {tab === 'rating' && (
              <select
                value={ratingFilter}
                onChange={e => setRating(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                <option value="">Все оценки</option>
                {[5,4,3,2,1].map(r => <option key={r} value={String(r)}>{'★'.repeat(r)}</option>)}
              </select>
            )}
            <button
              onClick={loadCandidates}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--color-red)', color: '#fff' }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : 'Найти'}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ border: '1px solid var(--color-red)', color: 'var(--color-red)' }}
            >
              <Plus size={14} /> Добавить
            </button>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    {['Имя', 'Должность', 'Вакансия', 'Город', 'Опыт', 'Статус', 'Оценка', 'Дата', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td className="px-4 py-3">
                        <div className="font-semibold" style={{ color: 'var(--color-text)' }}>{c.name}</div>
                        {c.phone && <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{c.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{c.position ?? '—'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{c.vacancyTitle ?? '—'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{c.city ?? '—'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{c.experience ?? '—'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={c.status ?? ''}
                          onChange={e => updateStatus(c.id, c.vacancyId, e.target.value)}
                          className="px-2 py-1 rounded-full text-xs font-semibold outline-none cursor-pointer"
                          style={{
                            background: c.status ? `${STATUS_COLORS[c.status]}20` : 'transparent',
                            color: c.status ? STATUS_COLORS[c.status] : 'var(--color-muted)',
                            border: 'none',
                          }}
                        >
                          <option value="">—</option>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              onClick={() => updateRating(c.id, c.vacancyId, star)}
                              style={{ color: (c.rating ?? 0) >= star ? '#f59e0b' : 'var(--color-border)', fontSize: 16 }}
                            >★</button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                        {c.dateAdded ? new Date(c.dateAdded).toLocaleDateString('ru') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {c.hhUrl && (
                          <a href={c.hhUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={14} style={{ color: 'var(--color-muted)' }} />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                        Кандидаты не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── TAB: HH SEARCH ── */}
      {tab === 'search' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <input
              value={hhQuery}
              onChange={e => setHhQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && hhSearch()}
              placeholder="Должность или ключевые слова..."
              className="flex-1 min-w-64 px-4 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
            <select
              value={hhArea}
              onChange={e => setHhArea(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <option value="almaty">Алматы</option>
              <option value="astana">Астана</option>
              <option value="kz">Весь Казахстан</option>
            </select>
            <select
              value={hhLimit}
              onChange={e => setHhLimit(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              {[10,20,30,50].map(n => <option key={n} value={String(n)}>{n} резюме</option>)}
            </select>
            <button
              onClick={hhSearch}
              disabled={hhLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--color-red)', color: '#fff', opacity: hhLoading ? 0.7 : 1 }}
            >
              {hhLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Искать
            </button>
          </div>

          {hhResults.length > 0 && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  Найдено {hhResults.length} · Выбрано {hhSelected.size}
                </span>
                <button
                  onClick={() => setHhSelected(new Set(hhResults.map((_, i) => i)))}
                  className="text-xs px-3 py-1 rounded-lg"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
                >Выбрать все</button>
                <button
                  onClick={() => setHhSelected(new Set())}
                  className="text-xs px-3 py-1 rounded-lg"
                  style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
                >Снять</button>
                <select
                  value={hhVacancy}
                  onChange={e => setHhVacancy(e.target.value)}
                  className="px-3 py-1.5 rounded-lg text-sm outline-none ml-auto"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="">Без вакансии</option>
                  {vacancies.map(v => <option key={v.id} value={String(v.id)}>{v.title}</option>)}
                </select>
                <button
                  onClick={importSelected}
                  disabled={!hhSelected.size}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold"
                  style={{ background: 'var(--color-red)', color: '#fff', opacity: hhSelected.size ? 1 : 0.5 }}
                >
                  <Plus size={14} /> Импортировать ({hhSelected.size})
                </button>
              </div>

              <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th className="px-4 py-2.5 w-10"></th>
                      {['Имя', 'Должность', 'Город', 'Опыт', 'Зарплата', ''].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {hhResults.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-border)', background: hhSelected.has(i) ? 'var(--color-red-soft)' : 'transparent' }}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={hhSelected.has(i)}
                            onChange={e => {
                              const s = new Set(hhSelected)
                              e.target.checked ? s.add(i) : s.delete(i)
                              setHhSelected(s)
                            }}
                            className="accent-red-600"
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--color-text)' }}>{r.name}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{r.position}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{r.city}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{r.experience}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{r.salary}</td>
                        <td className="px-4 py-3">
                          {r.hhUrl && (
                            <a href={r.hhUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={14} style={{ color: 'var(--color-muted)' }} />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!hhLoading && hhResults.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16" style={{ color: 'var(--color-muted)' }}>
              <Search size={40} />
              <span className="text-sm">Введи должность и нажми Искать</span>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: ADD ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 flex flex-col gap-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Добавить кандидата</span>
              <button onClick={() => setShowAdd(false)} style={{ color: 'var(--color-muted)' }}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([['name','Имя *'],['position','Должность'],['city','Город'],['phone','Телефон'],['experience','Опыт'],['hh_url','Ссылка HH']] as [keyof typeof addForm, string][]).map(([k, label]) => (
                <div key={k} className={k === 'hh_url' ? 'col-span-2' : ''}>
                  <label className="block text-xs mb-1" style={{ color: 'var(--color-muted)' }}>{label}</label>
                  <input
                    value={addForm[k]}
                    onChange={e => setAddForm(f => ({ ...f, [k]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Вакансия</label>
                <select
                  value={addForm.vacancy_id}
                  onChange={e => setAddForm(f => ({ ...f, vacancy_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="">— Не указана —</option>
                  {vacancies.map(v => <option key={v.id} value={String(v.id)}>{v.title}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>Отмена</button>
              <button
                onClick={addCandidate}
                disabled={!addForm.name.trim()}
                className="px-5 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--color-red)', color: '#fff', opacity: addForm.name.trim() ? 1 : 0.5 }}
              >Добавить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
