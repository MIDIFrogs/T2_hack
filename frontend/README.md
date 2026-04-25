# T2 Schedule Frontend

Современный веб-интерфейс для системы планирования рабочего времени сотрудников T2.

## 🎨 Особенности

- **🖌️ Paint Tool** — быстрая закраска дней как в Photoshop
- **📅 Drag & Drop Calendar** — интерактивный календарь с drag-paint
- **⚡ Real-time Stats** — мгновенный подсчёт часов
- **🎯 Quick Fill Menu** — правый клик для быстрого заполнения
- **✨ Framer Motion Animations** — плавные анимации
- **🎨 T2 Design System** — полное соответствие брендбуку
- **📱 Mobile First** — адаптивный дизайн

## 🚀 Стек технологий

- **Next.js 14** — React framework с App Router
- **TypeScript** — типизация
- **Tailwind CSS** — стили
- **Framer Motion** — анимации
- **Zustand** — state management
- **date-fns** — работа с датами
- **Lucide React** — иконки

## 📦 Установка

```bash
# Установить зависимости
npm install

# Запустить dev server
npm run dev
```

Приложение будет доступно на [http://localhost:3000](http://localhost:3000)

## 🔧 Настройка

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📁 Структура проекта

```
frontend/
├── app/                    # Next.js App Router
│   ├── calendar/           # Календарь
│   ├── profile/            # Профиль и статистика
│   ├── login/              # Страница входа
│   └── globals.css         # Глобальные стили
├── components/             # React компоненты
│   ├── calendar/           # Компоненты календаря
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarDay.tsx
│   │   ├── PaintTool.tsx
│   │   ├── DayModal.tsx
│   │   └── QuickFillMenu.tsx
│   ├── stats/              # Компоненты статистики
│   │   └── StatsCard.tsx
│   └── layout/             # Layout компоненты
│       └── Header.tsx
├── lib/                    # Утилиты и helpers
│   ├── api.ts              # API клиент
│   ├── store.ts            # Zustand stores
│   └── utils.ts            # Helper функции
└── types/                  # TypeScript типы
    └── index.ts
```

## 🎨 T2 Design System

Проект полностью соответствует брендбуку T2:

- **Цвета:**
  - Черный: `#000000`
  - Белый: `#FFFFFF`
  - Маджента: `#FF3495`
  - Салатовый: `#A7FC00`
  - Электрик-блю: `#00BFFFF`
  - Синий: `#0000FF`

- **Типографика:**
  - Display: Halvar Breitschrift ExtraBold (fallback: Inter)
  - Body: Rooftop (fallback: Inter)

- **Скругления:**
  - Bento: 32px
  - Кнопки: 50px (oval)

## 📝 Скрипты

```bash
npm run dev          # Запустить dev server
npm run build        # Собрать для продакшена
npm run start        # Запустить production build
npm run lint         # Запустить линтер
```

## 🔐 API Endpoints

### Auth
- `POST /auth/login` — Вход
- `POST /auth/register` — Регистрация
- `GET /auth/me` — Текущий пользователь

### Schedule
- `GET /schedules/me` — Получить график
- `PUT /schedules/me` — Обновить график

### Periods
- `GET /periods/current` — Текущий период

### Templates
- `GET /templates` — Получить шаблоны
- `POST /templates` — Создать шаблон
- `DELETE /templates/{id}` — Удалить шаблон

## 🎯 Киллер-фичи

### 1. Paint Tool (Кисточка)
Выберите тип дня и закрашивайте дни зажав кнопку мыши!

### 2. Quick Fill Menu
ПКМ на день → быстрые опции заполнения:
- До конца месяца (рабочие/выходные)
- На 2 недели
- Каждую Пн-Пт
- Каждый второй день

### 3. Real-time Conflict Detection
Автоматическая проверка:
- Переработки (>160 часов)
- Недоработки (<160 часов)
- Нарушения ТК РФ

### 4. Undo/Redo
Отмена действий с история изменений

## 📱 Адаптивность

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🚀 Production

```bash
# Сборка
npm run build

# Запуск
npm run start
```

## 📄 Лицензия

T2 © 2026
