from __future__ import annotations
import pandas as pd
from sklearn.metrics import roc_auc_score, log_loss

from predictionML.config import TRAIN_YEARS, FORM_WINDOW, TRACK_YEARS_BACK, TRACK_SHRINK_K
from predictionML.data.dataset_builder import build_dataset
from predictionML.features.feature_builder import build_features
from predictionML.models.model_store import load_model


MODEL_FILE = "top3_track_affinity_logreg.joblib"

def evaluate() -> None:
    df = build_dataset(TRAIN_YEARS)
    df = build_features(df, form_window=FORM_WINDOW, years_back=TRACK_YEARS_BACK, shrink_k=TRACK_SHRINK_K)

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

    years = sorted(df["year"].unique())
    split = max(1, len(years) // 4)
    val_years = years[-split:]
    val = df[df["year"].isin(val_years)].copy()

    model = load_model(MODEL_FILE)
    val["p_top3"] = model.predict_proba(val[feature_cols])[:, 1]

    auc = roc_auc_score(val["is_top3"], val["p_top3"])
    ll = log_loss(val["is_top3"], val["p_top3"])

    race_rows = []
    for (y, r), g in val.groupby(["year","round"], sort=True):
        pred_top3 = list(g.sort_values("p_top3", ascending=False).head(3)["driver"])
        true_top3 = list(g[g["finish_position"] <= 3].sort_values("finish_position")["driver"])
        hit = len(set(pred_top3) & set(true_top3))
        exact_set = int(set(pred_top3) == set(true_top3))
        race_rows.append({"year": y, "round": r, "hit_0_3": hit, "exact_set": exact_set})

    race_df = pd.DataFrame(race_rows)
    print("Model:", MODEL_FILE)
    print("Validation years:", val_years)
    print(f"AUC: {auc:.4f} | logloss: {ll:.4f}")
    print(f"Avg top3 hits: {race_df['hit_0_3'].mean():.3f}")
    print(f"Exact top3 set acc: {race_df['exact_set'].mean():.3f}")
    print("Hit distribution:\n", race_df["hit_0_3"].value_counts().sort_index().to_string())

if __name__ == "__main__":
    evaluate()
