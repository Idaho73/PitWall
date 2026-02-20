# cfg.py
import os

class Cfg:
    VERSION = "0.1.0"

    TEST_SYSTEM = os.getenv("TEST_SYSTEM", "false").lower() == "true"
