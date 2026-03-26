import prisma from './db'

export const HH_API_BASE = 'https://api.hh.ru'
export const HH_AUTH_URL = 'https://hh.kz/oauth/authorize'
export const HH_TOKEN_URL = 'https://hh.kz/oauth/token'

export async function getHhHeaders(): Promise<{ headers: Record<string, string> } | { error: string }> {
  const token = await prisma.hhToken.findFirst({ orderBy: { updatedAt: 'desc' } })
  if (!token) return { error: 'HH не подключён. Авторизуйся через Главную.' }
  return {
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
      'HH-User-Agent': 'HRAnalytics/1.0 (sulpak.kz)',
    },
  }
}

export async function getHhStatus() {
  const token = await prisma.hhToken.findFirst({ orderBy: { updatedAt: 'desc' } })
  return { connected: !!token, expiresAt: token?.expiresAt ?? null }
}
