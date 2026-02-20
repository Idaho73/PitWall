from datetime import datetime, timedelta

import fastf1
from fastf1.utils import delta_time
from sqlalchemy.orm import Session

from Cfg import Cfg
from DummySrv.DummySession import load_session_from_export
from db.database import SessionLocal
from db.models import Predictions, PredictionLeaderboard
from db.schemas import PredictionOut
from utils.logger import logger

#üres lista
TOP_THREE_DRIVER=[]

def calculate_prd_poinst(db: Session, year: int, round_num: int, identifier: str):
    predictions=(
        db.query(Predictions)
        .filter_by(year = year, round = round_num, identifier = identifier)
        .all()
    )

    logger.info(TOP_THREE_DRIVER)
    real_top3 = TOP_THREE_DRIVER  # pl. ["VER", "PIA", "LEC"]

    for prediction in predictions:
        predicted = [
            prediction.first,
            prediction.second,
            prediction.third,
        ]

        matches = sum(
            1 for i in range(3)
            if predicted[i] == real_top3[i]
        )

        if matches == 3:
            points = 10
        elif matches == 2:
            points = 5
        elif matches == 1:
            points = 2
        else:
            points = 0

        logger.info(f"Predicted {points} points for {prediction.username}")
        add_points_to_prediction_leaderboard(
            db,
            year=year,
            user_id=prediction.user_id,
            username=prediction.username,
            delta_points=points
        )

    db.commit()
    db.close()


def update_pred_standings(year: int, round_number: int, now: datetime, identifier: str):
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
        for _, row in results.iterrows():
            if (len(TOP_THREE_DRIVER) < 3):
                driver = row["Abbreviation"]
                TOP_THREE_DRIVER.append(driver)

        calculate_prd_poinst(db, year, round_number, identifier)

        return True

    except Exception as e:
        print("FastF1 update failed:", e)
        return False


from datetime import datetime, timezone

def add_points_to_prediction_leaderboard(db, *, year: int, user_id: int, username: str, delta_points: int):
    now = datetime.now(timezone.utc)

    row = (
        db.query(PredictionLeaderboard)
        .filter_by(year=year, user_id=user_id)
        .one_or_none()
    )

    if row is None:
        row = PredictionLeaderboard(
            year=year,
            user_id=user_id,
            username=username,
            points=delta_points,
            last_updated=now,
        )
        db.add(row)
    else:
        row.points = (row.points or 0) + delta_points
        row.last_updated = now + timedelta(hours=1)
        # opcionális: ha a username változhat
        row.username = username

    db.commit()
    db.refresh(row)
    return row
