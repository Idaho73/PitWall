# routes/leaderboard.py

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from db import models
from db.database import get_db
from db.models import DriverStanding, PredictionLeaderboard
from db.schemas import DriverStandingSchema
from typing import List
from utils.logger import logger

from services.standings_service import maybe_refresh_standings, maybe_refresh_pred_standings

router = APIRouter(prefix="/api", tags=["plot"])


@router.get("/leaderboard/{year}", response_model=List[DriverStandingSchema])
def get_leaderboard_2025(year: int, db: Session = Depends(get_db)):
    # új: próbáljuk frissíteni, ha kell
    logger.info(f"Getting leaderboard for year {year}")
    maybe_refresh_standings(db, season_year=year)

    standings = (
        db.query(DriverStanding)
        .filter(DriverStanding.season_year == year)
        .order_by(DriverStanding.position.asc())
        .all()
    )
    return standings

@router.get("/leaderboard/team/{year}")
def get_leaderboard_team(year: int, db: Session = Depends(get_db)):
    logger.info(f"Getting leaderboard for year {year}")

    standings = (
        db.query(
            DriverStanding.team.label("team"),
            func.sum(DriverStanding.points).label("total_points")
        )
        .filter(DriverStanding.season_year == year)
        .group_by(DriverStanding.team)
        .order_by(func.sum(DriverStanding.points).desc())
        .all()
    )
    return [
        {
            "team": row.team,
            "points": row.total_points
        }
        for row in standings
    ]

@router.get("/leaderboard/prediction/{year}")
def get_leaderboard_prediction(year: int, db: Session = Depends(get_db)):
    logger.info(f"Getting leaderboard for year {year}")

    maybe_refresh_pred_standings(db, year=year)

    standings = (
        db.query(PredictionLeaderboard)
        .filter(PredictionLeaderboard.year == year)
        .order_by(PredictionLeaderboard.points.desc())
        .all()
    )

    return standings