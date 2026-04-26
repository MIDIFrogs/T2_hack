import json
from collections import defaultdict
from datetime import date
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from sqlalchemy import func

from auth import get_current_verified_user, require_role
from db import get_db
from models import CollectionPeriod, ScheduleEntry, ScheduleDraft, User, UserRole
from schemas import ScheduleBulkUpdate, ScheduleDayPayload, ScheduleForUser, ScheduleUpdateResponse

router = APIRouter(prefix="/schedules", tags=["schedules"])

def get_current_period(db: Session = Depends(get_db)) -> Optional[CollectionPeriod]:
    return db.query(CollectionPeriod).filter(CollectionPeriod.is_open == True).first()

@router.get("/me", response_model=Dict[date, ScheduleDayPayload])
def get_my_schedule(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db),
):
    current_period = get_current_period(db)

    # Получаем записи периода (официальные)
    period_entries: Dict[date, ScheduleDayPayload] = {}
    if current_period:
        entries: List[ScheduleEntry] = (
            db.query(ScheduleEntry)
            .filter(
                ScheduleEntry.user_id == current_user.id,
                ScheduleEntry.period_id == current_period.id
            )
            .all()
        )
        period_entries = {e.day: ScheduleDayPayload(status=e.status, meta=e.meta, is_draft=False) for e in entries}

    # Получаем черновики (планирование на будущее)
    drafts: List[ScheduleDraft] = (
        db.query(ScheduleDraft)
        .filter(ScheduleDraft.user_id == current_user.id)
        .all()
    )
    draft_entries = {
        d.day: ScheduleDayPayload(status=d.status, meta=d.meta, is_draft=True)
        for d in drafts
    }

    # Объединяем: черновики перезаписывают период (если есть пересечение)
    # Но на практике пересечения быть не должно, так как период и черновики разделены
    return {**period_entries, **draft_entries}


@router.get("/me/limits")
def get_my_limits(
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db),
):
    """Получить информацию о лимитах и текущем использовании отпусков и отгулов"""
    current_period = get_current_period(db)

    # Считаем текущее использование в активном периоде
    used_vacation = 0
    used_off = 0

    if current_period:
        entries = db.query(ScheduleEntry).filter(
            ScheduleEntry.user_id == current_user.id,
            ScheduleEntry.period_id == current_period.id
        ).all()

        for entry in entries:
            if entry.status == "vacation":
                used_vacation += 1
            elif entry.status == "off":
                used_off += 1

    return {
        "available_vacation_days": current_user.available_vacation_days,
        "available_off_days": current_user.available_off_days,
        "used_vacation_days": used_vacation,
        "used_off_days": used_off,
        "remaining_vacation_days": current_user.available_vacation_days - used_vacation,
        "remaining_off_days": current_user.available_off_days - used_off,
    }

