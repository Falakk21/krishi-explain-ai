import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "KrishiExplain AI"
    VERSION: str = "1.0.0"
    TAGLINE: str = "Climate Insights. Explainable AI. Resilient Agriculture."
    
    # Mode
    DEMO_MODE: bool = False
    ENVIRONMENT: str = "development"
    
    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Artifact Paths
    ARTIFACTS_DIR: Path = BASE_DIR / "app" / "ml" / "artifacts"
    MODEL_PATH: Path = BASE_DIR / "app" / "ml" / "artifacts" / "wheat_model.joblib"
    METADATA_PATH: Path = BASE_DIR / "app" / "ml" / "artifacts" / "metadata.json"
    DATA_PATH: Path = BASE_DIR / "app" / "data" / "raw" / "punjab_wheat_real_data.csv"
    REPORTS_DIR: Path = BASE_DIR / "app" / "reports" / "generated"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
