from __future__ import annotations
import pandas as pd


def add_current_season_form(df: pd.DataFrame, window: int) -> pd.DataFrame:
    out = df.sort_values(["year","round"]).copy()

    # Driver-season form
    out["driver_points_form"] = (
        out.groupby(["year","driver"])["points"]
           .apply(lambda s: s.shift(1).rolling(window, min_periods=1).mean())
           .reset_index(level=[0,1], drop=True)
    )
    out["driver_finish_form"] = (
        out.groupby(["year","driver"])["finish_position"]
           .apply(lambda s: s.shift(1).rolling(window, min_periods=1).mean())
           .reset_index(level=[0,1], drop=True)
    )

    # Team-season form
    out["team_points_form"] = (
        out.groupby(["year","team"])["points"]
           .apply(lambda s: s.shift(1).rolling(window, min_periods=1).mean())
           .reset_index(level=[0,1], drop=True)
    )
    out["team_finish_form"] = (
        out.groupby(["year","team"])["finish_position"]
           .apply(lambda s: s.shift(1).rolling(window, min_periods=1).mean())
           .reset_index(level=[0,1], drop=True)
    )
    return out


def add_track_affinity(
    df: pd.DataFrame,
    years_back: int,
    shrink_k: float,
) -> pd.DataFrame:
    """
    Track affinity = mennyire megy a pilóta ugyanazon a pályán a korábbi években.

    Itt két dolgot számolunk:
    - track_finish_mean_raw: driver+track korábbi évek átlag finish (kisebb = jobb)
    - track_finish_affinity: shrinkage-elt verzió driver overallhoz képest

    A shrinkage képlete:
      affinity = (n * track_mean + k * driver_overall_mean) / (n + k)

    Így ha n kicsi, inkább a driver általános átlagához húz.
    """
    out = df.sort_values(["year","round"]).copy()

    # driver overall (minden pálya) – csak múltból (shift!)
    out["driver_overall_finish_mean_past"] = (
        out.groupby("driver")["finish_position"]
           .apply(lambda s: s.shift(1).expanding(min_periods=1).mean())
           .reset_index(level=0, drop=True)
    )

    # driver+track múltbeli átlag és darabszám, years_back korláttal
    # Ezt per sorra számoljuk (nem a leggyorsabb, de első verziónak oké és átlátható).
    track_means = []
    track_counts = []

    for idx, row in out.iterrows():
        y = int(row["year"])
        d = row["driver"]
        t = row["track_id"]

        past = out[
            (out["driver"] == d) &
            (out["track_id"] == t) &
            (out["year"] < y) &
            (out["year"] >= y - years_back)
        ]

        if len(past) == 0:
            track_means.append(float("nan"))
            track_counts.append(0)
        else:
            track_means.append(float(past["finish_position"].mean()))
            track_counts.append(int(len(past)))

    out["track_finish_mean_raw"] = track_means
    out["track_samples"] = track_counts

    # shrinkage
    overall = out["driver_overall_finish_mean_past"]
    track_mean = out["track_finish_mean_raw"]
    n = out["track_samples"].astype(float)

    out["track_finish_affinity"] = (n * track_mean + shrink_k * overall) / (n + shrink_k)

    # relatív “ez az ő pályája” jel:
    # negatív = ezen a pályán jobb (alacsonyabb finish) mint általában
    out["track_affinity_delta"] = out["track_finish_affinity"] - overall

    return out


def build_features(df: pd.DataFrame, form_window: int, years_back: int, shrink_k: float) -> pd.DataFrame:
    out = add_current_season_form(df, window=form_window)
    out = add_track_affinity(out, years_back=years_back, shrink_k=shrink_k)
    return out
