# app/routers/lap.py
from logging import Logger

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from services.lap_analysis import get_lap_comparison

router = APIRouter(prefix="/api", tags=["lap"])

@router.get("/lap-comparison")
async def lap_comparison(
    season: int = 2025,
    grand_prix: str = "Qatar Grand Prix",
    session_code: str = "Q",
    driver1: str = "VER",
    driver2: str = "NOR",
):
    try:
        data = get_lap_comparison(season, grand_prix, session_code, driver1, driver2)
        return JSONResponse(content=data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
