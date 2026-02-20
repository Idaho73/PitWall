from fastapi import APIRouter
from datetime import datetime
import json
from pathlib import Path
from datetime import timezone

from services import race_refresh

router = APIRouter(prefix="/api/race", tags=["race"])

@router.get("/next-race")
async def get_next_race():

    next_race, race_dt = race_refresh.next_race()

    return {
        "name": next_race["gp"],
        "startTimeUtc": race_dt.isoformat()
    }
