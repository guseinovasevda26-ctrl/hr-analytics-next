import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HR Analytics',
  description: 'Дашборд для автоматизации рекрутинга',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
