# 🎉 T2 Schedule Frontend - ГОТОВО!

## 🚀 Запуск проекта

### 1. Запуск бэкенда

```bash
cd "C:\Users\maksi\OneDrive\Рабочий стол\t2_hack"
python -m uvicorn app:create_app --reload --host 0.0.0.0 --port 8000
```

Бэкенд будет доступен на http://localhost:8000

### 2. Запуск фронта

Фронт уже запущен на **http://localhost:3000** 🎉

Если нужно перезапустить:
```bash
cd "C:\Users\maksi\OneDrive\Рабочий стол\t2_hack\frontend"
npm run dev
```

## 📝 Что сделано

### ✅ Core Features
- [x] Calendar Grid с drag-paint
- [x] Paint Tool (кисточка как в Photoshop)
- [x] Quick Fill Menu (правый клик)
- [x] Day Settings Modal
- [x] Real-time Stats
- [x] Conflict Detection
- [x] Undo/Redo (история изменений)
- [x] Profile & Stats Page
- [x] Login Page

### ✅ Design
- [x] T2 Design System
- [x] Цветовая схема (маджента, салатовый, etc.)
- [x] Bento-cards с правильными скруглениями
- [x] Framer Motion анимации
- [x] Responsive дизайн

### ✅ Technical
- [x] TypeScript
- [x] Zustand stores
- [x] API клиент
- [x] Auth integration
- [x] Error handling

## 🎯 Как пользоваться

### Paint Tool (Кисточка)
1. Выбери тип дня (Рабочий, Выходной, Отпуск, etc.)
2. Зажми кнопку мыши и веди по дням
3. Дни закрашиваются в выбранный цвет!

### Quick Fill Menu
1. Нажми правую кнопку мыши на день
2. Выбери опцию быстрого заполнения
3. График заполнится автоматически!

### Day Settings
1. Кликни на день
2. Откроется модалка с настройками
3. Укажи время работы, дробление смены, примечание

### Profile
1. Нажми на аватар в хедере
2. Увидишь статистику и достижения

## 📦 Структура проекта

```
frontend/
├── app/
│   ├── page.tsx              # Главная страница (календарь)
│   ├── profile/page.tsx      # Профиль
│   ├── login/page.tsx        # Логин
│   ├── layout.tsx            # Root layout
│   └── globals.css           # T2 styles
│
├── components/
│   ├── calendar/
│   │   ├── CalendarGrid.tsx       # Сетка календаря
│   │   ├── CalendarDay.tsx        # День календаря
│   │   ├── PaintTool.tsx          # Кисточка ⭐
│   │   ├── DayModal.tsx           # Модалка настроек дня
│   │   ├── QuickFillMenu.tsx      # Правый клик меню ⭐
│   │   └── PeriodInfo.tsx         # Информация о периоде
│   ├── stats/
│   │   └── StatsCard.tsx          # Карточка статистики
│   └── layout/
│       └── Header.tsx             # Хедер
│
├── lib/
│   ├── api.ts                # API клиент
│   ├── store.ts              # Zustand stores
│   └── utils.ts              # Helpers
│
└── types/
    └── index.ts              # TypeScript типы
```

## 🎨 Киллер-фичи

### 1. Paint Tool (Кисточка) ⭐⭐⭐
Вдохновение: Format Painter в Word, Brush в Photoshop

- Выбор типа дня из dropdown
- Drag-paint: зажать и вести
- Undo/Redo
- Preview при наведении

### 2. Quick Fill Menu (Правый клик) ⭐⭐⭐
Быстрое заполнение диапазонов:
- До конца месяца (рабочие/выходные)
- На 2 недели
- Каждую Пн-Пт (4 недели)
- Каждый второй день
- Из шаблона

### 3. Real-time Stats ⭐⭐
Мгновенный подсчёт:
- Всего часов
- Прогресс до 160
- Переработки/недоработки
- Distribution по дням

### 4. Conflict Detection ⭐
Автоматическая проверка:
- Переработка (>160 часов)
- Недоработка (<160 часов)
- Слишком длинная смена
- Недостаточный перерыв

## 🔗 Integration с бэкендом

Все API endpoints уже подключены:

```typescript
// Auth
POST /auth/login
POST /auth/register
GET  /auth/me

// Schedule
GET  /schedules/me
PUT  /schedules/me

// Periods
GET  /periods/current

// Templates
GET    /templates
POST   /templates
DELETE /templates/{id}
```

## 🐛 Если что-то не работает

### Ошибка 401
Токен истёк → зановя логин

### Ошибка CORS
Проверь NEXT_PUBLIC_API_URL в .env.local

### Не работает drag-paint
Проверь, что браузер поддерживает Drag and Drop API

### Нет периодов
Зайди в админку бэкенда и создай период

## 📸 Скриншоты

### Calendar View
- Paint Tool сверху
- Месяц по центру
- Days grid с цветовой кодировкой
- Stats внизу
- Кнопка "Сохранить" (если есть изменения)

### Profile Page
- Avatar и user info
- 4 карточки статистики
- Distribution chart
- Achievements с анимацией

## 🎯 Demo сценарий

1. Открой http://localhost:3000
2. Войди в систему (создай юзера в бэке)
3. Выбери "Рабочий день" в Paint Tool
4. Закрась неделю с drag-paint
5. Кликни на день → настроить время
6. ПКМ на день → Quick Fill
7. Открой профиль → посмотри статистику
8. Сохрани график

## 💡 Следующие шаги (если останется время)

1. **Templates System** — сохранить как шаблон
2. **Smart Suggestions** — "повторить прошлый месяц"
3. **Heatmap** — показывать загруженность
4. **Export to iCal** — Google Calendar sync
5. **Notifications** — напоминания о дедлайне
6. **Dark Mode** — тёмная тема

## 🏆 Жюри точно скажет WOW!

- **Paint Tool** — инновационно, как в Photoshop
- **Quick Fill** — супер удобно, продумано
- **Real-time Stats** — мгновенная обратная связь
- **Animations** — плавно, профессионально
- **T2 Design** — полное соответствие брендбуку

## 📞 Поддержка

Если что-то не работает:
1. Проверь консоль браузера (F12)
2. Проверь терминал с бэкендом
3. Проверь .env.local

---

**Проект готов к демонстрации!** 🎉

Открывай http://localhost:3000 и показывай жюри!
