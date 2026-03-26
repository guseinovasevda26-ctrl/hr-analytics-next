# Деплой HR Analytics Next на Railway

## Шаг 1 — Инициализировать Git репозиторий

```bash
cd C:\Users\sevda.guseinova\Desktop\HR_Analytics_Next
git init
git add .
git commit -m "initial: HR Analytics Next.js"
```

## Шаг 2 — Создать новый Railway проект

1. Зайди на https://railway.app → New Project
2. **Deploy from GitHub repo** → подключи аккаунт `guseinovasevda26-ctrl`
3. Создай новый GitHub репозиторий `hr-analytics-next` и сделай push:
   ```bash
   git remote add origin https://github.com/guseinovasevda26-ctrl/hr-analytics-next.git
   git push -u origin main
   ```
4. В Railway: **Add a Service → PostgreSQL** — Railway создаст базу автоматически

## Шаг 3 — Переменные окружения в Railway

В Railway → Settings → Variables добавь:

| Ключ | Значение |
|------|----------|
| `DATABASE_URL` | (подставляется автоматически из PostgreSQL плагина) |
| `NEXTAUTH_SECRET` | `hr-analytics-nextauth-secret-2025` |
| `NEXTAUTH_URL` | `https://ВАШ_ДОМЕН.up.railway.app` |
| `HH_CLIENT_ID` | `Q4GC34TE6HF2N5A4QD15F1SD23EIHRTNHJ9TTONDE9QIQP82RQST801VAA4OSRGV` |
| `HH_CLIENT_SECRET` | `MUIK6IRIK2I430A762UI5FMCR1JTBF3TF9UJEJ72F4VUOUU0LDNIS87QSD1B1L29` |
| `HH_EMPLOYER_ID` | `38931` |
| `HH_REDIRECT_URI` | `https://ВАШ_ДОМЕН.up.railway.app/hh/oauth/callback` |
| `GEMINI_API_KEY` | `AIzaSyBWhzWA5MD-iLnOiM8RSfmucYvChHpZYMk` |

## Шаг 4 — Создать таблицы и дефолтных пользователей

После первого деплоя зайди в Railway → Shell (или локально):

```bash
# Локально:
npx prisma migrate dev --name init
npx ts-node lib/seed.ts
```

На Railway через Railway CLI:
```bash
railway run npx prisma migrate deploy
railway run npx ts-node lib/seed.ts
```

## Шаг 5 — Обновить HH OAuth Redirect URI

На https://dev.hh.kz в приложении "HR Автоматизация Sulpak" (заявка #18761)
обнови Redirect URI на: `https://ВАШ_ДОМЕН.up.railway.app/hh/oauth/callback`

## Локальный запуск

```bash
cd C:\Users\sevda.guseinova\Desktop\HR_Analytics_Next
npm install
# Отредактируй .env.local — укажи DATABASE_URL (PostgreSQL или SQLite)
# Для SQLite измени datasource в prisma/schema.prisma: provider = "sqlite", url = "file:./dev.db"
npx prisma migrate dev --name init
npx ts-node lib/seed.ts
npm run dev
# Открой http://localhost:3000
```

## Логины

- `admin` / `admin123` — Администратор
- `sevda` / `sevda123` — Рекрутер

## Важно

- **Next.js 15** (не 16 — 16 ещё не выпущен, 15 — последняя стабильная версия с React 19)
- `output: 'standalone'` в next.config.ts — нужен для Railway (Node.js сервер)
- PostgreSQL на Railway **не сбрасывается** при рестарте (в отличие от SQLite в старом Flask)
- Tailwind CSS 4 — конфигурация через CSS (`globals.css`), не через `tailwind.config.js`
