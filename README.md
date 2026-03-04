# 🏎️ F1 Analytics App

A full-stack Formula 1 analytics web application for exploring drivers, comparing lap performances, and analyzing race telemetry.

The application combines a **FastAPI backend** with a **Next.js frontend**, running in **Docker containers** with a **PostgreSQL database**.

---

# ✨ Features

- Driver explorer with search
- Driver flip cards with portraits
- Lap comparison between two drivers
- Session selection (season, Grand Prix, session type)
- Interactive frontend UI
- Telemetry-based performance analysis

---

# 🧱 Tech Stack

### Backend
- Python
- FastAPI
- Pandas
- FastF1
- PostgreSQL

### Frontend
- Next.js
- React
- TypeScript
- TailwindCSS

### Infrastructure
- Docker
- Docker Compose

---


# 🚀 Running the Application

The entire application runs inside Docker containers.

## Start the application

From the project root:

```bash
docker compose up --build
```
Docker will start:

PostgreSQL database

FastAPI backend

Next.js frontend

Access the application
Service	URL
  - Frontend	http://localhost:3000

  - Backend API	http://localhost:8000

  - API Documentation	http://localhost:8000/docs

⚡ Quick Start (Windows)

The repository contains a helper script:
```
start_app.bat
```

The script will:

Delete the old backend log file

  - Stop running containers
  
  - Rebuild Docker images
  
  - Start the containers
  
  - Display the running containers
  
This provides a quick one-command startup for development.

👩‍💻 Author

Gergő Réti

Software developer interested in:
  
  - Data analysis
  
  - Interactive visualization
  
  - Motorsport analytics
  
  - Backend systems

📄 License

This project is for educational and portfolio purposes.
