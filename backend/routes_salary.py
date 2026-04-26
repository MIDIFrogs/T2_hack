from datetime import date, datetime, time, timedelta
from typing import Dict, Optional
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, extract

from auth import get_current_verified_user
from db import get_db
from models import User, UserHourlyRate, ScheduleEntry, ScheduleDraft
from schemas import (
    HourlyRateCreate,
    HourlyRateOut,
    SalaryRequest,
    SalaryResponse,
    SalaryDetails,
    SalaryBreakdown,
)

router = APIRouter(prefix="/salary", tags=["salary"])


# ======================== Вспомогательные функции ========================

def get_hourly_rate_for_date(user_id: int, target_date: date, db: Session) -> Optional[int]:
    """
    Получить почасовую ставку пользователя на указанную дату.
    Если ставка не задана явно, берется последняя (максимальная effective_date <= target_date).
    """
    rate = db.query(UserHourlyRate).filter(
        and_(
            UserHourlyRate.user_id == user_id,
            UserHourlyRate.effective_date <= target_date
        )
    ).order_by(UserHourlyRate.effective_date.desc()).first()

    if rate:
        return rate.hourly_rate
    return None


def calculate_hours_between(start_time: time, end_time: time) -> float:
    """Вычислить количество часов между двумя моментами времени"""
    start_datetime = datetime.combine(date.today(), start_time)
    end_datetime = datetime.combine(date.today(), end_time)

    if end_time < start_time:
        # Смена переходит через полночь (например, 22:00 - 06:00)
        end_datetime = end_datetime + timedelta(days=1)

    delta = end_datetime - start_datetime
    return delta.total_seconds() / 3600


def calculate_night_hours(start_time: time, end_time: time) -> float:
    """
    Вычислить количество ночных часов (с 22:00 до 6:00).
    Ночные часы имеют доплату не менее 20% согласно ТК РФ.
    """
    night_start = time(22, 0)
    night_end = time(6, 0)

    start_dt = datetime.combine(date.today(), start_time)
    end_dt = datetime.combine(date.today(), end_time)

    if end_time < start_time:
        # Смена переходит через полночь
        end_dt = end_dt + timedelta(days=1)

    # Разбиваем смену на сегменты и считаем ночные часы
    total_night_hours = 0

    current = start_dt
    while current < end_dt:
        next_current = current + timedelta(hours=1)
        if next_current > end_dt:
            next_current = end_dt

        hour_start = current.time()
        hour_end = next_current.time()

        # Проверяем, пересекается ли час с ночным временем
        is_night = False

        # Ночь с 22:00 до 00:00
        if hour_start >= night_start or hour_end <= night_end:
            # Полностью в ночном времени
            if (hour_start >= night_start and hour_end <= time(23, 59)) or \
               (hour_start >= time(0, 0) and hour_end <= night_end):
                is_night = True
            # Частично в ночном времени
            elif hour_start < night_start and hour_end > night_start:
                # Переход в ночь после 22:00
                night_portion = (next_current - datetime.combine(current.date(), night_start)).total_seconds() / 3600
                total_night_hours += max(0, night_portion)
            elif hour_start < night_end and hour_end > night_end:
                # Переход из ночи после 6:00
                night_portion = (datetime.combine(current.date(), night_end) - current).total_seconds() / 3600
                total_night_hours += max(0, night_portion)

        if is_night:
            total_night_hours += (next_current - current).total_seconds() / 3600

        current = next_current

    return total_night_hours


def is_weekend_or_holiday(day: date) -> bool:
    """
    Проверить, является ли день выходным или праздничным.
    Выходные: суббота (5) и воскресенье (6).
    """
    # В реальном приложении здесь нужно добавить праздничные дни РФ
    return day.weekday() >= 5


