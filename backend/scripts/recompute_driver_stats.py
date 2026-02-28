from __future__ import annotations

from datetime import datetime

from sqlalchemy import select, func, case
from sqlalchemy.dialects.postgresql import insert as pg_insert

from db.database import SessionLocal
from db.models import DriverStanding, Driver, DriverCareerStats


def recompute_driver_career_stats(db_session) -> int:
    """
    Full recompute a DriverStanding alapján.

    Számolja (csak standingsből):
    - championships: position == 1 count (szezon végi bajnoki címek)
    - points_total: sum(points) (összpont karrierben)
    - first_season / last_season: min/max(season_year)

    wins/podiums/poles: jelenleg 0 (ehhez race/quali results kell majd).
    """

    # 1) drivers tábla feltöltése/karbantartása standingsből
    pairs_stmt = (
        select(
            DriverStanding.driver.label("code"),
            func.max(DriverStanding.team).label("team_name"),
        )
        .group_by(DriverStanding.driver)
    )
    pairs = db_session.execute(pairs_stmt).mappings().all()

    drivers_payload = [
        {"code": p["code"], "display_name": p["code"]}
        for p in pairs
        if p["code"]  # safety
    ]

    if drivers_payload:
        drivers_insert = pg_insert(Driver).values(drivers_payload).on_conflict_do_update(
            index_elements=[Driver.code],
            set_={
                "display_name": pg_insert(Driver).excluded.display_name,
                "updated_at": func.now(),
            },
        )
        db_session.execute(drivers_insert)

    # 2) aggregált career statok a standingsből
    agg_stmt = (
        select(
            DriverStanding.driver.label("driver_code"),
            func.sum(case((DriverStanding.position == 1, 1), else_=0)).label("championships"),
            func.coalesce(func.sum(DriverStanding.points), 0).label("points_total"),
            func.min(DriverStanding.season_year).label("first_season"),
            func.max(DriverStanding.season_year).label("last_season"),
        )
        .group_by(DriverStanding.driver)
    )
    rows = db_session.execute(agg_stmt).mappings().all()

    now = datetime.utcnow()
    stats_payload = [
        {
            "driver_code": r["driver_code"],
            "championships": int(r["championships"] or 0),
            "points_total": float(r["points_total"] or 0),
            "wins": 0,
            "podiums": 0,
            "poles": 0,
            "first_season": r["first_season"],
            "last_season": r["last_season"],
            "source": "computed_from_standings",
            "computed_at": now,
            "updated_at": now,
        }
        for r in rows
        if r["driver_code"]
    ]

    # 3) upsert driver_career_stats
    if stats_payload:
        stats_insert = pg_insert(DriverCareerStats).values(stats_payload)
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
    return len(stats_payload)


def main() -> None:
    db = SessionLocal()
    try:
        updated = recompute_driver_career_stats(db)
        print(f"✅ Recomputed career stats for {updated} drivers")
    finally:
        db.close()


if __name__ == "__main__":
    main()