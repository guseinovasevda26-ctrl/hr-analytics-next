import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const { candidate_name, vacancy_title, resume_text } = data

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ success: false, error: 'GEMINI_API_KEY не задан' })

  const prompt = `Напиши короткое профессиональное сообщение кандидату на русском языке.
Имя: ${candidate_name ?? ''}
Вакансия: ${vacancy_title ?? ''}
Кратко о кандидате: ${(resume_text ?? '').slice(0, 500) || 'не указано'}

Требования:
- дружелюбный тон
- не более 5-6 предложений
- пригласить на диалог
- только текст письма, без темы и подписи`

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    )
    const result = await resp.json()
    if (!resp.ok || !result.candidates) {
      return NextResponse.json({ success: false, error: result.error?.message ?? 'Ошибка Gemini' })
    }
    const letter = result.candidates[0].content.parts[0].text.trim()
    return NextResponse.json({ success: true, letter })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) })
  }
}
