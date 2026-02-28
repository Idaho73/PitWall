# app/main.py
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from utils.logger import logger
from time import time
from routers import lap, users, race, position_changes, leaderboard, prediction, drivers

app = FastAPI()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time()

    response = await call_next(request)
    process_time = (time() - start_time) * 1000

    logger.info(
        f"{request.client.host} - {request.method} {request.url.path} "
        f"→ {response.status_code} ({process_time:.2f}ms)"
    )

    return response

# CORS – fejlesztéshez nyitott
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # élesben szigorítsd
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routerek
app.include_router(lap.router)
app.include_router(users.router)
app.include_router(race.router)
app.include_router(position_changes.router)
app.include_router(leaderboard.router)
app.include_router(prediction.router)
app.include_router(drivers.router)
