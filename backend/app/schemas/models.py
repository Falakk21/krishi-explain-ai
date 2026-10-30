from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ClimateInput(BaseModel):
    country: str = Field(default="India", description="Country name")
    state: str = Field(default="Punjab", description="State name")
    district: str = Field(default="Ludhiana", description="District name")
    crop: str = Field(default="Wheat (Rabi)", description="Crop name and season")
    growing_season: str = Field(default="Rabi (Nov - Apr)", description="Growing season")
    assessment_year: int = Field(default=2024, ge=1990, le=2050, description="Assessment year")
    irrigation_type: str = Field(default="Canal & Tubewell (Assured)", description="Irrigation availability")
    
    # Climate Features with scientifically grounded ranges for Punjab Rabi wheat
    avg_temperature: float = Field(
        ..., ge=12.0, le=32.0,
        description="Average growing season temperature in Celsius (°C). Normal Punjab Rabi: 16-20°C"
    )
    max_temperature: float = Field(
        ..., ge=20.0, le=42.0,
        description="Peak / terminal grain-filling temperature in Celsius (°C). Critical threshold > 31°C"
    )
    rainfall_mm: float = Field(
        ..., ge=10.0, le=350.0,
        description="Cumulative Rabi season rainfall in millimeters (mm). Normal Punjab Rabi: 80-140 mm"
    )
    humidity_pct: float = Field(
        ..., ge=20.0, le=95.0,
        description="Average relative humidity percentage (%) during growing period"
    )
    soil_moisture_pct: float = Field(
        ..., ge=15.0, le=75.0,
        description="Average root-zone soil moisture percentage (%)"
    )
    heat_wave_days: int = Field(
        default=5, ge=0, le=59,
        description="Number of days where daily max temp exceeded 31°C during grain filling (Feb/Mar)"
    )

class FeatureContribution(BaseModel):
    feature: str
    feature_label: str
    observed_value: float | str
    unit: str
    shap_value: float
    direction: str  # 'positive' (improves yield) or 'negative' (reduces yield)
    impact_magnitude: str  # 'low', 'medium', 'high'
    interpretation: str

class RiskIndicator(BaseModel):
    category: str  # 'Temperature Risk', 'Precipitation Risk', 'Moisture Stress', 'Terminal Heat'
    level: str  # 'Low', 'Moderate', 'High', 'Critical'
    score: float  # 0 to 100
    description: str
    threshold_info: str

class AdaptationStrategy(BaseModel):
    risk_factor: str
    strategy_title: str
    action_summary: str
    why_relevant: str
    favorable_conditions: str
    practical_limitations: str
    credible_source: str
    is_rule_based: bool = True

class PredictionSummary(BaseModel):
    predicted_yield: float  # in tonnes/ha
    yield_unit: str = "tonnes/hectare (t/ha)"
    baseline_yield: float  # historical regional mean
    yield_change_pct: float  # difference from regional baseline
    prediction_period: str
    crop: str
    region: str
    is_demo: bool
    model_name: str
    model_version: str
    r2_score: Optional[float] = None
    mae: Optional[float] = None

class AssessmentResponse(BaseModel):
    assessment_id: str
    timestamp: str
    is_demo: bool
    demo_warning: Optional[str] = None
    input_summary: ClimateInput
    prediction: PredictionSummary
    risk_assessment: List[RiskIndicator]
    key_contributors: List[FeatureContribution]
    base_value: Optional[float] = None
    plain_language_explanation: str
    adaptation_insights: List[AdaptationStrategy]
    scientific_disclaimer: str

class GlobalFeatureImportance(BaseModel):
    feature: str
    feature_label: str
    mean_abs_shap: float
    unit: str
    description: str

class ExplanationResponse(BaseModel):
    is_demo: bool
    demo_warning: Optional[str] = None
    model_status: str
    base_value: Optional[float] = None
    units: str
    global_importances: List[GlobalFeatureImportance]
    sample_individual_contributions: List[FeatureContribution]
    plain_language_summary: str
    methodology_note: str

class ScenarioInput(BaseModel):
    baseline_input: ClimateInput
    delta_temperature: float = Field(..., ge=-5.0, le=8.0, description="Temperature change in °C")
    delta_rainfall_pct: float = Field(..., ge=-75.0, le=100.0, description="Rainfall change percentage (%)")
    delta_heat_wave_days: int = Field(default=0, ge=-10, le=25, description="Change in terminal heat days")
    scenario_name: str = "Custom Climate Scenario"

class SimulationResult(BaseModel):
    scenario_name: str
    is_demo: bool
    baseline_prediction: float  # t/ha
    scenario_prediction: float  # t/ha
    absolute_difference: float  # t/ha
    percentage_difference: float  # %
    yield_unit: str = "t/ha"
    baseline_conditions: Dict[str, Any]
    scenario_conditions: Dict[str, Any]
    feature_contribution_changes: List[Dict[str, Any]]
    explanation: str
    risk_shift: str
    is_extrapolation_warning: bool = False
    extrapolation_note: Optional[str] = None

class ClimateTrendDataPoint(BaseModel):
    year: int
    avg_temp: float
    max_temp: float
    rainfall_mm: float
    humidity_pct: float
    observed_yield: Optional[float] = None
    district: str

class MetadataResponse(BaseModel):
    supported_crops: List[str]
    supported_countries: List[str]
    supported_states: List[str]
    supported_districts: List[str]
    supported_features: List[Dict[str, Any]]
    model_metadata: Dict[str, Any]
    demo_mode: bool
