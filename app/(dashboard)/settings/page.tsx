'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'

interface User { id: number; username: string; fullName: string | null; role: string; createdAt: string }

export default function SettingsPage() {
  const [users, setUsers]     = useState<User[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ username: '', password: '', fullName: '', role: 'recruiter' })

  async function load() {
    const res = await fetch('/api/users')
    if (res.ok) setUsers(await res.json())
    else if (res.status === 403) toast.error('Только администратор')
  }

  useEffect(() => { load() }, [])

  async function add() {
    if (!form.username.trim() || !form.password.trim()) { toast.error('Логин и пароль обязательны'); return }
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success('Пользователь создан')
      setForm({ username: '', password: '', fullName: '', role: 'recruiter' })
      setShowAdd(false)
      load()
    } else {
      toast.error(data.error ?? 'Ошибка')
    }
  }

  async function remove(id: number) {
    await fetch('/api/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Удалено')
    load()
  }

  return (
    <div className="p-6 flex flex-col gap-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Управление пользователями</h1>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--color-red)', color: '#fff' }}
        ><Plus size={14} /> Добавить</button>
      </div>

      {showAdd && (
        <div className="rounded-xl p-5 flex flex-col gap-3" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="grid grid-cols-2 gap-3">
            {([['username','Логин *',''],['password','Пароль *',''],['fullName','Полное имя','']] as [keyof typeof form, string, string][]).map(([k, label]) => (
              <div key={k} className={k === 'fullName' ? 'col-span-2' : ''}>
                <label className="block text-xs mb-1" style={{ color: 'var(--color-muted)' }}>{label}</label>
                <input
                  type={k === 'password' ? 'password' : 'text'}
                  value={form[k]}
                  onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Роль</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                <option value="recruiter">Рекрутер</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={add} className="px-5 py-2 rounded-lg text-sm font-semibold" style={{ background: 'var(--color-red)', color: '#fff' }}>Создать</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}>Отмена</button>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
              {['Пользователь', 'Логин', 'Роль', 'Создан', ''].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: 'var(--color-red)', color: '#fff' }}>
                      {(u.fullName ?? u.username)[0].toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>{u.fullName ?? u.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{u.username}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: u.role === 'admin' ? 'rgba(229,57,53,0.12)' : 'rgba(33,150,243,0.12)', color: u.role === 'admin' ? '#e53935' : '#1565c0' }}>
                    {u.role === 'admin' ? 'Администратор' : 'Рекрутер'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>
                  {new Date(u.createdAt).toLocaleDateString('ru')}
                </td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <button onClick={() => remove(u.id)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: '#e53935' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--color-muted)' }}>Нет пользователей</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
