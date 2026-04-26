from datetime import date, datetime
from typing import Dict, Optional

from pydantic import BaseModel, EmailStr, Field, validator

from models import UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenPayload(BaseModel):
    sub: str
    role: UserRole
    is_verified: bool
    exp: int


class UserBase(BaseModel):
    external_id: Optional[str] = Field(default=None, description="External numeric/string identifier")
    full_name: Optional[str] = None
    alliance: Optional[str] = None
    category: Optional[str] = None
    available_vacation_days: Optional[int] = Field(default=14, description="Доступное количество отпускных дней")
    available_off_days: Optional[int] = Field(default=5, description="Доступное количество отгулов")
    role: UserRole = UserRole.USER


class UserCreate(UserBase):
    email: EmailStr
    password: str

    @validator('password')
    def check_password_length(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password too long, must be <= 72 bytes')
        return v


class UserOut(UserBase):
    id: int
    email: Optional[EmailStr] = None
    registered: bool
    is_verified: bool

    class Config:
        from_attributes = True


class UserMe(UserOut):
    pass


class VerificationRequest(BaseModel):
    token: str


class ScheduleDayPayload(BaseModel):
    status: str
    meta: Optional[dict] = None
    is_draft: Optional[bool] = False  # True если это черновик (вне периода)


class ScheduleBulkUpdate(BaseModel):
    # Map of "YYYY-MM-DD" -> complex payload for a day
    days: Dict[date, ScheduleDayPayload]


class ScheduleUpdateResponse(BaseModel):
    schedule: Dict[date, ScheduleDayPayload]
    warnings: list[str] = []


class ScheduleForUser(BaseModel):
    user: UserOut
    entries: Dict[date, ScheduleDayPayload]
    vacation_work: Optional[dict] = None


class CollectionPeriodOut(BaseModel):
    id: int
    alliance: str
    period_start: date
    period_end: date
    deadline: datetime
    is_open: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CollectionPeriodCreate(BaseModel):
    period_start: date
    period_end: date
    deadline: datetime


class ScheduleTemplateCreate(BaseModel):
    name: str
    work_days: int = Field(..., ge=1, le=7)
    rest_days: int = Field(..., ge=0, le=7)
    shift_start: str
    shift_end: str
    has_break: bool = False
    break_start: Optional[str] = None
    break_end: Optional[str] = None


class ScheduleTemplateOut(BaseModel):
    id: int
    user_id: int
    name: str
    work_days: int
    rest_days: int
    shift_start: str
    shift_end: str
    has_break: bool
    break_start: Optional[str]
    break_end: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ======================== Зарплата ========================

class HourlyRateCreate(BaseModel):
    hourly_rate: int = Field(..., ge=0, description="Почасовая ставка в рублях")
    effective_date: date = Field(..., description="Дата, с которой начинает действовать ставка")


class HourlyRateOut(BaseModel):
    id: int
    user_id: int
    hourly_rate: int
    effective_date: date
    created_at: datetime

    class Config:
        from_attributes = True


class SalaryBreakdown(BaseModel):
    """Детализация заработной платы по типам выплат"""
    work_days: float = Field(default=0, description="Оплата за рабочие дни")
    vacation: float = Field(default=0, description="Отпускные")
    sick_leave: float = Field(default=0, description="Больничные")
    overtime: float = Field(default=0, description="Сверхурочные (x1.5 и x2)")
    night_hours: float = Field(default=0, description="Ночные часы (доплата 20%)")
    weekend_holiday: float = Field(default=0, description="Выходные и праздники (x2)")
    split_shift: float = Field(default=0, description="Разбитые смены")
    total: float = Field(default=0, description="Итого")


class SalaryDetails(BaseModel):
    """Детальная информация о зарплате за период"""
    period_start: date
    period_end: date
    total_hours: float = Field(default=0, description="Всего отработано часов")
    breakdown: SalaryBreakdown
    days_summary: Dict[str, int] = Field(default_factory=dict, description="Количество дней по типам")


class SalaryResponse(BaseModel):
    """Ответ с расчетом зарплаты"""
    salary: SalaryDetails
    current_hourly_rate: Optional[int] = Field(default=None, description="Текущая почасовая ставка")


class SalaryRequest(BaseModel):
    """Запрос на расчет зарплаты за период"""
    period_start: date
    period_end: date