def calculate_average_daily_salary(user_id: int, calculation_date: date, db: Session) -> float:
    """
    Рассчитать среднедневной заработок для расчета отпускных и больничных.
    Согласно ТК РФ, берется заработок за последние 12 месяцев.
    """
    # Определяем период расчета (12 месяцев до calculation_date)
    period_end = calculation_date
    period_start = period_end - timedelta(days=365)

    # Получаем все записи за этот период
    entries = db.query(ScheduleEntry).filter(
        and_(
            ScheduleEntry.user_id == user_id,
            ScheduleEntry.day >= period_start,
            ScheduleEntry.day <= period_end
        )
    ).all()

    if not entries:
        # Если нет записей, возвращаем 0
        return 0.0

    total_earnings = 0.0
    total_days = 0

    for entry in entries:
        entry_date = entry.day
        hourly_rate = get_hourly_rate_for_date(user_id, entry_date, db)

        if not hourly_rate:
            continue

        if entry.status == "work":
            meta = entry.meta or {}
            start_time = meta.get("start")
            end_time = meta.get("end")

            if start_time and end_time:
                try:
                    start = datetime.strptime(start_time, "%H:%M").time()
                    end = datetime.strptime(end_time, "%H:%M").time()
                    hours = calculate_hours_between(start, end)

                    # Проверяем на сверхурочные, выходные и т.д.
                    multiplier = 1.0

                    if is_weekend_or_holiday(entry_date):
                        multiplier = 2.0
                    else:
                        # Проверяем на переработку (сверхурочные)
                        # Для упрощения считаем, что более 8 часов в день - сверхурочные
                        if hours > 8:
                            overtime_hours = hours - 8
                            regular_hours = 8
                            # Первые 2 часа x1.5, остальные x2
                            if overtime_hours <= 2:
                                total_earnings += overtime_hours * hourly_rate * 1.5
                            else:
                                total_earnings += 2 * hourly_rate * 1.5
                                total_earnings += (overtime_hours - 2) * hourly_rate * 2
                            hours = regular_hours

                    total_earnings += hours * hourly_rate * multiplier

                    # Ночные часы
                    night_hours = calculate_night_hours(start, end)
                    if night_hours > 0:
                        # Доплата 20% за ночные часы
                        total_earnings += night_hours * hourly_rate * 0.2

                    total_days += 1
                except ValueError:
                    pass

        elif entry.status == "vacation":
            # Отпускные оплачиваются по среднему
            total_days += 1

        elif entry.status == "sick":
            # Больничные (в реальности ФСС оплачивает по правилам)
            total_days += 1

    # Рассчитываем среднедневной заработок
    if total_days == 0:
        return 0.0

    # Для отпускных используется среднемесячное количество дней 29.3
    average_daily = total_earnings / 29.3
    return average_daily


