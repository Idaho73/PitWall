# app/routers/driver.py

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from db.database import get_db
from db.models import Driver, DriverCareerStats, DriverStanding

router = APIRouter(prefix="/api", tags=["driver"])


@router.get("/drivers")
async def get_drivers(season: int | None = None, db: Session = Depends(get_db)):

    """
    Returns all drivers with their career stats.
    """

    try:
        stmt = (
            select(
                Driver.code,
                Driver.display_name,
                Driver.portrait_url,
                DriverCareerStats.championships,
                DriverCareerStats.points_total,
                DriverCareerStats.wins,
                DriverCareerStats.podiums,
                DriverCareerStats.poles,
                DriverCareerStats.first_season,
                DriverCareerStats.last_season,
            )
            .join(
                DriverCareerStats,
                Driver.code == DriverCareerStats.driver_code,
                isouter=True,
            )
        )

        if season:
            stmt = stmt.join(
                DriverStanding,
                DriverStanding.driver == Driver.code,
            ).where(
                DriverStanding.season_year == season
            )

        result = db.execute(stmt).all()

        drivers = []
        for row in result:
            drivers.append(
                {
                    "code": row.code,
                    "name": row.display_name or row.code,
                    "portrait_url": row.portrait_url,
                    "stats": {
                        "championships": row.championships or 0,
                        "points": float(row.points_total or 0),
                        "wins": row.wins or 0,
                        "podiums": row.podiums or 0,
                        "poles": row.poles or 0,
                        "first_season": row.first_season,
                        "last_season": row.last_season,
                    },
                }
            )

        return JSONResponse(content=drivers)

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))