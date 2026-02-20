from pathlib import Path
import joblib
from ..config import ARTIFACT_DIR

def save_model(model, filename: str) -> Path:
    path = ARTIFACT_DIR / filename
    joblib.dump(model, path)
    return path

def load_model(filename: str):
    return joblib.load(ARTIFACT_DIR / filename)
