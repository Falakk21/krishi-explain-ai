import json
import numpy as np
import pandas as pd
import shap
from typing import List, Dict, Any, Optional, Tuple
from app.ml.predictor import predictor
from app.schemas.models import FeatureContribution, GlobalFeatureImportance, ExplanationResponse
from app.core.config import settings

FEATURE_LABELS = {
    "avg_temperature": "Average Temperature",
    "max_temperature": "Max / Terminal Heat Temp",
    "rainfall_mm": "Seasonal Rainfall",
    "humidity_pct": "Relative Humidity",
    "soil_moisture_pct": "Soil Moisture",
    "heat_wave_days": "Terminal Heat Wave Days",
    "district": "District",
}

FEATURE_UNITS = {
    "avg_temperature": "°C",
    "max_temperature": "°C",
    "rainfall_mm": "mm",
    "humidity_pct": "%",
    "soil_moisture_pct": "%",
    "heat_wave_days": "days",
    "district": "",
}

class ShapExplainerService:
    def __init__(self):
        self.explainer = None
        self._init_explainer()

    def _init_explainer(self):
        if predictor.is_loaded and predictor.model is not None:
            try:
                self.explainer = shap.TreeExplainer(
                    predictor.model.named_steps["regressor"]
                )
                print("[SHAP] Successfully initialized SHAP TreeExplainer.")
            except Exception as e:
                print(f"[SHAP] Error initializing TreeExplainer: {e}")
                self.explainer = None

    def explain_individual(
        self, feature_df: pd.DataFrame, is_demo: bool = False
    ) -> Tuple[List[FeatureContribution], Optional[float], str]:
        """
        Calculates individual feature attributions for a given prediction.
        Returns: (contributions_list, base_value, plain_language_summary)
        """
        if is_demo:
            return (
                [],
                None,
                "Individual climate-factor details are unavailable for demonstration estimates.",
            )

        if self.explainer is None:
            raise RuntimeError("The trained model is loaded, but SHAP TreeExplainer is unavailable.")
        preprocessor = predictor.model.named_steps["preprocessor"]
        transformed_names = predictor.metadata["transformed_feature_names"]
        transformed_df = pd.DataFrame(
            preprocessor.transform(feature_df),
            columns=transformed_names,
        )
        shap_values = self.explainer.shap_values(transformed_df)
        if isinstance(shap_values, list):
            transformed_shap = np.asarray(shap_values[0])[0]
        elif len(shap_values.shape) > 1:
            transformed_shap = np.asarray(shap_values)[0]
        else:
            transformed_shap = np.asarray(shap_values)

        cols = predictor.metadata["feature_columns"]
        shap_vec = [0.0] * len(cols)
        for group, value in zip(
            predictor.metadata["transformed_feature_groups"],
            transformed_shap,
        ):
            shap_vec[cols.index(group)] += float(value)

        expected_value = self.explainer.expected_value
        base_value = float(expected_value if np.ndim(expected_value) == 0 else expected_value[0])

        contributions = []
        for col, val in zip(cols, shap_vec):
            observed = str(feature_df[col].iloc[0]) if col == "district" else float(feature_df[col].iloc[0])
            shap_val = round(float(val), 4)
            direction = "positive" if shap_val >= 0 else "negative"
            abs_val = abs(shap_val)
            
            if abs_val > 0.08:
                magnitude = "high"
            elif abs_val > 0.03:
                magnitude = "medium"
            else:
                magnitude = "low"

            label = FEATURE_LABELS.get(col, col)
            unit = FEATURE_UNITS.get(col, "")

            # Scientific plain-language interpretation
            if col == "max_temperature":
                if shap_val < -0.02:
                    interp = f"Elevated terminal temperature ({observed}{unit}) exerted a downward push of {abs(shap_val):.2f} t/ha due to grain filling stress."
                else:
                    interp = f"Terminal temperatures ({observed}{unit}) remained within normal tolerances, supporting baseline development."
            elif col == "rainfall_mm":
                if shap_val > 0.02:
                    interp = f"Favorable cumulative winter rainfall ({observed}{unit}) supported root-zone moisture (+{shap_val:.2f} t/ha attribution)."
                elif shap_val < -0.02:
                    interp = f"Rainfall deviation ({observed}{unit}) reduced projected yield by {abs(shap_val):.2f} t/ha compared to optimal Rabi moisture."
                else:
                    interp = f"Rainfall ({observed}{unit}) showed neutral contribution relative to baseline."
            elif col == "avg_temperature":
                if shap_val < -0.02:
                    interp = f"Warmer mean temperature ({observed}{unit}) shortened tillering phase, pulling prediction down by {abs(shap_val):.2f} t/ha."
                elif shap_val > 0.02:
                    interp = f"Cool vegetative season ({observed}{unit}) extended vegetative tillering (+{shap_val:.2f} t/ha)."
                else:
                    interp = f"Mean season temperature ({observed}{unit}) aligned near historical mean."
            elif col == "heat_wave_days":
                if shap_val < -0.02:
                    interp = f"{int(observed)} terminal heat days accelerated crop maturity, penalizing yield by {abs(shap_val):.2f} t/ha."
                else:
                    interp = f"Minimal heatwave days ({int(observed)}) minimized forced ripening risk."
            elif col == "district":
                interp = f"District context for {observed} contributed {shap_val:+.2f} t/ha in this estimate; this does not establish cause and effect."
            else:
                interp = f"{label} of {observed}{unit} contributed {shap_val:+.2f} t/ha relative to the regional baseline."

            contributions.append(FeatureContribution(
                feature=col,
                feature_label=label,
                observed_value=observed,
                unit=unit,
                shap_value=shap_val,
                direction=direction,
                impact_magnitude=magnitude,
                interpretation=interp
            ))

        # Sort by absolute impact descending
        contributions.sort(key=lambda c: abs(c.shap_value), reverse=True)

        # Generate Plain-Language Natural Language Explanation
        top_positive = [c for c in contributions if c.direction == "positive" and abs(c.shap_value) > 0.015]
        top_negative = [c for c in contributions if c.direction == "negative" and abs(c.shap_value) > 0.015]

        parts = [f"The regional yield baseline is {base_value:.2f} t/ha."]
        if top_negative:
            neg_names = [f"{c.feature_label} ({c.observed_value}{c.unit}, {c.shap_value:+.2f} t/ha)" for c in top_negative[:2]]
            parts.append(f"The largest downward pressures were exerted by {', and '.join(neg_names)}.")
        if top_positive:
            pos_names = [f"{c.feature_label} ({c.observed_value}{c.unit}, +{c.shap_value:.2f} t/ha)" for c in top_positive[:2]]
            parts.append(f"Positive contributions came from {', and '.join(pos_names)}.")
        if not top_positive and not top_negative:
            parts.append("Climate factors were close to regional baseline conditions, with modest individual contributions.")

        parts.append("These contributions describe patterns in the available records and do not prove biological cause and effect.")

        summary_text = " ".join(parts)
        return contributions, base_value, summary_text

    def get_global_importance(self) -> List[GlobalFeatureImportance]:
        """
        Returns global feature importance ranked by mean absolute SHAP value.
        """
        if predictor.metadata and "global_importances" in predictor.metadata:
            return [GlobalFeatureImportance(**item) for item in predictor.metadata["global_importances"]]
        return []

shap_service = ShapExplainerService()
