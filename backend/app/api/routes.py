from fastapi import APIRouter, HTTPException, Response, Query
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any

from app.schemas.models import (
    ClimateInput, AssessmentResponse, ExplanationResponse,
    ScenarioInput, SimulationResult, MetadataResponse
)
from app.ml.predictor import predictor
from app.explainability.shap_explainer import shap_service
from app.services.assessment_service import assessment_service
from app.services.simulation_service import simulation_service
from app.services.climate_service import climate_service
from app.reports.pdf_generator import generate_assessment_pdf
from app.core.config import settings

api_router = APIRouter()

@api_router.get("/health", tags=["System"])
def get_health():
    """
    Returns system health, model availability, and runtime mode.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE or not predictor.is_loaded,
        "model_loaded": predictor.is_loaded,
        "model_name": predictor.metadata.get("model_name") if predictor.is_loaded else "Demonstration Simulation",
        "shap_available": shap_service.explainer is not None
    }

@api_router.get("/metadata", response_model=MetadataResponse, tags=["Metadata"])
def get_metadata():
    """
    Returns supported crops, regions, feature definitions, and model evaluation metrics.
    """
    return MetadataResponse(
        supported_crops=["Wheat (Rabi)"],
        supported_countries=["India"],
        supported_states=["Punjab"],
        supported_districts=[
            "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib",
            "Fazilka", "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar",
            "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar",
            "Nawanshahr", "Pathankot", "Patiala", "Rupnagar", "S.A.S Nagar",
            "Sangrur", "Tarn Taran"
        ],
        supported_features=[
            {"id": "avg_temperature", "name": "Average Temperature", "unit": "°C", "min": 0.0, "max": 50.0, "default": 17.3, "desc": "Mean daily NASA POWER T2M across the November-March season."},
            {"id": "max_temperature", "name": "Maximum Terminal-Period Temperature", "unit": "°C", "min": 0.0, "max": 60.0, "default": 36.6, "desc": "Maximum NASA POWER T2M_MAX during February-March."},
            {"id": "rainfall_mm", "name": "Cumulative Rabi Rainfall", "unit": "mm", "min": 0.0, "max": 2000.0, "default": 78.3, "desc": "Sum of daily NASA POWER PRECTOTCORR during November-March."},
            {"id": "humidity_pct", "name": "Relative Humidity", "unit": "%", "min": 0.0, "max": 100.0, "default": 37.7, "desc": "Mean daily NASA POWER RH2M during November-March."},
            {"id": "soil_moisture_pct", "name": "Root-Zone Soil Moisture", "unit": "%", "min": 0.0, "max": 100.0, "default": 38.6, "desc": "Mean daily NASA POWER GWETROOT during November-March, expressed as percent."},
            {"id": "heat_wave_days", "name": "Terminal Heat Days", "unit": "days", "min": 0, "max": 59, "default": 18, "desc": "Days in February-March with NASA POWER T2M_MAX above 31°C."}
        ],
        model_metadata=predictor.metadata or {
            "model_name": "Demonstration Simulation Engine",
            "status": "DEMO_FALLBACK"
        },
        demo_mode=settings.DEMO_MODE or not predictor.is_loaded
    )

@api_router.get("/climate", tags=["Climate Analytics"])
def get_climate_data(
    district: Optional[str] = Query("Ludhiana", description="District filter or 'all'"),
    start_year: int = Query(1997, ge=1997, le=2014),
    end_year: int = Query(2014, ge=1997, le=2014)
):
    """
    Returns historical climate and yield series for the selected district and period.
    """
    result = climate_service.get_climate_series(
        district=district,
        start_year=start_year,
        end_year=end_year
    )
    return result

@api_router.post("/assess", response_model=AssessmentResponse, tags=["Impact Assessment"])
def assess_crop_impact(
    climate_input: ClimateInput,
    force_demo: bool = Query(False, description="Explicitly force demonstration calculation")
):
    """
    Evaluates agricultural impact, calculates prediction, SHAP attributions,
    risk indicators, and evidence-based adaptation recommendations.
    """
    return assessment_service.assess_impact(climate_input, force_demo=force_demo)

@api_router.post("/explain", response_model=ExplanationResponse, tags=["Explainable AI"])
def explain_model(
    sample_input: Optional[ClimateInput] = None,
    force_demo: bool = Query(False)
):
    """
    Returns global feature importance and individual waterfall SHAP contributions.
    """
    is_demo = force_demo or settings.DEMO_MODE or not predictor.is_loaded
    global_importances = shap_service.get_global_importance()
    
    # Generate explanation for given or default input
    if sample_input is None:
        sample_input = ClimateInput(
            country="India",
            state="Punjab",
            district="Ludhiana",
            avg_temperature=19.2,
            max_temperature=32.4,
            rainfall_mm=62.0,
            humidity_pct=48.0,
            soil_moisture_pct=34.0,
            heat_wave_days=9
        )
        
    pred_res = predictor.predict(sample_input, force_demo=is_demo)
    contributions, base_val, summary_text = shap_service.explain_individual(
        pred_res["feature_df"], is_demo=pred_res["is_demo"]
    )

    demo_warning = (
        "Demonstration estimate: individual factor details are unavailable. Overall historical patterns, when present, do not describe this specific estimate."
        if pred_res["is_demo"] else None
    )

    methodology = (
        "Individual contributions show how each climate factor shifts an estimate relative to the regional "
        "baseline. These patterns describe the available historical records and do not prove biological cause and effect."
    )

    return ExplanationResponse(
        is_demo=pred_res["is_demo"],
        demo_warning=demo_warning,
        model_status=(
            "Historical crop and climate estimates"
            if not pred_res["is_demo"]
            else "Demonstration estimate"
        ),
        base_value=base_val,
        units="tonnes per hectare (t/ha)",
        global_importances=global_importances,
        sample_individual_contributions=contributions,
        plain_language_summary=summary_text,
        methodology_note=methodology
    )

@api_router.post("/simulate", response_model=SimulationResult, tags=["What-If Simulator"])
def simulate_climate_scenario(
    scenario_input: ScenarioInput,
    force_demo: bool = Query(False)
):
    """
    Simulates climate perturbation (delta temperature & delta precipitation) against baseline conditions.
    """
    return simulation_service.simulate_scenario(scenario_input, force_demo=force_demo)

@api_router.get("/report/{assessment_id}", tags=["Reports"])
def export_report_by_id(assessment_id: str):
    """
    Downloads generated PDF report for a previously computed assessment ID.
    """
    assessment = assessment_service.get_assessment(assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=404,
            detail=f"Assessment '{assessment_id}' not found in active session memory. Please re-run assessment."
        )
    
    pdf_bytes = generate_assessment_pdf(assessment)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=KrishiExplain_Report_{assessment_id}.pdf"
        }
    )

@api_router.post("/report/download", tags=["Reports"])
def download_current_report(assessment: AssessmentResponse):
    """
    Directly compiles and streams a PDF report from current assessment state.
    """
    pdf_bytes = generate_assessment_pdf(assessment)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=KrishiExplain_Report_{assessment.assessment_id}.pdf"
        }
    )
