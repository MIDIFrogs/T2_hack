# T2 Schedule Design System

Дизайн-система для разработки фронтенда системы планирования рабочего времени T2.

---

## 🎨 Цветовая палитра

### Основные цвета (90-100% дизайна)

```css
--color-black: #000000;
--color-white: #FFFFFF;
--color-magenta: #FF3495;
```

### Дополнительные цвета (макс. 20% от дизайна)

```css
--color-salad: #A7FC00;      /* Салатовый - для кнопок */
--color-electric-blue: #00BFFFF;  /* Электрик-блю */
--color-blue: #0000FF;       /* Синий - для кнопок в digital */
```

### Правила использования

**Основная гамма:** Чёрный + Белый
**Умеренная гамма:** Чёрный + Белый + Маджента (до 20%)

### Контрастные пары для текста/иконок

| Фон | Текст/Иконка |
|-----|--------------|
| Черный | Белый |
| Белый | Черный |
| Маджента | Белый |
| Салатовый | Черный |
| Электрик-блю | Черный или Белый |
| Синий | Белый |

---

## 🔤 Типографика

### Шрифты

```css
--font-display: 'Halvar Breitschrift ExtraBold', sans-serif;
--font-stencil: 'Halvar Stencil Breitschrift ExtraBold MidGap', sans-serif;
--font-body: 'Rooftop', sans-serif;
```

**Fallback для веба:**
- `Halvar Breitschrift` → `Inter`, `Helvetica Neue`, `Arial Black`, sans-serif
- `Rooftop` → `Inter`, `Roboto`, `Segoe UI`, sans-serif

### Размеры и соотношения

| Стиль | Размер | Интерлиньяж | Применение |
|-------|--------|-------------|------------|
| H1 | 48px | 95-110% | Крупные заголовки |
| H2 | 32px | 95% | Средние заголовки |
| H3 | 24px | 95% | Подзаголовки |
| Text (с H1) | 16px | 140% | Основной текст |
| Text (с H2) | 16px | 140% | Основной текст |
| Text (с H3) | 24px | 140% | Основной текст |

### Правила типографики

- **Выравнивание:** Только левое (исключение - центрированные короткие заголовки)
- **Интерлиньяж H1:** 95% (увеличивать до 105-110% при наличии букв Д, Щ, Ц, Й)
- **Трекинг кнопок:** +3-6%
- **Трекинг крупных цифр:** -4% до -6%

---

## 📐 Сетка и отступы

### Формулы для расчёта

Пусть `X` = меньшая сторона контейнера

```
внешнее_поле = X × 0.02
скругление_бенто = X × 0.04
отступ_между_бенто = X × 0.01
отступ_внутри_бенто = X × 0.04
```

### Адаптивные значения (для desktop)

```css
/* Для контейнера 1200px (X = 800px) */
--spacing-outer: 16px;      /* Внешнее поле */
--radius-bento: 32px;       /* Скругление */
--spacing-gap: 8px;         /* Отступ между блоками */
--spacing-inner: 32px;      /* Отступ внутри блоков */
```

### Для mobile

```css
/* Для контейнера 375px (X = 375px) */
--spacing-outer-mobile: 8px;
--radius-bento-mobile: 16px;
--spacing-gap-mobile: 4px;
--spacing-inner-mobile: 16px;
```

---

## 🧱 Бенто-система

### Типы модулей

- **Круг** - для лого, акций, цен, иконок
- **Квадрат** - для изображений, графики, основного сообщения
- **Прямоугольник** - для основного сообщения и изображений
- **Овал** - только для кнопок

### Правила компоновки

1. Модули пропорционально растягиваются по сетке
2. Круг используется только в паре с квадратом или прямоугольником
3. Стремиться к максимальному разнообразию пропорций
4. Для digital допускаются прямоугольники 3:1

### CSS Grid пример

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-gap);
  padding: var(--spacing-outer);
}

.bento-item {
  border-radius: var(--radius-bento);
  padding: var(--spacing-inner);
}
```

---

## 🔘 Кнопки

### Основные стили

**Салатовая кнопка (основная):**
```css
.btn-primary {
  background: var(--color-salad);
  color: var(--color-black);
  border-radius: 50px; /* Овал */
  padding: 16px 32px;
  letter-spacing: +3%;
}
```

**Синяя кнопка (alternative):**
```css
.btn-secondary {
  background: var(--color-blue);
  color: var(--color-white);
  border-radius: 50px;
  padding: 16px 32px;
  letter-spacing: +3%;
}
```

**Черная кнопка:**
```css
.btn-black {
  background: var(--color-black);
  color: var(--color-white);
  border-radius: 50px;
  padding: 16px 32px;
  letter-spacing: +3%;
}
```

---

## 🖼️ Лого

### Минимальный размер
- **Digital:** 40px высота
- **Print:** 6mm

### Охранное поле
Равно розовому квадрату из лого - никаких активных элементов внутри

### Размещение

**По краям (основной способ):**
```css
.logo {
  position: absolute;
  top: var(--spacing-outer);
  left: var(--spacing-outer);
}
```

**По центру (только имиджевые форматы):**
```css
.logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

### В круглом бенто-блоке
- Лого занимает 80% диаметра круга

### На фото/крупном блоке
- Лого занимает 60% диаметра круга

---

## 🎯 Иконография

### Принципы

- **Стиль:** Стенсил (stencil) + мощный штрих
- **Сетка:** Пиксельная сетка с базовыми геометрическими фигурами
- **Толщина штриха:** Одинаковая для всех иконок

### Размеры

```css
--icon-xs: 16px;
--icon-sm: 24px;
--icon-md: 32px;
--icon-lg: 48px;
--icon-xl: 64px;
```

---

## 📱 Адаптивность

