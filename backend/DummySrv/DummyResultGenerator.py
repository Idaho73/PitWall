import fastf1
from pathlib import Path

fastf1.Cache.enable_cache("cache")

def export_session(year: int, round: int, session_type: str):
    session = fastf1.get_session(year, round, session_type)
    session.load()

    export_dir = Path(f"dummy/{year}_{round}_{session_type}")
    export_dir.mkdir(parents=True, exist_ok=True)

    # 1️⃣ results DataFrame → CSV
    session.results.to_csv(
        export_dir / "results.csv",
        index=False
    )

    # 2️⃣ results DataFrame → JSON
    session.results.to_json(
        export_dir / "results.json",
        orient="records",
        indent=2
    )

    # 3️⃣ session metaadatok
    meta = {
        "year": year,
        "round": round,
        "session_type": session_type,
        "gp": session.event["EventName"],
        "session_name": session.name
    }

    with open(export_dir / "meta.json", "w", encoding="utf-8") as f:
        import json
        json.dump(meta, f, indent=2)

    print(f"Export kész: {export_dir}")


export_session(2025, 13, "R")
