import calendar as cal
import enum
from datetime import datetime, timedelta, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, Integer, String

from database import Base


class CleaningCategory(str, enum.Enum):
    general = "general"
    bathroom = "bathroom"
    kitchen = "kitchen"
    living_room = "living_room"
    office = "office"
    bedroom = "bedroom"


class RecurrenceInterval(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"
    biweekly = "biweekly"
    monthly = "monthly"
    quarterly = "quarterly"
    yearly = "yearly"


def _add_months(dt: datetime, months: int) -> datetime:
    month = dt.month - 1 + months
    year = dt.year + month // 12
    month = month % 12 + 1
    day = min(dt.day, cal.monthrange(year, month)[1])
    return dt.replace(year=year, month=month, day=day)


def calculate_next_due(from_date: datetime, interval: RecurrenceInterval) -> datetime:
    if interval == RecurrenceInterval.daily:
        return from_date + timedelta(days=1)
    if interval == RecurrenceInterval.weekly:
        return from_date + timedelta(weeks=1)
    if interval == RecurrenceInterval.biweekly:
        return from_date + timedelta(weeks=2)
    if interval == RecurrenceInterval.monthly:
        return _add_months(from_date, 1)
    if interval == RecurrenceInterval.quarterly:
        return _add_months(from_date, 3)
    if interval == RecurrenceInterval.yearly:
        return _add_months(from_date, 12)
    return from_date + timedelta(weeks=1)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class CleaningTask(Base):
    __tablename__ = "cleaning_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    category = Column(
        Enum(CleaningCategory, name="cleaning_category", native_enum=False),
        nullable=False,
        default=CleaningCategory.general,
    )
    recurrence_interval = Column(
        Enum(RecurrenceInterval, name="recurrence_interval", native_enum=False),
        nullable=False,
        default=RecurrenceInterval.weekly,
    )
    last_completed_at = Column(DateTime(timezone=True), nullable=True)
    next_due_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow, nullable=False)
