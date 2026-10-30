import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.schemas.models import (
    ClimateInput, AssessmentResponse, PredictionSummary,
    RiskIndicator, AdaptationStrategy
)
from app.ml.predictor import predictor
from app.explainability.shap_explainer import shap_service
from app.core.config import settings

class AssessmentService:
    def __init__(self):
        # Store assessments in memory for session export
        self._history: Dict[str, AssessmentResponse] = {}

    def calculate_risk_indicators(self, climate: ClimateInput) -> List[RiskIndicator]:
        indicators = []

        # 1. Terminal Heat Stress Risk
        if climate.max_temperature >= 33.5 or climate.heat_wave_days >= 12:
            heat_level = "Critical"
            heat_score = 92.0
            heat_desc = f"Severe terminal heat threat: peak temp {climate.max_temperature}°C with {climate.heat_wave_days} heatwave days accelerates grain desiccation."
        elif climate.max_temperature >= 31.0 or climate.heat_wave_days >= 7:
            heat_level = "High"
            heat_score = 74.0
            heat_desc = f"Elevated terminal temperature ({climate.max_temperature}°C) during grain filling poses grain shrivelling risk."
        elif climate.max_temperature >= 29.0:
            heat_level = "Moderate"
            heat_score = 45.0
            heat_desc = f"Moderate grain-filling temperatures ({climate.max_temperature}°C). Normal monitoring recommended."
        else:
            heat_level = "Low"
            heat_score = 15.0
            heat_desc = f"Favorable cool conditions ({climate.max_temperature}°C) facilitate extended grain filling."

        indicators.append(RiskIndicator(
            category="Terminal Heat Stress",
            level=heat_level,
            score=heat_score,
            description=heat_desc,
            threshold_info="Agronomic threshold: daily max temp > 31.0°C in March reduces grain weight."
        ))

        # 2. Precipitation / Water Balance Risk
        if climate.rainfall_mm < 35.0:
            rain_level = "High"
            rain_score = 80.0
            rain_desc = f"Severe winter rain deficit ({climate.rainfall_mm} mm). Substantially elevated supplemental irrigation requirement."
        elif climate.rainfall_mm < 65.0:
            rain_level = "Moderate"
            rain_score = 50.0
            rain_desc = f"Below-average winter showers ({climate.rainfall_mm} mm). Additional tube-well irrigation passes required."
        elif climate.rainfall_mm > 175.0:
            rain_level = "High"
            rain_score = 78.0
            rain_desc = f"Unseasonal heavy downpours ({climate.rainfall_mm} mm). Heightened risk of crop lodging and yellow rust disease."
        else:
            rain_level = "Low"
            rain_score = 20.0
            rain_desc = f"Seasonal rainfall ({climate.rainfall_mm} mm) falls within optimal range (75-140 mm) for Punjab Rabi wheat."

        indicators.append(RiskIndicator(
            category="Precipitation Anomaly",
            level=rain_level,
            score=rain_score,
            description=rain_desc,
            threshold_info="Optimal Punjab Rabi cumulative rainfall: 75 - 140 mm across November-March."
        ))

        # 3. Vegetative Temperature Regime
        if climate.avg_temperature >= 20.5:
            temp_level = "High"
            temp_score = 72.0
            temp_desc = f"Unusually warm winter mean ({climate.avg_temperature}°C) shortens tillering period and reduces spikelet count."
        elif climate.avg_temperature >= 18.5:
            temp_level = "Moderate"
            temp_score = 42.0
            temp_desc = f"Slightly warm vegetative period ({climate.avg_temperature}°C). Slight reduction in optimal tillering."
        else:
            temp_level = "Low"
            temp_score = 18.0
            temp_desc = f"Cool winter vegetative season ({climate.avg_temperature}°C) promotes healthy crown root and tiller development."

        indicators.append(RiskIndicator(
            category="Vegetative Season Temperature",
            level=temp_level,
            score=temp_score,
            description=temp_desc,
            threshold_info="Ideal mean seasonal temperature for Punjab wheat vegetative phase: 15.0 - 18.0°C."
        ))

        # 4. Root-Zone Soil Moisture
        if climate.soil_moisture_pct < 25.0:
            soil_level = "High"
            soil_score = 82.0
            soil_desc = f"Low root-zone moisture ({climate.soil_moisture_pct}%). High plant moisture stress during critical boot stage."
        elif climate.soil_moisture_pct > 65.0:
            soil_level = "Moderate"
            soil_score = 52.0
            soil_desc = f"Excessive soil wetness ({climate.soil_moisture_pct}%). Potential root zone hypoxia and nutrient leaching."
        else:
            soil_level = "Low"
            soil_score = 15.0
            soil_desc = f"Optimal root-zone moisture ({climate.soil_moisture_pct}%) supports steady transpiration and nutrient uptake."

        indicators.append(RiskIndicator(
            category="Soil Moisture Status",
            level=soil_level,
            score=soil_score,
            description=soil_desc,
            threshold_info="Optimal available soil moisture for wheat: 35% - 55% of field capacity."
        ))

        return indicators

    def generate_adaptation_strategies(self, climate: ClimateInput, risk_indicators: List[RiskIndicator]) -> List[AdaptationStrategy]:
        strategies = []
        high_risks = [r.category for r in risk_indicators if r.level in ["High", "Critical"]]

        # Heat-focused strategies
        if "Terminal Heat Stress" in high_risks or climate.max_temperature >= 31.0:
            strategies.append(AdaptationStrategy(
                risk_factor="Terminal Heat Stress",
                strategy_title="Adopt Early-Sowing Climate-Resilient Cultivars",
                action_summary="Sow certified heat-tolerant cultivars (such as DBW 187, DBW 303, or PBW 824) between October 25 and November 5.",
                why_relevant="Shifts the grain filling period into cooler late-February days, escaping March peak temperature spikes.",
                favorable_conditions="Timely availability of seed drills and assured field preparation following Kharif harvest.",
                practical_limitations="Requires timely harvesting of preceding Kharif crop (paddy/cotton); early sown crops may require preventive monitoring for early-stage pink stem borer.",
                credible_source="ICAR-Indian Institute of Wheat and Barley Research (IIWBR) Karnal, Advisory Bulletin 2023.",
                is_rule_based=True
            ))
            strategies.append(AdaptationStrategy(
                risk_factor="Terminal Heat Stress",
                strategy_title="Canopy Temperature Depression via Micro-Irrigation",
                action_summary="Apply light sprinkler irrigation (approx. 25-30 mm) during high temperature spikes in March at heading/anthesis stage.",
                why_relevant="Micro-sprinkler application lowers crop microclimate canopy temperatures by 2.0 to 3.5°C through evaporative cooling.",
                favorable_conditions="Installed portable or permanent sprinkler system with electricity/tubewell reliability.",
                practical_limitations="High initial capital setup cost; not recommended during periods of high wind to avoid lodging risk.",
                credible_source="Punjab Agricultural University (PAU) Department of Climate Change & Agronomy, Research Bulletin.",
                is_rule_based=True
            ))

        # Moisture / Rain deficit strategies
        if "Precipitation Anomaly" in high_risks and climate.rainfall_mm < 70.0:
            strategies.append(AdaptationStrategy(
                risk_factor="Precipitation Anomaly",
                strategy_title="Tensiometer-Guided Critical Stage Irrigation",
                action_summary="Prioritize irrigations strictly at Crown Root Initiation (21 DAS), Booting, and Grain Milking stages guided by tensiometers.",
                why_relevant="Prevents plant moisture stress at yield-determining physiological checkpoints while conserving 20-25% tube-well groundwater.",
                favorable_conditions="Access to canal rotation schedules or solar/electric tube-well power.",
                practical_limitations="Groundwater table depth in Central Punjab districts requires energy-intensive deep submersible extraction.",
                credible_source="PAU Ludhiana Water Technology Centre, Irrigation Scheduling Guide 2022.",
                is_rule_based=True
            ))
            strategies.append(AdaptationStrategy(
                risk_factor="Precipitation Anomaly",
                strategy_title="Paddy Straw Surface Mulching (Happy Seeder System)",
                action_summary="Retain paddy residue on soil surface using Happy Seeder or Smart Seeder at planting.",
                why_relevant="Surface straw mulch suppresses soil water evaporation by 30-40 mm and moderates topsoil temperature fluctuations.",
                favorable_conditions="Zero-till seeder availability and uniform straw distribution by combine harvester chopper.",
                practical_limitations="May require additional nitrogen top-dressing to counter initial residue immobilization.",
                credible_source="CGIAR Research Program on Climate Change, Agriculture and Food Security (CCAFS).",
                is_rule_based=True
            ))

        # Heavy Rain / Lodging strategies
        if "Precipitation Anomaly" in high_risks and climate.rainfall_mm > 160.0:
            strategies.append(AdaptationStrategy(
                risk_factor="Precipitation Anomaly",
                strategy_title="Lodging Prevention via Growth Regulators & Field Drainage",
                action_summary="Spray Chlormequat chloride (Lihocin @ 0.2%) + Propiconazole at first node stage, and maintain field drainage furrows.",
                why_relevant="Strengthens basal internodes to prevent structural lodging from sudden March windstorms accompanied by heavy showers.",
                favorable_conditions="High-fertility soils receiving heavy basal nitrogen where vegetative growth is excessive.",
                practical_limitations="Must be sprayed precisely at the first node stage; late sprays may reduce spike length.",
                credible_source="ICAR-IIWBR Crop Protection Technical Advisory.",
                is_rule_based=True
            ))

        # General baseline resilience strategy
        strategies.append(AdaptationStrategy(
            risk_factor="Overall Agro-Ecological Resilience",
            strategy_title="Weather-Based Agro-Advisory Subscription (Meghdoot / Damini)",
            action_summary="Register for bi-weekly block-level IMD Agromet advisories delivered via Krishi Vigyan Kendras (KVKs).",
            why_relevant="Enables 5-day advance tactical planning for irrigation withholding, fertilizer split timing, and fungicide application.",
            favorable_conditions="Universal access via mobile smartphone or regional Panchayat broadcast.",
            practical_limitations="Local micro-scale convective showers can occasionally deviate from regional forecast models.",
            credible_source="India Meteorological Department (IMD) - Ministry of Earth Sciences, Gramin Krishi Mausam Sewa.",
            is_rule_based=True
        ))

        return strategies

    def assess_impact(self, climate: ClimateInput, force_demo: bool = False) -> AssessmentResponse:
        assessment_id = f"KEX-{uuid.uuid4().hex[:8].upper()}"
        now_iso = datetime.now(timezone.utc).isoformat()

        # ML Prediction
        pred_res = predictor.predict(climate, force_demo=force_demo)
        is_demo = pred_res["is_demo"]

        # SHAP Explanation
        contributions, base_value, nl_explanation = shap_service.explain_individual(
            pred_res["feature_df"], is_demo=is_demo
        )

        # Risk Indicators
        risk_indicators = self.calculate_risk_indicators(climate)

        # Adaptation Strategies
        adaptation_strategies = self.generate_adaptation_strategies(climate, risk_indicators)

        demo_warning = (
            "Demonstration estimate: individual climate-factor details are unavailable for this result."
            if is_demo else None
        )

        prediction_summary = PredictionSummary(
            predicted_yield=pred_res["predicted_yield"],
            yield_unit="t/ha",
            baseline_yield=pred_res["baseline_yield"],
            yield_change_pct=pred_res["yield_change_pct"],
            prediction_period=f"{climate.growing_season} {climate.assessment_year}",
            crop=climate.crop,
            region=f"{climate.district}, {climate.state}, {climate.country}",
            is_demo=is_demo,
            model_name=pred_res["model_name"],
            model_version=pred_res["model_version"],
            r2_score=pred_res.get("r2_score"),
            mae=pred_res.get("mae")
        )

        disclaimer = (
            "Estimate Disclaimer: Yield estimates reflect historical regional climate and crop patterns and may not account for "
            "hailstorms, pest outbreaks, local soil conditions, or other factors. This is a conditional estimate, "
            "not a year-trend or future-yield forecast. Adaptation guidance should be checked with local State "
            "Agricultural Extension Officers or Krishi Vigyan Kendras (KVKs)."
        )

        response = AssessmentResponse(
            assessment_id=assessment_id,
            timestamp=now_iso,
            is_demo=is_demo,
            demo_warning=demo_warning,
            input_summary=climate,
            prediction=prediction_summary,
            risk_assessment=risk_indicators,
            key_contributors=contributions,
            base_value=base_value,
            plain_language_explanation=nl_explanation,
            adaptation_insights=adaptation_strategies,
            scientific_disclaimer=disclaimer
        )

        # Store in memory for export
        self._history[assessment_id] = response
        return response

    def get_assessment(self, assessment_id: str) -> AssessmentResponse:
        return self._history.get(assessment_id)

assessment_service = AssessmentService()
