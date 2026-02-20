from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import database
from db.models import Predictions
from db.schemas import PredictionCreate
from services import race_refresh
from utils.auth import get_current_user
from utils.logger import logger

router = APIRouter(
    prefix="/api/predictions",
    tags=["Predictions"]
)
@router.post("", status_code=201)
def submit_prediction(
    data: PredictionCreate,
    db: Session = Depends(database.get_db),
    user=Depends(get_current_user)
):
    #result = db.execute("SELECT current_database(), current_schema()").fetchone()
    #logger.info(f"CONNECTED DB = {result}")
    logger.info(f"DATA = {data}")
    logger.info(f"USER = {user}")
    # opcionális: ellenőrzés, hogy már van-e prediction
    existing = (
        db.query(Predictions)
        .filter_by(
            user_id=user.id,
            year=data.year,
            round=data.round,
            identifier=data.identifier
        )
        .first()
    )
    if existing:
        # 🔁 UPDATE
        existing.first = data.picks[0]
        existing.second = data.picks[1]
        existing.third = data.picks[2]

        db.commit()
        db.refresh(existing)

        return {
            "status": "updated",
            "id": existing.id
        }

    prediction = Predictions(
        year=data.year,
        round=data.round,
        identifier=data.identifier,

        user_id=user.id,
        username=user.username,

        first=data.picks[0],
        second=data.picks[1],
        third=data.picks[2]
    )

    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    logger.info(
        "Prediction submitted: user=%s %s %s %s",
        user.username,
        data.identifier,
        prediction.first,
        prediction.second,
        prediction.third
    )
    return {"status": "ok"}

@router.get("/me")
def get_my_predictions(
    db: Session = Depends(database.get_db),
    user=Depends(get_current_user)
):
    predictions = (
        db.query(Predictions)
        .filter(Predictions.user_id == user.id)
        .order_by(
            Predictions.year.desc(),
            Predictions.round.desc()
        )
        .all()
    )

    return [
        {
            "id": p.id,
            "year": p.year,
            "round": p.round,
            "identifier": p.identifier,
            "first": p.first,
            "second": p.second,
            "third": p.third,
        }
        for p in predictions
    ]

@router.get("/next-race")
def get_next_race(db: Session = Depends(database.get_db)):
    logger.info("getting next race for predictions")
    next_race, race_dt = race_refresh.next_race()

    predictions = db.query(Predictions).filter(
    Predictions.year == int(next_race["race"][:4]),
        Predictions.round == next_race["round"],
        Predictions.identifier == next_race["identifier"]
    ).all()

    logger.info(f"Predictions = {predictions}")

    return [
        {
            "id": p.id,
            "username" : p.username,
            "year": p.year,
            "round": p.round,
            "identifier": p.identifier,
            "first": p.first,
            "second": p.second,
            "third": p.third,
        }
        for p in predictions
    ]
