'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Briefcase } from 'lucide-react'
import { toast } from 'sonner'

interface Profile { id: number; title: string; description: string | null; keywords: string | null; experience: string | null; city: string | null }

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [showAdd, setShowAdd]   = useState(false)
  const [form, setForm]         = useState({ title: '', description: '', keywords: '', experience: '', city: '' })

  async function load() {
    const res = await fetch('/api/profiles')
    if (res.ok) setProfiles(await res.json())
  }

  useEffect(() => { load() }, [])

  async function add() {
    if (!form.title.trim()) return
    const res = await fetch('/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('Профиль создан')
      setForm({ title: '', description: '', keywords: '', experience: '', city: '' })
      setShowAdd(false)
      load()
    }
  }

  async function remove(id: number) {
    await fetch('/api/profiles', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Удалено')
    load()
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Профили вакансий</h1>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--color-red)', color: '#fff' }}
        ><Plus size={14} /> Создать профиль</button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {([['title','Название *'],['keywords','Ключевые слова'],['description','Описание требований'],['experience','Опыт (noExperience / between1And3 / between3And6 / moreThan6)'],['city','Код города (160=Алматы, 162=Астана)']] as [keyof typeof form, string][]).map(([k, label]) => (
            <div key={k}>
              <label className="block text-xs mb-1" style={{ color: 'var(--color-muted)' }}>{label}</label>
              {k === 'description' ? (
                <textarea rows={3} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
              ) : (
                <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={add} className="px-5 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--color-red)', color: '#fff' }}>Сохранить</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>Отмена</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {profiles.map(p => (
          <div key={p.id} className="rounded-xl p-4 flex gap-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--color-red-soft)' }}>
              <Briefcase size={18} style={{ color: 'var(--color-red)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{p.title}</div>
              {p.keywords && <div className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>Ключевые слова: {p.keywords}</div>}
              {p.description && <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>{p.description}</div>}
              <div className="flex gap-3 mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                {p.experience && <span>Опыт: {p.experience}</span>}
                {p.city && <span>Город: {p.city}</span>}
              </div>
            </div>
            <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#e53935' }}>
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        {!profiles.length && (
          <div className="col-span-2 flex flex-col items-center gap-2 py-16" style={{ color: 'var(--color-muted)' }}>
            <Briefcase size={40} />
            <span className="text-sm">Нет профилей вакансий</span>
          </div>
        )}
      </div>
    </div>
  )
}
