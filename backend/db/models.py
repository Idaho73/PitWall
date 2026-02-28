from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, func, Float, ForeignKey, Numeric, Text
from .database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    email = Column(String(50), unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DriverStanding(Base):
    __tablename__ = "driver_standings"

    id = Column(Integer, primary_key=True, index=True)
    season_year = Column(Integer, index=True)
    driver = Column(String)
    team = Column(String)
    points = Column(Float)
    position = Column(Integer)
    last_updated = Column(DateTime)

class Predictions(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String(50), nullable=False)
    round = Column(Integer)
    identifier = Column(String(10), unique=True, nullable=False)
    first = Column(String(50), nullable=False)
    second = Column(String(50), nullable=False)
    third = Column(String(50), nullable=False)

class PredictionLeaderboard(Base):
    __tablename__ = "prediction_leaderboard"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    username = Column(String(50), nullable=False)
    points = Column(Integer)
    last_updated = Column(DateTime)

class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(3), unique=True, index=True, nullable=False)

    driver_id: Mapped[str | None] = mapped_column(String(64), unique=True, nullable=True)

    given_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    family_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(128), nullable=True)

    portrait_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    career_stats: Mapped["DriverCareerStats | None"] = relationship(
        back_populates="driver",
        uselist=False,
        cascade="all, delete-orphan",
        primaryjoin="Driver.code==foreign(DriverCareerStats.driver_code)",
    )


class DriverCareerStats(Base):
    __tablename__ = "driver_career_stats"

    id: Mapped[int] = mapped_column(primary_key=True)

    driver_code: Mapped[str] = mapped_column(
        String(3),
        ForeignKey("drivers.code", onupdate="CASCADE", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )

    championships: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    points_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    wins: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    podiums: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    poles: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    first_season: Mapped[int | None] = mapped_column(Integer, nullable=True)
    last_season: Mapped[int | None] = mapped_column(Integer, nullable=True)

    source: Mapped[str] = mapped_column(String(32), nullable=False, default="jolpica")
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    driver: Mapped["Driver"] = relationship(
        back_populates="career_stats",
        primaryjoin="foreign(DriverCareerStats.driver_code)==Driver.code",
    )