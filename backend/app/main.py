import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import router as auth_router
from app.routes.profile import router as profile_router
from app.routes.research import router as research_router
from app.routes.funding import router as funding_router
from app.routes.patent import router as patent_router
from app.routes.technology import router as technology_router
from app.routes.innovation import router as innovation_router
from app.routes.commercialization import (
    router as commercialization_router
)
from app.routes.dashboard import router as dashboard_router
from app.routes.notifications import router as notifications_router
from app.routes.reports import router as reports_router

app = FastAPI(
    title="Intelligent Research Platform API",
    description=(
        "Backend API for the Intelligent "
        "Research Platform"
    ),
    version="1.0.0"
)


# --------------------------------
# CORS Configuration
# --------------------------------

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

frontend_url_env = os.getenv("FRONTEND_URL")
if frontend_url_env:
    extra_origins = [origin.strip().rstrip("/") for origin in frontend_url_env.split(",") if origin.strip()]
    for origin in extra_origins:
        if origin and origin not in allowed_origins:
            allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------
# Routes
# --------------------------------

app.include_router(
    auth_router
)

app.include_router(
    profile_router
)

app.include_router(
    research_router
)

app.include_router(
    funding_router
)

app.include_router(
    patent_router
)

app.include_router(
    technology_router
)

app.include_router(
    innovation_router
)

app.include_router(
    commercialization_router
)

app.include_router(
    dashboard_router
)

app.include_router(
    notifications_router
)

app.include_router(
    reports_router
)



# --------------------------------
# Root
# --------------------------------

@app.get("/")
def root():

    return {
        "message":
            "Intelligent Research "
            "Platform API is running",

        "status":
            "success",

        "version":
            "1.0.0"
    }


# --------------------------------
# Health
# --------------------------------

@app.get("/api/health")
def health():

    return {
        "status":
            "healthy",

        "service":
            "backend"
    }