@router.put("/me", response_model=ScheduleUpdateResponse)
def update_my_schedule(
    payload: ScheduleBulkUpdate,
    current_user: User = Depends(get_current_verified_user),
    db: Session = Depends(get_db),
):
    current_period = get_current_period(db)
    if not current_period:
        raise HTTPException(status_code=400, detail="Нет активного периода сбора")

    # Разделяем дни на период и черновики
    period_days = {}
    draft_days = {}

    for d, data in payload.days.items():
        if current_period.period_start <= d <= current_period.period_end:
            period_days[d] = data
        else:
            draft_days[d] = data

    # === Валидация и обрезка по лимитам отпусков и отгулов ===
    # Разделяем дни отпусков и отгулов
    vacation_days = {d: data for d, data in period_days.items() if data.status == "vacation"}
    off_days = {d: data for d, data in period_days.items() if data.status == "off"}
    other_days = {d: data for d, data in period_days.items() if data.status not in ["vacation", "off"]}

    # Сортируем отпуска и отгулы по дате (ближайшие первые)
    sorted_vacation = dict(sorted(vacation_days.items(), key=lambda x: x[0]))
    sorted_off = dict(sorted(off_days.items(), key=lambda x: x[0]))

    # Обрезаем по лимиту, сохраняя предупреждения
    warnings = []
    trimmed_vacation = dict(list(sorted_vacation.items())[:current_user.available_vacation_days])
    if len(sorted_vacation) > current_user.available_vacation_days:
        skipped_vacation = len(sorted_vacation) - current_user.available_vacation_days
        warnings.append(f"Превышен лимит отпускных дней. Сохранено только {current_user.available_vacation_days} из {len(sorted_vacation)} дней (ближайшие)")

    trimmed_off = dict(list(sorted_off.items())[:current_user.available_off_days])
    if len(sorted_off) > current_user.available_off_days:
        skipped_off = len(sorted_off) - current_user.available_off_days
        warnings.append(f"Превышен лимит отгулов. Сохранено только {current_user.available_off_days} из {len(sorted_off)} дней (ближайшие)")

    # Объединяем все дни для сохранения
    final_period_days = {**other_days, **trimmed_vacation, **trimmed_off}

    # === Обновляем записи периода ===
    # Удаляем все существующие записи пользователя за этот период
    db.query(ScheduleEntry).filter(
        ScheduleEntry.user_id == current_user.id,
        ScheduleEntry.period_id == current_period.id
    ).delete()

    # Добавляем новые записи для дней периода
    for d, day_payload in final_period_days.items():
        entry = ScheduleEntry(
            user_id=current_user.id,
            period_id=current_period.id,
            day=d,
            status=day_payload.status,
            meta=day_payload.meta,
        )
        db.add(entry)

    # === Обновляем черновики ===
    # Удаляем все черновики, которые есть в payload
    if draft_days:
        # Сначала удаляем черновики, которые обновляются
        db.query(ScheduleDraft).filter(
            ScheduleDraft.user_id == current_user.id,
            ScheduleDraft.day.in_(draft_days.keys())
        ).delete()

        # Добавляем обновленные черновики
        for d, day_payload in draft_days.items():
            draft = ScheduleDraft(
                user_id=current_user.id,
                day=d,
                status=day_payload.status,
                meta=day_payload.meta,
            )
            db.add(draft)

    db.commit()

    # Возвращаем обновлённые записи (объединенные)
    entries = db.query(ScheduleEntry).filter(
        ScheduleEntry.user_id == current_user.id,
        ScheduleEntry.period_id == current_period.id
    ).all()

    period_entries = {e.day: ScheduleDayPayload(status=e.status, meta=e.meta, is_draft=False) for e in entries}

    # Добавляем черновики в ответ
    all_drafts = db.query(ScheduleDraft).filter(ScheduleDraft.user_id == current_user.id).all()
    draft_entries = {
        d.day: ScheduleDayPayload(status=d.status, meta=d.meta, is_draft=True)
        for d in all_drafts
    }

    return ScheduleUpdateResponse(
        schedule={**period_entries, **draft_entries},
        warnings=warnings
    )

@router.get("/by-user/{user_id}", response_model=ScheduleForUser)
def get_schedule_for_user(
    user_id: int,
    _: User = Depends(require_role(UserRole.MANAGER)),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    current_period = get_current_period(db)
    if not current_period:
        # Нет активного периода – возвращаем пустой график
        return ScheduleForUser(user=user, entries={}, vacation_work=None)

    entries: List[ScheduleEntry] = (
        db.query(ScheduleEntry)
        .filter(
            ScheduleEntry.user_id == user.id,
            ScheduleEntry.period_id == current_period.id
        )
        .all()
    )
    schedule_map = {e.day: ScheduleDayPayload(status=e.status, meta=e.meta) for e in entries}

    return ScheduleForUser(
        user=user,
        entries=schedule_map,
        vacation_work=None,
    )