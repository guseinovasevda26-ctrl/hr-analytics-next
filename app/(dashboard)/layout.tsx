import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
import { Toaster } from 'sonner'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      <Sidebar
        userName={session.user?.name ?? ''}
        userRole={(session.user as { role?: string })?.role ?? 'recruiter'}
      />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Toaster richColors position="top-right" theme="dark" />
    </div>
  )
}
