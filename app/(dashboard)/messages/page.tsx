'use client'

import { useState } from 'react'
import { Sparkles, Copy, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function MessagesPage() {
  const [name, setName]         = useState('')
  const [vacancy, setVacancy]   = useState('')
  const [resumeText, setResume] = useState('')
  const [letter, setLetter]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [copied, setCopied]     = useState(false)

  async function generate() {
    if (!vacancy.trim()) { toast.error('Укажите вакансию'); return }
    setLoading(true)
    const res = await fetch('/api/letter/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_name: name, vacancy_title: vacancy, resume_text: resumeText }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setLetter(data.letter)
      toast.success('Письмо сгенерировано')
    } else {
      toast.error(data.error ?? 'Ошибка генерации')
    }
  }

  function copy() {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Скопировано')
  }

  return (
    <div className="p-6 flex flex-col gap-4 max-w-2xl">
      <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Генерация писем (AI)</h1>

      <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        {([['Имя кандидата', name, setName, 'Иванов Иван'],['Вакансия *', vacancy, setVacancy, 'Менеджер по продажам']] as [string, string, (v: string) => void, string][]).map(([label, val, setter, ph]) => (
          <div key={label}>
            <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>{label}</label>
            <input
              value={val}
              onChange={e => setter(e.target.value)}
              placeholder={ph}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>
        ))}
        <div>
          <label className="block text-xs mb-1.5" style={{ color: 'var(--color-muted)' }}>Краткое резюме / навыки (необязательно)</label>
          <textarea
            rows={3}
            value={resumeText}
            onChange={e => setResume(e.target.value)}
            placeholder="Опыт работы, навыки..."
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold w-full"
          style={{ background: 'var(--color-red)', color: '#fff', opacity: loading ? 0.7 : 1 }}
        >
          {loading
            ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            : <Sparkles size={15} />}
          {loading ? 'Генерирую...' : 'Сгенерировать письмо'}
        </button>
      </div>

      {letter && (
        <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Готовое письмо</span>
            <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>
              {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
              {copied ? 'Скопировано' : 'Копировать'}
            </button>
          </div>
          <textarea
            value={letter}
            onChange={e => setLetter(e.target.value)}
            rows={8}
            className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
            style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', lineHeight: 1.7 }}
          />
        </div>
      )}
    </div>
  )
}
