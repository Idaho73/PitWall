from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]

CACHE_DIR = Path.home() / ".fastf1_cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

ARTIFACT_DIR = Path(__file__).resolve().parent / "artifacts"
ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)

# Tanításhoz használt évek (sok minta kell). A feature-k úgyis idei-formát használnak.
TRAIN_YEARS = list(range(2018, 2026))  # 2018..2025

# Feature beállítások
FORM_WINDOW = 5          # idei utolsó N futam
TRACK_YEARS_BACK = 6     # ennyi évre nézünk vissza ugyanazon pályán
TRACK_SHRINK_K = 3.0     # shrinkage simítás (minél nagyobb, annál kevésbé “ugrál” kis mintán)