def calculate_salary_for_period(
    user_id: int,
    period_start: date,
    period_end: date,
    db: Session
) -> SalaryDetails:
    """
    Рассчитать зарплату за период с учетом всех типов выплат.
    """
    # Получаем записи за период (включая черновики для планирования)
    entries = db.query(ScheduleEntry).filter(
        and_(
            ScheduleEntry.user_id == user_id,
            ScheduleEntry.day >= period_start,
            ScheduleEntry.day <= period_end
        )
    ).all()

    # Получаем черновики для будущего планирования
    drafts = db.query(ScheduleDraft).filter(
        and_(
            ScheduleDraft.user_id == user_id,
            ScheduleDraft.day >= period_start,
            ScheduleDraft.day <= period_end
        )
    ).all()

    # Объединяем записи и черновики
    # Приоритет у черновиков
    all_days = {}

    for entry in entries:
        all_days[entry.day] = {
            "status": entry.status,
            "meta": entry.meta,
            "is_draft": False
        }

    for draft in drafts:
        all_days[draft.day] = {
            "status": draft.status,
            "meta": draft.meta,
            "is_draft": True
        }

    breakdown = SalaryBreakdown()
    total_hours = 0.0
    days_summary: Dict[str, int] = {}

    # Сортируем даты для последовательного расчета
    sorted_days = sorted(all_days.items())

    for day, day_data in sorted_days:
        day_status = day_data["status"]
        meta = day_data.get("meta") or {}
        is_draft = day_data.get("is_draft", False)

        # Считаем дни по типам
        days_summary[day_status] = days_summary.get(day_status, 0) + 1

        hourly_rate = get_hourly_rate_for_date(user_id, day, db)

        if day_status == "work":
            # Рабочий день
            start_time = meta.get("start")
            end_time = meta.get("end")

            if start_time and end_time and hourly_rate:
                try:
                    start = datetime.strptime(start_time, "%H:%M").time()
                    end = datetime.strptime(end_time, "%H:%M").time()
                    hours = calculate_hours_between(start, end)

                    # Базовая оплата
                    base_pay = hours * hourly_rate
                    total_hours += hours
                    breakdown.work_days += base_pay

                    # Проверяем на сверхурочные (считаем переработку только если > 8 часов в день)
                    if hours > 8:
                        overtime_hours = hours - 8
                        # Первые 2 часа x1.5, остальные x2
                        if overtime_hours <= 2:
                            overtime_pay = overtime_hours * hourly_rate * 0.5  # доплата x0.5 сверх базовой
                        else:
                            overtime_pay = 2 * hourly_rate * 0.5 + (overtime_hours - 2) * hourly_rate * 1.0
                        breakdown.overtime += overtime_pay

                    # Проверяем на выходные/праздничные (доплата x1 сверх базовой)
                    if is_weekend_or_holiday(day):
                        weekend_pay = base_pay  # доплата x1 сверх базовой
                        breakdown.weekend_holiday += weekend_pay

                    # Ночные часы (доплата 20%)
                    night_hours = calculate_night_hours(start, end)
                    if night_hours > 0:
                        night_pay = night_hours * hourly_rate * 0.2
                        breakdown.night_hours += night_pay

                except ValueError:
                    pass

        elif day_status == "vacation":
            # Отпускные - рассчитываем по среднему заработку
            if hourly_rate:
                # Для упрощения считаем отпускные как 1 дневная ставка
                # В реальности должен быть расчет по среднему за 12 месяцев
                average_daily = hourly_rate * 8  # упрощенно
                breakdown.vacation += average_daily

        elif day_status == "sick":
            # Больничные
            if hourly_rate:
                # Упрощенно считаем как 80% от дневной ставки
                # В реальности ФСС оплачивает по своим правилам
                sick_pay = hourly_rate * 8 * 0.8
                breakdown.sick_leave += sick_pay

        elif day_status == "split":
            # Разбитая смена (split shift)
            split_parts = meta.get("splitParts", [])
            if split_parts and hourly_rate:
                day_hours = 0
                for part in split_parts:
                    try:
                        part_start = datetime.strptime(part.get("start", ""), "%H:%M").time()
                        part_end = datetime.strptime(part.get("end", ""), "%H:%M").time()
                        part_hours = calculate_hours_between(part_start, part_end)
                        day_hours += part_hours
                    except (ValueError, TypeError):
                        pass

                if day_hours > 0:
                    total_hours += day_hours
                    split_pay = day_hours * hourly_rate
                    breakdown.split_shift += split_pay

        # off (отгул за свой счет) не оплачивается

    # Итого
    breakdown.total = (
        breakdown.work_days +
        breakdown.vacation +
        breakdown.sick_leave +
        breakdown.overtime +
        breakdown.night_hours +
        breakdown.weekend_holiday +
        breakdown.split_shift
    )

    return SalaryDetails(
        period_start=period_start,
        period_end=period_end,
        total_hours=round(total_hours, 2),
        breakdown=breakdown,
        days_summary=days_summary
    )


# ======================== Эндпоинты ========================

@router.get("/me", response_model=SalaryResponse)
def get_my_salary(
    period_start: date,
    period_end: date,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db),
):
    """Рассчитать зарплату за указанный период"""
    if period_start > period_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Дата начала периода не может быть больше даты окончания"
        )

    salary = calculate_salary_for_period(current_user.id, period_start, period_end, db)

    # Получаем текущую ставку
    current_rate = get_hourly_rate_for_date(current_user.id, date.today(), db)

    return SalaryResponse(
        salary=salary,
        current_hourly_rate=current_rate
    )


@router.put("/hourly-rate", response_model=HourlyRateOut)
def set_hourly_rate(
    payload: HourlyRateCreate,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db),
):
    """Установить новую почасовую ставку"""
    # Проверяем, нет ли уже ставки на эту дату
    existing = db.query(UserHourlyRate).filter(
        and_(
            UserHourlyRate.user_id == current_user.id,
            UserHourlyRate.effective_date == payload.effective_date
        )
    ).first()

    if existing:
        # Обновляем существующую
        existing.hourly_rate = payload.hourly_rate
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Создаем новую
        new_rate = UserHourlyRate(
            user_id=current_user.id,
            hourly_rate=payload.hourly_rate,
            effective_date=payload.effective_date
        )
        db.add(new_rate)
        db.commit()
        db.refresh(new_rate)
        return new_rate


@router.get("/hourly-rate/history", response_model=list[HourlyRateOut])
def get_hourly_rate_history(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db),
):
    """Получить историю изменений почасовой ставки"""
    rates = db.query(UserHourlyRate).filter(
        UserHourlyRate.user_id == current_user.id
    ).order_by(UserHourlyRate.effective_date.desc()).all()

    return rates
