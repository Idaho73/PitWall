from datetime import datetime
from sqlalchemy import select, func, case
from sqlalchemy.dialects.postgresql import insert as pg_insert

from db.models import DriverCareerStats, DriverStanding, Driver

def recompute_driver_career_stats(db_session):
    """
    Full recompute a driver_standings alapján.
    Csak szezon végi standingsből számol:
    - championships (position == 1)
    - points_total (összpont)
    - first_season / last_season
    """

    # 1) distinct driverek a standingsből
    codes_stmt = select(func.distinct(DriverStanding.driver))
    codes = [row[0] for row in db_session.execute(codes_stmt).all()]

    # 2) biztosítsuk, hogy léteznek a drivers táblában
    if codes:
        drivers_insert = pg_insert(Driver).values(
            [{"code": c} for c in codes]
        ).on_conflict_do_nothing(
            index_elements=[Driver.code]
        )
        db_session.execute(drivers_insert)

    # 3) aggregáció
    agg_stmt = (
        select(
            DriverStanding.driver.label("driver_code"),
            func.sum(
                case((DriverStanding.position == 1, 1), else_=0)
            ).label("championships"),
            func.coalesce(func.sum(DriverStanding.points), 0).label("points_total"),
            func.min(DriverStanding.season_year).label("first_season"),
            func.max(DriverStanding.season_year).label("last_season"),
        )
        .group_by(DriverStanding.driver)
    )

    rows = db_session.execute(agg_stmt).mappings().all()

    now = datetime.utcnow()
    payload = []

    for r in rows:
        payload.append(
            {
                "driver_code": r["driver_code"],
                "championships": int(r["championships"] or 0),
                "points_total": float(r["points_total"] or 0),
                "wins": 0,        # később race resultsből
                "podiums": 0,     # később race resultsből
                "poles": 0,       # később quali resultsből
                "first_season": r["first_season"],
                "last_season": r["last_season"],
                "source": "computed_from_standings",
                "computed_at": now,
                "updated_at": now,
            }
        )

    if payload:
        stats_insert = pg_insert(DriverCareerStats).values(payload)

        stats_upsert = stats_insert.on_conflict_do_update(
            index_elements=[DriverCareerStats.driver_code],
            set_={
                "championships": stats_insert.excluded.championships,
                "points_total": stats_insert.excluded.points_total,
                "wins": stats_insert.excluded.wins,
                "podiums": stats_insert.excluded.podiums,
                "poles": stats_insert.excluded.poles,
                "first_season": stats_insert.excluded.first_season,
                "last_season": stats_insert.excluded.last_season,
                "source": stats_insert.excluded.source,
                "computed_at": stats_insert.excluded.computed_at,
                "updated_at": stats_insert.excluded.updated_at,
            },
        )

        db_session.execute(stats_upsert)

    db_session.commit()