import { NextRequest, NextResponse } from 'next/server'
import { HH_TOKEN_URL } from '@/lib/hh'
import prisma from '@/lib/db'

const PAGE = (ok: boolean, msg: string, detail = '') => `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8"><title>HH OAuth</title>
<style>body{background:#0d0f1a;color:#e4e6f0;font-family:"Segoe UI",sans-serif;
display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{background:#161928;border:1px solid #252840;border-radius:16px;padding:40px 48px;
max-width:480px;width:100%;text-align:center}
.icon{font-size:56px;margin-bottom:16px}
h2{margin:0 0 12px;color:${ok ? '#4caf50' : '#e53935'}}
p{color:#8b8fa8;font-size:14px;margin:0 0 24px}
a{background:#e53935;color:#fff;text-decoration:none;padding:12px 28px;
border-radius:8px;font-size:14px;font-weight:600}
pre{background:#0d0f1a;border-radius:8px;padding:12px;font-size:12px;color:#ff8a80;
text-align:left;white-space:pre-wrap;max-height:140px;overflow-y:auto}
</style></head><body><div class="box">
<div class="icon">${ok ? '✅' : '❌'}</div>
<h2>${msg}</h2>
${detail ? `<pre>${detail}</pre>` : ''}
<a href="/dashboard">${ok ? 'Перейти в HR Analytics →' : 'Вернуться →'}</a>
</div></body></html>`

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) return new NextResponse(PAGE(false, 'HH отклонил авторизацию', error), { headers: { 'Content-Type': 'text/html' } })
  if (!code) return new NextResponse(PAGE(false, 'Ошибка: код не получен от HH'), { headers: { 'Content-Type': 'text/html' } })

  const resp = await fetch(HH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'authorization_code',
      client_id:     process.env.HH_CLIENT_ID!,
      client_secret: process.env.HH_CLIENT_SECRET!,
      code,
      redirect_uri:  process.env.HH_REDIRECT_URI!,
    }),
  })

  if (resp.ok) {
    const data = await resp.json()
    const expiresAt = new Date(Date.now() + (data.expires_in ?? 1209600) * 1000).toISOString()

    await prisma.hhToken.deleteMany()
    await prisma.hhToken.create({
      data: { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt },
    })

    return new NextResponse(PAGE(true, 'HH успешно подключён!'), { headers: { 'Content-Type': 'text/html' } })
  }

  const errText = await resp.text()
  return new NextResponse(PAGE(false, `Ошибка токена HH (HTTP ${resp.status})`, errText.slice(0, 300)), {
    headers: { 'Content-Type': 'text/html' },
  })
}
