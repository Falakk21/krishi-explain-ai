from typing import Dict, Any, List
import pandas as pd
from app.schemas.models import ScenarioInput, SimulationResult, ClimateInput
from app.ml.predictor import predictor
from app.explainability.shap_explainer import shap_service

class SimulationService:
    def simulate_scenario(self, scenario: ScenarioInput, force_demo: bool = False) -> SimulationResult:
        base_climate = scenario.baseline_input
        
        # Construct scenario climate conditions
        scenario_temp = round(base_climate.avg_temperature + scenario.delta_temperature, 2)
        scenario_max_temp = round(base_climate.max_temperature + scenario.delta_temperature * 1.25, 2)
        
        # Rainfall calculation from percentage change
        rainfall_factor = max(0.1, 1.0 + (scenario.delta_rainfall_pct / 100.0))
        scenario_rain = round(max(10.0, base_climate.rainfall_mm * rainfall_factor), 1)
        
        # Humidity adjustment (warmer and drier reduces humidity)
        humidity_delta = -1.5 * scenario.delta_temperature + 0.15 * (scenario.delta_rainfall_pct)
        scenario_humidity = round(max(20.0, min(95.0, base_climate.humidity_pct + humidity_delta)), 1)
        
        # Soil moisture adjustment
        soil_delta = -1.2 * scenario.delta_temperature + 0.22 * (scenario.delta_rainfall_pct)
        scenario_soil = round(max(15.0, min(75.0, base_climate.soil_moisture_pct + soil_delta)), 1)
        
        # Heat wave days
        heat_delta = scenario.delta_heat_wave_days
        if scenario.delta_temperature > 1.0 and heat_delta == 0:
            heat_delta = int(scenario.delta_temperature * 2.8)
        scenario_heat_days = max(0, min(35, base_climate.heat_wave_days + heat_delta))

        # Scenario Climate Input object
        scenario_climate = ClimateInput(
            country=base_climate.country,
            state=base_climate.state,
            district=base_climate.district,
            crop=base_climate.crop,
            growing_season=base_climate.growing_season,
            assessment_year=base_climate.assessment_year,
            irrigation_type=base_climate.irrigation_type,
            avg_temperature=scenario_temp,
            max_temperature=scenario_max_temp,
            rainfall_mm=scenario_rain,
            humidity_pct=scenario_humidity,
            soil_moisture_pct=scenario_soil,
            heat_wave_days=scenario_heat_days
        )

        # Baseline prediction
        base_pred = predictor.predict(base_climate, force_demo=force_demo)
        base_yield = base_pred["predicted_yield"]

        # Scenario prediction
        scen_pred = predictor.predict(scenario_climate, force_demo=force_demo)
        scen_yield = scen_pred["predicted_yield"]

        abs_diff = round(scen_yield - base_yield, 2)
        pct_diff = round(((scen_yield - base_yield) / max(0.1, base_yield)) * 100, 2)

        # Feature contribution comparisons
        base_contribs, _, _ = shap_service.explain_individual(base_pred["feature_df"], is_demo=base_pred["is_demo"])
        scen_contribs, _, _ = shap_service.explain_individual(scen_pred["feature_df"], is_demo=scen_pred["is_demo"])

        base_contrib_map = {c.feature: c for c in base_contribs}
        changed_contributors = []
        for sc in scen_contribs:
            bc = base_contrib_map.get(sc.feature)
            base_shap = bc.shap_value if bc else 0.0
            delta_shap = round(sc.shap_value - base_shap, 4)
            changed_contributors.append({
                "feature": sc.feature,
                "feature_label": sc.feature_label,
                "unit": sc.unit,
                "baseline_value": bc.observed_value if bc else 0.0,
                "scenario_value": sc.observed_value,
                "baseline_shap": base_shap,
                "scenario_shap": sc.shap_value,
                "delta_shap": delta_shap,
                "direction": "negative" if delta_shap < 0 else "positive"
            })

        # Check extrapolation outside training distribution
        is_extrap, extrap_note = predictor.check_extrapolation(scenario_climate)

        direction_word = "decrease" if abs_diff < 0 else "increase"
        explanation = (
            f"Under the '{scenario.scenario_name}' scenario, estimated yield shows a {direction_word} "
            f"of {abs(abs_diff):.2f} t/ha ({pct_diff:+.1f}%), from {base_yield:.2f} t/ha "
            f"to {scen_yield:.2f} t/ha."
        )
        if scen_pred["is_demo"]:
            explanation += " This is a demonstration estimate and has no individual factor explanation."
        else:
            largest_change = max(changed_contributors, key=lambda item: abs(item["delta_shap"]))
            if abs(largest_change["delta_shap"]) > 0.015:
                explanation += (
                    f" The largest change in factor contribution was for "
                    f"{largest_change['feature_label']} ({largest_change['delta_shap']:+.2f} t/ha)."
                )
            else:
                explanation += " No individual climate factor had a large change in contribution."

        # Risk shift assessment
        if scen_yield < 3.8:
            risk_shift = "High to Critical Vulnerability: Substantial yield loss expected under these climate extremes."
        elif scen_yield < 4.5:
            risk_shift = "Moderate to Elevated Risk: Noticeable yield drag requiring active adaptation measures."
        else:
            risk_shift = "Stable to Low Risk: Yield remains resilient within typical historical regional ranges."

        return SimulationResult(
            scenario_name=scenario.scenario_name,
            is_demo=scen_pred["is_demo"],
            baseline_prediction=base_yield,
            scenario_prediction=scen_yield,
            absolute_difference=abs_diff,
            percentage_difference=pct_diff,
            yield_unit="t/ha",
            baseline_conditions={
                "avg_temperature": base_climate.avg_temperature,
                "max_temperature": base_climate.max_temperature,
                "rainfall_mm": base_climate.rainfall_mm,
                "humidity_pct": base_climate.humidity_pct,
                "soil_moisture_pct": base_climate.soil_moisture_pct,
                "heat_wave_days": base_climate.heat_wave_days
            },
            scenario_conditions={
                "avg_temperature": scenario_climate.avg_temperature,
                "max_temperature": scenario_climate.max_temperature,
                "rainfall_mm": scenario_climate.rainfall_mm,
                "humidity_pct": scenario_climate.humidity_pct,
                "soil_moisture_pct": scenario_climate.soil_moisture_pct,
                "heat_wave_days": scenario_climate.heat_wave_days
            },
            feature_contribution_changes=changed_contributors,
            explanation=explanation,
            risk_shift=risk_shift,
            is_extrapolation_warning=is_extrap,
            extrapolation_note=extrap_note if is_extrap else None
        )

simulation_service = SimulationService()
