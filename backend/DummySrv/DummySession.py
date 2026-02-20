import pandas as pd
import json
from pathlib import Path

class DummySession:
    def __init__(self, meta: dict, results: pd.DataFrame):
        self.year = meta["year"]
        self.round = meta["round"]
        self.name = meta["session_type"]
        self.gp = meta["gp"]
        self.session_name = meta["session_name"]

        self.results = results

    def load(self):
        return self

def load_session_from_export(year: int, round: int, session_type: str):
    export_dir = Path(f"dummy/{year}_{round}_{session_type}")

    if not export_dir.exists():
        raise FileNotFoundError("Nincs ilyen exportált session")

    # meta
    with open(export_dir / "meta.json", encoding="utf-8") as f:
        meta = json.load(f)

    # results
    results = pd.read_csv(export_dir / "results.csv")

    return DummySession(meta, results)
