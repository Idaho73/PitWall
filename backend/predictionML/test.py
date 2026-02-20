import pandas as pd
from predictionML.data.fastf1_client import load_session
from predictionML.models.model_store import load_model

year = 2025
round_no = 23

race = load_session(year, round_no, "R")
df = race.results[["Abbreviation", "GridPosition"]].copy()
df = df.dropna()
df["grid_position"] = df["GridPosition"].astype(int)

model = load_model("top3_baseline_logreg.joblib")
df["p_top3"] = model.predict_proba(df[["grid_position"]])[:, 1]

df = df.sort_values("p_top3", ascending=False)
print(df.head(3)[["Abbreviation", "grid_position", "p_top3"]])
