from __future__ import annotations
import pandas as pd

from predictionML.config import TRAIN_YEARS, FORM_WINDOW, TRACK_YEARS_BACK, TRACK_SHRINK_K
from predictionML.data.dataset_builder import build_dataset
from predictionML.features.feature_builder import build_features
from predictionML.models.model_store import load_model


MODEL_FILE = "top3_track_affinity_logreg.joblib"

def predict_top3_for_race(year: int, round_no: int) -> pd.DataFrame:
    # Kell múlt is a feature-khez, ezért buildeljük a datasetet a tanító évekből + cél évig
    years = sorted(set(TRAIN_YEARS + [year]))
    df = build_dataset([y for y in years if y <= year])
    if round_no > 5:
        round_window = round_no -1
    else:
        round_window = 5
    df = build_features(df, form_window=round_window, years_back=TRACK_YEARS_BACK, shrink_k=TRACK_SHRINK_K)

    feature_cols = [
        "grid_position",
        "driver_points_form",
        "driver_finish_form",
        "team_points_form",
        "team_finish_form",
        "track_finish_affinity",
        "track_affinity_delta",
        "track_samples",
    ]
    df[feature_cols] = df[feature_cols].fillna(df[feature_cols].median(numeric_only=True))

    race_df = df[(df["year"] == year) & (df["round"] == round_no)].copy()
    if race_df.empty:
        raise RuntimeError(f"No rows for year={year} round={round_no}. Is the race data available?")

    model = load_model(MODEL_FILE)
    race_df["p_top3"] = model.predict_proba(race_df[feature_cols])[:, 1]
    race_df = race_df.sort_values("p_top3", ascending=False)

    return race_df[["driver","team","grid_position","p_top3","track_samples","track_affinity_delta"]]

if __name__ == "__main__":
    year = 2025
    round_no = 3
    out = predict_top3_for_race(year, round_no)
    print(out.head(10).to_string(index=False))
    print("\nPredicted Top3:", list(out.head(3)["driver"]))