### Breakpoints

```css
--bp-mobile: 375px;
--bp-tablet: 768px;
--bp-desktop: 1024px;
--bp-wide: 1440px;
```

### Mobile-first подход

```css
/* Mobile (default) */
.bento-grid {
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .bento-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .bento-grid {
    grid-template-columns: repeat(12, 1fr);
  }
}
```

---

## 🎨 Компоненты для Schedule App

### 1. Calendar Grid

```css
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-gap);
  background: var(--color-black);
  border-radius: var(--radius-bento);
  padding: var(--spacing-inner);
}

.calendar-day {
  aspect-ratio: 1;
  background: var(--color-white);
  border-radius: calc(var(--radius-bento) * 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-stencil);
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
}

.calendar-day:hover {
  transform: scale(1.05);
}

.calendar-day.selected {
  background: var(--color-magenta);
  color: var(--color-white);
}

.calendar-day.work {
  background: var(--color-salad);
  color: var(--color-black);
}

.calendar-day.off {
  background: var(--color-black);
  color: var(--color-white);
}
```

### 2. Status Badge

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 50px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
}

.status-badge.success {
  background: var(--color-salad);
  color: var(--color-black);
}

.status-badge.warning {
  background: var(--color-magenta);
  color: var(--color-white);
}

.status-badge.error {
  background: var(--color-black);
  color: var(--color-white);
}
```

### 3. Stats Card (Bento)

```css
.stats-card {
  background: var(--color-white);
  border-radius: var(--radius-bento);
  padding: var(--spacing-inner);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-value {
  font-family: var(--font-stencil);
  font-size: 64px;
  line-height: 1;
  letter-spacing: -4%;
}

.stats-label {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-black);
}
```

### 4. Drag-and-Drop Tool

```css
.drag-tool {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--color-black);
  border-radius: 50px;
}

.drag-tool-item {
  padding: 12px 24px;
  border-radius: 50px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 500;
  cursor: grab;
  background: var(--color-white);
  color: var(--color-black);
}

.drag-tool-item:active {
  cursor: grabbing;
}
```

---

## ⚠️ Важно помнить

1. **90-100% дизайна** в основной/умеренной гамме
2. **Дополнительные цвета** не более 20%
3. **Маджента не используется для текста**
4. **Заголовки только левое выравнивание** (исключение - короткие центрированные)
5. **Мин. размер лого** - 40px
6. **Скругления** рассчитываются от меньшей стороны контейнера
7. **Круглые модули** только в паре с квадратными/прямоугольными

---

## 🚀 Quick Start CSS Variables

```css
:root {
  /* Colors */
  --color-black: #000000;
  --color-white: #FFFFFF;
  --color-magenta: #FF3495;
  --color-salad: #A7FC00;
  --color-electric-blue: #00BFFFF;
  --color-blue: #0000FF;

  /* Typography */
  --font-display: 'Halvar Breitschrift ExtraBold', 'Inter', sans-serif;
  --font-stencil: 'Halvar Stencil Breitschrift', 'Inter', sans-serif;
  --font-body: 'Rooftop', 'Inter', sans-serif;

  /* Spacing (desktop) */
  --spacing-outer: 16px;
  --spacing-inner: 32px;
  --spacing-gap: 8px;
  --radius-bento: 32px;
  --radius-button: 50px;

  /* Breakpoints */
  --bp-mobile: 375px;
  --bp-tablet: 768px;
  --bp-desktop: 1024px;
  --bp-wide: 1440px;
}
```

---

## 📊 Layout Templates

### Dashboard Layout (Desktop)

```
┌─────────────────────────────────────────────────────┐
│ [LOGO T2]                    [User Avatar]          │
├─────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌─────────────────────────────────┐   │
│ │          │ │                                 │   │
│ │ Period   │ │     Calendar Grid (7x5)         │   │
│ │ Stats    │ │                                 │   │
│ │          │ │                                 │   │
│ └──────────┘ └─────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────┐ │
│ │  Drag Tools: [Work] [Off] [Remote] [Sick]      │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Manager Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│ [LOGO T2]                        [Manager] [Export]    │
├─────────────────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│ │ Total  │ │Filled  │ │Pending │ │ Due    │            │
│ │  42    │ │  38    │ │   4    │ │ 2 days │            │
│ └────────┘ └────────┘ └────────┘ └────────┘            │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │  Team Heatmap                                       │ │
│ │  [Employee rows] × [Days columns]                   │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🎓 Готовые паттерны для компонентов

### Calendar Cell
```tsx
<div className={cn(
  "calendar-day",
  status === "work" && "calendar-day--work",
  status === "off" && "calendar-day--off",
  status === "remote" && "calendar-day--remote",
  isSelected && "calendar-day--selected"
)}>
  {day}
</div>
```

### Context Menu (Quick Fill)
```tsx
<div className="context-menu">
  <div className="context-menu-section">
    <div className="context-menu-title">Заполнить рабочими:</div>
    <MenuItem>До конца месяца</MenuItem>
    <MenuItem>На 2 недели</MenuItem>
    <MenuItem>Каждую Пн-Ср</MenuItem>
  </div>
  <div className="context-menu-section">
    <div className="context-menu-title">Из шаблона:</div>
    <MenuItem>5/2, 09-18</MenuItem>
    <MenuItem>2/2, день/ночь</MenuItem>
  </div>
</div>
```

### Progress Bar (Conflict Detection)
```tsx
<div className="progress-bar">
  <div className="progress-bar-fill" style={{ width: `${percent}%` }}>
    <span className="progress-bar-text">{hours}/160 часов</span>
  </div>
  {hours < 160 && (
    <div className="progress-bar-warning">
      Нужно ещё {160 - hours} часов
    </div>
  )}
</div>
```
