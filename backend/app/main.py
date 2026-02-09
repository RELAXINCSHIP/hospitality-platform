from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.integrations import router as integration_router

app = FastAPI(
    title="HOSPITALITY AI OS",
    description="Enterprise AI Operating System for Premium Hospitality",
    version="0.1.0",
)

# Initialize Database Tables
from app.db.base import Base
from app.db.session import engine
# Import all models to ensure they are registered with Base
from app.db import models, xs_models
Base.metadata.create_all(bind=engine)

# CORS Configuration
origins = [
    "http://localhost:3000",  # Next.js Frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "HOSPITALITY AI OS is online", "status": "operational"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0"}

# Include Routers
app.include_router(integration_router.router, prefix="/api/v1/integrations", tags=["integrations"])
from app.api import unity as unity_router
app.include_router(unity_router.router, prefix="/api/v1/unity", tags=["unity-os"])
from app.api import xs_features as xs_router
app.include_router(xs_router.router, prefix="/api/v1/xs", tags=["xs-nightclub"])
