from datetime import datetime
from logging import Logger

import fastf1
from fastapi import Depends, Path
from sqlalchemy.orm import Session

from DummySrv.DummySession import load_session_from_export
from db.database import SessionLocal
from db.models import DriverStanding
from utils.logger import logger
from Cfg import Cfg

from datetime import datetime
import json
from pathlib import Path
from datetime import timezone


def next_race():
    data_path = Path(__file__).resolve().parent.parent / "data" / "races.json"
    races = json.loads(data_path.read_text())

    now = datetime.now(timezone.utc)
    upcoming = []

    for r in races:
        race_time_str = r.get("race")

        # ha a mező nincs, None, vagy üres → kihagyjuk
        if not race_time_str:
            continue

        try:
            race_dt = datetime.fromisoformat(race_time_str.replace("Z", "+00:00"))
        except Exception:
            continue  # hibás dátum → kihagyjuk

        if race_dt > now:
            upcoming.append((r, race_dt))

    if not upcoming:
        return {"error": "No upcoming races found"}

    next_race, race_dt = sorted(upcoming, key=lambda x: x[1])[0]

    logger.info(f"Next race {next_race}")
    logger.info(f"Next race {race_dt}")

    return next_race, race_dt

def update_standings_from_fastf1(year: int, round_number: int, now: datetime, identifier: str):
    try:
        db: Session = SessionLocal()

        if Cfg.TEST_SYSTEM:
            session = load_session_from_export(year, round_number, identifier)
            logger.info(f"Testing {identifier}")
        else:
            fastf1.Cache.enable_cache("cache")
            session = fastf1.get_session(year, round_number, identifier)
            session.load()
            logger.info(f"Loaded {identifier}")

        results = session.results
        logger.info(results)

        # végigmegyünk minden versenyzőn
        for _, row in results.iterrows():
            driver = row["FullName"]
            points = int(row["Points"])

            entry = (
                db.query(DriverStanding)
                .filter_by(driver=driver, season_year=year)
                .first()
            )

            if entry:
                entry.points += points
                entry.last_updated = now

            db.commit()

        # újrasorrend (pont alapján)
        standings = (
            db.query(DriverStanding)
            .filter_by(season_year=year)
            .order_by(DriverStanding.points.desc())
            .all()
        )

        for i, d in enumerate(standings, start=1):
            d.position = i

        db.commit()
        db.close()

        print("🏁 FastF1 standings update complete!")
        return True

    except Exception as e:
        print("FastF1 update failed:", e)
        return False
