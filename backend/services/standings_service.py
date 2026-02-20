import json
from datetime import datetime, timedelta, timezone
from logging import Logger

from sqlalchemy.orm import Session

from Cfg import Cfg
from db.models import DriverStanding, PredictionLeaderboard
from db.schemas import PredictionLeaderboardOut
from services.predicton_leaderboard import update_pred_standings
from services.race_refresh import update_standings_from_fastf1
from utils.logger import logger

REFRESH_DELAY = timedelta(hours=1, minutes=30)
REFRESH_DELAY_SPRINT = timedelta(minutes=30)


def load_races():
    if Cfg.TEST_SYSTEM:
        logger.info("Loading test system")
        with open("data/dummyRaces.json") as f:
            races = json.load(f)
            races.sort(key=lambda r: datetime.fromisoformat(r["race"].replace("Z", "+00:00")))
            return races
    else:
        logger.info("Loading not test system")
        with open("data/races.json") as f:
            races = json.load(f)
            races.sort(key=lambda r: datetime.fromisoformat(r["race"].replace("Z", "+00:00")))
            return races

from datetime import datetime, timezone, timedelta

def get_last_race():
    races = load_races()
    now = datetime.now(timezone.utc) + timedelta(hours=1)
    logger.info(f"Races last updated at {now}")
    past = [
        r for r in races
        if datetime.fromisoformat(
            r["race"].replace("Z", "+00:00")
        ) <= now
    ]

    return past[-1] if past else None



def maybe_refresh_standings(db: Session, season_year: int):
    last_race = get_last_race()
    identifier = last_race["identifier"]
    round_number = last_race["round"]

    logger.info(f"Last race: {last_race}")
    if not last_race:
        return

    race_time = datetime.fromisoformat(
        last_race["race"].replace("Z", "+00:00")
    ).replace(tzinfo=None)                 # tzinfo törlése

    if identifier == "S":
        allowed_refresh_time = race_time + REFRESH_DELAY_SPRINT
        logger.info(f"Allowed refresh time: {allowed_refresh_time}")
    else:
        allowed_refresh_time = race_time + REFRESH_DELAY

    now = datetime.utcnow() + timedelta(hours=1)             # naive UTC

    if now < allowed_refresh_time:
        logger.info("now < allowed_refresh_time")
        return

    # 2) Mikor frissült utoljára az adatbázis?
    latest_update = (
        db.query(DriverStanding)
        .filter_by(season_year=season_year)
        .order_by(DriverStanding.last_updated.desc())
        .first()
    )

    #fixme ha üres nem update hanem insert
    if latest_update is None:
        logger.info(f"No updates for season {season_year}")
        return

    if latest_update.last_updated >= allowed_refresh_time:
        logger.info(f"Already updated for season {season_year}")
        return  # már frissítettük a futamot -> nem kell újra

    logger.info("Attempting standings refresh from FastF1...")

    ok = update_standings_from_fastf1(season_year, round_number, now, identifier)

    if ok:
        logger.info("🏁 Standings updated from FastF1!")
    else:
        logger.info("❌ FastF1 update attempt failed (API still processing?)")

def maybe_refresh_pred_standings(db: Session, year: int):
    last_race = get_last_race()
    identifier = last_race["identifier"]
    round_number = last_race["round"]

    logger.info(f"Last race: {last_race}")
    if not last_race:
        return

    race_time = datetime.fromisoformat(
        last_race["race"].replace("Z", "+00:00")
    ).replace(tzinfo=None)  # tzinfo törlése

    if identifier == "S":
        allowed_refresh_time = race_time + REFRESH_DELAY_SPRINT
        logger.info(f"Allowed refresh time: {allowed_refresh_time}")
    else:
        allowed_refresh_time = race_time + REFRESH_DELAY

    now = datetime.utcnow() + timedelta(hours=1)  # naive UTC

    if now < allowed_refresh_time:
        logger.info("now < allowed_refresh_time")
        return

    latest_update = (
        db.query(PredictionLeaderboard)
        .filter_by(year=year)
        .order_by(PredictionLeaderboard.last_updated.desc())
        .first()
    )
    #fixme ha üres nem update hanem insert
    if latest_update is None:
        logger.info(f"No updates for season {year}")
        return

    if latest_update.last_updated >= race_time:
        logger.info(f"Already updated for season {year}")
        return

    logger.info("Attempting standings prediction from FastF1...")

    ok = update_pred_standings(year, round_number, now, identifier)

    if ok:
        logger.info("🏁 Prediction updated from FastF1!")
    else:
        logger.info("❌ Prediction update attempt failed (API still processing?)")

