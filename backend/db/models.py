from sqlalchemy import Column, Integer, String, DateTime, func, Float, ForeignKey
from .database import Base

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