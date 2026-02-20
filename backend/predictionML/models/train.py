from __future__ import annotations
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, log_loss

from predictionML.config import TRAIN_YEARS, FORM_WINDOW, TRACK_YEARS_BACK, TRACK_SHRINK_K
from predictionML.data.dataset_builder import build_dataset
from predictionML.features.feature_builder import build_features
from predictionML.models.model_store import save_model


def train() -> None:
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

    # NaN-ok: szezon eleje + pálya múlt hiánya
    df[feature_cols] = df[feature_cols].fillna(df[feature_cols].median(numeric_only=True))

    years = sorted(df["year"].unique())
    split = max(1, len(years) // 4)
    train_years = years[:-split]
    val_years = years[-split:]

    train_df = df[df["year"].isin(train_years)]
    val_df = df[df["year"].isin(val_years)]

    X_train, y_train = train_df[feature_cols], train_df["is_top3"]
    X_val, y_val = val_df[feature_cols], val_df["is_top3"]

    model = LogisticRegression(max_iter=600)
    model.fit(X_train, y_train)

    proba = model.predict_proba(X_val)[:, 1]
    auc = roc_auc_score(y_val, proba)
    ll = log_loss(y_val, proba)

    path = save_model(model, "top3_track_affinity_logreg.joblib")
    print(f"Saved model to: {path}")
    print(f"Validation years: {val_years}")
    print(f"Validation AUC: {auc:.4f}")
    print(f"Validation logloss: {ll:.4f}")


if __name__ == "__main__":
    train()
