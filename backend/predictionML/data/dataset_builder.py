from __future__ import annotations
import pandas as pd
import fastf1

from .fastf1_client import load_session, init_fastf1


def build_dataset(years: list[int]) -> pd.DataFrame:
    init_fastf1()
    rows = []

    for year in years:
        schedule = fastf1.get_event_schedule(year)

        for _, ev in schedule.iterrows():
            round_no = int(ev["RoundNumber"])

            try:
                race = load_session(year, round_no, "R")
            except Exception as e:
                print(f"[WARN] Skip {year} R{round_no} (Race load): {type(e).__name__}: {e}")
                continue

            rres = race.results.copy()
            if rres.empty:
                continue

            # Driver azonosító (VER, HAM, LEC...)
            if "Abbreviation" not in rres.columns:
                continue

            # track_id: stabilan az EventName + Location kombó jó szokott lenni
            # (ha később gond van, lehet finomítani)
            event_name = str(race.event.get("EventName", ""))
            location = str(race.event.get("Location", ""))
            country = str(race.event.get("Country", ""))
            track_id = f"{event_name}__{location}__{country}".strip("_")

            # szükséges oszlopok
            needed = ["Abbreviation", "TeamName", "GridPosition", "Position", "Points"]
            if any(c not in rres.columns for c in needed):
                continue

            df = rres[needed].rename(columns={
                "Abbreviation": "driver",
                "TeamName": "team",
                "GridPosition": "grid_position",
                "Position": "finish_position",
                "Points": "points",
            }).copy()

            df = df.dropna(subset=["driver", "grid_position", "finish_position"])
            # néha non-finish/DSQ miatt lehet nem int, ezért óvatosan:
            df["grid_position"] = df["grid_position"].astype(int)
            df["finish_position"] = df["finish_position"].astype(int)
            df["points"] = pd.to_numeric(df["points"], errors="coerce").fillna(0.0)

            df["year"] = year
            df["round"] = round_no
            df["track_id"] = track_id
            df["is_top3"] = (df["finish_position"] <= 3).astype(int)

            rows.append(df[["year","round","track_id","driver","team","grid_position","finish_position","points","is_top3"]])

    if not rows:
        raise RuntimeError("No data collected. Check FastF1 cache/network.")
    return pd.concat(rows, ignore_index=True)
