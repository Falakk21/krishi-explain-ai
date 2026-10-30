import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from pathlib import Path
from app.core.config import settings
from app.schemas.models import ClimateInput

class CropYieldPredictor:
    def __init__(self):
        self.model = None
        self.metadata = None
        self.background_sample = None
        self.is_loaded = False
        self._load_artifacts()

    def _load_artifacts(self):
        try:
            model_path = settings.MODEL_PATH
            metadata_path = settings.METADATA_PATH
            bg_path = settings.ARTIFACTS_DIR / "background_sample.joblib"
            
            if model_path.exists() and metadata_path.exists():
                self.model = joblib.load(model_path)
                with open(metadata_path, "r") as f:
                    self.metadata = json.load(f)
                if bg_path.exists():
                    self.background_sample = joblib.load(bg_path)
                self.is_loaded = True
                print(f"[Predictor] Successfully loaded model: {self.metadata.get('model_name')}")
            else:
                print("[Predictor] Model artifacts not found. System ready for Demo Mode.")
                self.is_loaded = False
        except Exception as e:
            print(f"[Predictor] Error loading model artifacts: {e}. Falling back to Demo Mode.")
            self.is_loaded = False

    def check_extrapolation(self, climate: ClimateInput) -> Tuple[bool, str]:
        """
        Detects whether incoming inputs lie outside the model's validated training distribution.
        """
        if not self.metadata or not self.metadata.get("feature_ranges"):
            return True, "No trained-data feature ranges are available for this prediction."

        reasons = []
        for feature, value in {
            "avg_temperature": climate.avg_temperature,
            "max_temperature": climate.max_temperature,
            "rainfall_mm": climate.rainfall_mm,
            "humidity_pct": climate.humidity_pct,
            "soil_moisture_pct": climate.soil_moisture_pct,
            "heat_wave_days": climate.heat_wave_days,
        }.items():
            observed_range = self.metadata["feature_ranges"].get(feature)
            if not observed_range:
                continue
            lower = observed_range["p05"]
            upper = observed_range["p95"]
            if value < lower or value > upper:
                reasons.append(
                    f"{feature}={value} is outside the training 5th-95th percentile "
                    f"range ({lower}-{upper})"
                )
            
        if reasons:
            return True, "; ".join(reasons)
        return False, "All inputs fall within their training 5th-95th percentile ranges."

    def predict(self, climate: ClimateInput, force_demo: bool = False) -> Dict[str, Any]:
        """
        Runs prediction. If real model is loaded and not forced into demo, uses the trained pipeline.
        Otherwise executes deterministic agronomic demonstration simulation.
        """
        use_demo = force_demo or settings.DEMO_MODE or not self.is_loaded

        # Prepare feature vector
        feature_dict = {
            "avg_temperature": climate.avg_temperature,
            "max_temperature": climate.max_temperature,
            "rainfall_mm": climate.rainfall_mm,
            "humidity_pct": climate.humidity_pct,
            "soil_moisture_pct": climate.soil_moisture_pct,
            "heat_wave_days": climate.heat_wave_days,
            "district": climate.district,
        }
        feature_df = pd.DataFrame([feature_dict])

        is_extrapolated, extrap_note = self.check_extrapolation(climate)

        if not use_demo and self.model is not None:
            pred_yield = float(self.model.predict(feature_df)[0])
            base_val = float(self.metadata["base_value"])
            regional_mean = float(self.metadata["regional_historical_mean"])
            
            pct_change = round(((pred_yield - regional_mean) / regional_mean) * 100, 2)

            return {
                "predicted_yield": pred_yield,
                "base_value": base_val,
                "baseline_yield": regional_mean,
                "yield_change_pct": pct_change,
                "is_demo": False,
                "model_name": self.metadata["model_name"],
                "model_version": (
                    f"v1.0 (training observations {self.metadata['dataset']['year_range'][0]}-"
                    f"{self.metadata['dataset']['year_range'][1]})"
                ),
                "r2_score": self.metadata["metrics"]["test"]["r2"],
                "mae": self.metadata["metrics"]["test"]["mae"],
                "is_extrapolated": is_extrapolated,
                "extrapolation_note": extrap_note,
                "feature_df": feature_df
            }
        else:
            # Deterministic Agro-Ecological Demo Simulation
            # Base regional yield ~ 4.85 t/ha
            base_yield = 4.85
            # Terminal heat penalty
            heat_impact = -0.12 * max(0.0, climate.max_temperature - 30.5) - (0.025 * max(0, climate.heat_wave_days - 6))
            # Rainfall impact
            rain_impact = 0.04 if 70.0 <= climate.rainfall_mm <= 130.0 else -0.003 * abs(climate.rainfall_mm - 100.0)
            # Temperature impact
            temp_impact = -0.09 * max(0.0, climate.avg_temperature - 18.5)
            
            simulated_yield = max(2.0, min(6.0, round(base_yield + heat_impact + rain_impact + temp_impact, 2)))
            pct_change = round(((simulated_yield - base_yield) / base_yield) * 100, 2)

            return {
                "predicted_yield": simulated_yield,
                "base_value": base_yield,
                "baseline_yield": base_yield,
                "yield_change_pct": pct_change,
                "is_demo": True,
                "model_name": "Demonstration Simulation Model (Agro-climatic Response)",
                "model_version": "vDemo-1.0",
                "r2_score": None,
                "mae": None,
                "is_extrapolated": is_extrapolated,
                "extrapolation_note": extrap_note,
                "feature_df": feature_df
            }

predictor = CropYieldPredictor()
