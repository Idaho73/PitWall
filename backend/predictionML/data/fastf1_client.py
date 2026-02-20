import fastf1
from ..config import CACHE_DIR

_initialized = False

def init_fastf1() -> None:
    global _initialized
    if not _initialized:
        fastf1.Cache.enable_cache(str(CACHE_DIR))
        _initialized = True

def load_session(year: int, round_no: int, session_name: str):
    init_fastf1()
    s = fastf1.get_session(year, round_no, session_name)
    s.load(telemetry=False, weather=False, laps=False)
    return s
