export default function HelpPage() {
  const sections = [
    {
      title: 'Главная / Dashboard',
      items: [
        'KPI-карточки: всего кандидатов, добавлено сегодня, на интервью, принято',
        'Статус HH подключения — кнопка "Подключить HH" если не авторизован',
        'Воронка по вакансиям — статусы на каждой стадии',
        'Добавление новой вакансии прямо из интерфейса',
      ],
    },
    {
      title: 'Кандидаты',
      items: [
        'Вкладка "Все кандидаты" — полная база с фильтрами и inline-изменением статуса/оценки',
        'Вкладка "Поиск HH" — поиск резюме по HH API (нужно подключение HH)',
        'Вкладка "Оценки" — только кандидаты с выставленными оценками',
        'Добавление кандидата вручную через кнопку "Добавить"',
      ],
    },
    {
      title: 'Аналитика',
      items: [
        'Столбчатый график — кандидаты по вакансиям',
        'Круговая диаграмма — распределение',
        'Таблицы по вакансиям и рекрутерам',
      ],
    },
    {
      title: 'Сообщения (AI)',
      items: [
        'Генерация персонального письма кандидату через Gemini AI',
        'Укажи вакансию — и получи готовый текст',
        'Письмо можно редактировать прямо в интерфейсе и скопировать',
      ],
    },
    {
      title: 'Профили вакансий',
      items: [
        'Шаблон для автопоиска на HH: ключевые слова, опыт, город',
        'Коды опыта: noExperience, between1And3, between3And6, moreThan6',
        'Коды городов: 160=Алматы, 162=Астана',
      ],
    },
    {
      title: 'HH OAuth',
      items: [
        'Нажми "Подключить HH" на главной',
        'После авторизации токен сохраняется в базе',
        'Без подключения HH поиск резюме недоступен',
        'Redirect URI: https://hr-analytics-production-a951.up.railway.app/hh/oauth/callback',
      ],
    },
    {
      title: 'Логины по умолчанию',
      items: [
        'admin / admin123 — Администратор (доступ к управлению пользователями)',
        'sevda / sevda123 — Рекрутер',
        'Смени пароли после первого входа через Settings → Управление пользователями',
      ],
    },
  ]

  return (
    <div className="p-6 flex flex-col gap-4 max-w-3xl">
      <h1 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Справочник</h1>
      {sections.map(s => (
        <div key={s.title} className="rounded-xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="font-semibold text-sm mb-3" style={{ color: 'var(--color-red)' }}>{s.title}</div>
          <ul className="flex flex-col gap-1.5">
            {s.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-muted)' }}>
                <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--color-red)' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
