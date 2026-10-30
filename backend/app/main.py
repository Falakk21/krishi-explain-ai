import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import api_router
from app.ml.predictor import predictor
from app.explainability.shap_explainer import shap_service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure artifacts and reports directories exist
    settings.ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[{settings.PROJECT_NAME}] Initialized successfully.")
    print(f"[{settings.PROJECT_NAME}] Model Loaded: {predictor.is_loaded} (Demo Mode: {settings.DEMO_MODE})")
    yield
    print(f"[{settings.PROJECT_NAME}] Shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable AI for Climate Change Impact Assessment on Agriculture (Rabi Wheat, Punjab, India)",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for hackathon / local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(api_router, prefix="/api")

# Root redirect or health check at /health
@app.get("/health", tags=["Root"])
def root_health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE or not predictor.is_loaded,
        "model_loaded": predictor.is_loaded,
        "model_name": predictor.metadata.get("model_name") if predictor.is_loaded else "Demonstration Simulation",
        "shap_available": shap_service.explainer is not None
    }

@app.get("/", tags=["Root"])
def root_info():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "tagline": settings.TAGLINE,
        "docs_url": "/docs",
        "health_url": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
