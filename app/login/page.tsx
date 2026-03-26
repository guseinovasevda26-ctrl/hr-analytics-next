'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Users } from 'lucide-react'

const QUICK_USERS = [
  { label: 'Севда Гусейнова', username: 'sevda', password: 'sevda123', role: 'Рекрутер' },
  { label: 'Администратор', username: 'admin', password: 'admin123', role: 'Админ' },
]

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function quickLogin(username: string, password: string) {
    setLoading(username)
    setError('')
    const res = await signIn('credentials', { username, password, redirect: false })
    setLoading(null)
    if (res?.error) {
      setError('Ошибка входа')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-red)' }}
          >
            <Users size={20} color="#fff" />
          </div>
          <div>
            <div className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>HR Analytics</div>
            <div className="text-xs" style={{ color: 'var(--color-muted)' }}>Автоматизация рекрутинга</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm mb-1" style={{ color: 'var(--color-muted)' }}>Выберите профиль для входа:</p>

          {QUICK_USERS.map(u => (
            <button
              key={u.username}
              onClick={() => quickLogin(u.username, u.password)}
              disabled={loading !== null}
              className="w-full py-3 px-4 rounded-xl text-left flex items-center gap-3 transition-all"
              style={{
                background: loading === u.username ? 'var(--color-red)' : 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                cursor: loading !== null ? 'not-allowed' : 'pointer',
                opacity: loading !== null && loading !== u.username ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-red)' }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--color-border)' }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: 'var(--color-red)', color: '#fff' }}
              >
                {loading === u.username
                  ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full block" />
                  : u.label[0]}
              </div>
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{u.label}</div>
                <div className="text-xs" style={{ color: 'var(--color-muted)' }}>{u.role}</div>
              </div>
            </button>
          ))}

          {error && (
            <div className="text-sm px-3 py-2 rounded-lg mt-1" style={{ background: 'rgba(229,57,53,0.12)', color: '#ef9a9a' }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
