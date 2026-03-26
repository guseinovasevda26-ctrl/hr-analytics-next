'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, Search, Briefcase, MessageSquare,
  BarChart2, Settings, HelpCircle, LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard',   label: 'Главная',     icon: LayoutDashboard },
  { href: '/candidates',  label: 'Кандидаты',   icon: Users },
  { href: '/search',      label: 'Поиск HH',    icon: Search },
  { href: '/profiles',    label: 'Профили',      icon: Briefcase },
  { href: '/messages',    label: 'Сообщения',   icon: MessageSquare },
  { href: '/analytics',   label: 'Аналитика',   icon: BarChart2 },
  { href: '/settings',    label: 'Настройки',   icon: Settings },
  { href: '/help',        label: 'Справочник',  icon: HelpCircle },
]

interface SidebarProps {
  userName: string
  userRole: string
}

export default function Sidebar({ userName, userRole }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col h-screen w-56 shrink-0"
      style={{
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-red)' }}
        >
          <Users size={16} color="#fff" />
        </div>
        <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>HR Analytics</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                color: active ? '#fff' : 'var(--color-muted)',
                background: active ? 'var(--color-red)' : 'transparent',
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div
        className="flex items-center gap-2.5 px-3 py-3 mx-2 mb-3 rounded-lg"
        style={{ background: 'var(--color-bg)' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
          style={{ background: 'var(--color-red)', color: '#fff' }}
        >
          {userName?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold truncate" style={{ color: 'var(--color-text)' }}>{userName}</div>
          <div className="text-xs" style={{ color: 'var(--color-muted)' }}>
            {userRole === 'admin' ? 'Администратор' : 'Рекрутер'}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          title="Выйти"
          className="p-1 rounded transition-colors hover:opacity-70"
          style={{ color: 'var(--color-muted)' }}
        >
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}
