export interface ClimateInput {
  country: string;
  state: string;
  district: string;
  crop: string;
  growing_season: string;
  assessment_year: number;
  irrigation_type: string;
  avg_temperature: number;
  max_temperature: number;
  rainfall_mm: number;
  humidity_pct: number;
  soil_moisture_pct: number;
  heat_wave_days: number;
}

export interface FeatureContribution {
  feature: string;
  feature_label: string;
  observed_value: number | string;
  unit: string;
  shap_value: number;
  direction: 'positive' | 'negative';
  impact_magnitude: 'low' | 'medium' | 'high';
  interpretation: string;
}

export interface RiskIndicator {
  category: string;
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  score: number;
  description: string;
  threshold_info: string;
}

export interface AdaptationStrategy {
  risk_factor: string;
  strategy_title: string;
  action_summary: string;
  why_relevant: string;
  favorable_conditions: string;
  practical_limitations: string;
  credible_source: string;
  is_rule_based: boolean;
}

export interface PredictionSummary {
  predicted_yield: number;
  yield_unit: string;
  baseline_yield: number;
  yield_change_pct: number;
  prediction_period: string;
  crop: string;
  region: string;
  is_demo: boolean;
  model_name: string;
  model_version: string;
  r2_score?: number;
  mae?: number;
}

export interface AssessmentResponse {
  assessment_id: string;
  timestamp: string;
  is_demo: boolean;
  demo_warning?: string;
  input_summary: ClimateInput;
  prediction: PredictionSummary;
  risk_assessment: RiskIndicator[];
  key_contributors: FeatureContribution[];
  base_value: number | null;
  plain_language_explanation: string;
  adaptation_insights: AdaptationStrategy[];
  scientific_disclaimer: string;
}

export interface GlobalFeatureImportance {
  feature: string;
  feature_label: string;
  mean_abs_shap: number;
  unit: string;
  description: string;
}

export interface ExplanationResponse {
  is_demo: boolean;
  demo_warning?: string;
  model_status: string;
  base_value: number | null;
  units: string;
  global_importances: GlobalFeatureImportance[];
  sample_individual_contributions: FeatureContribution[];
  plain_language_summary: string;
  methodology_note: string;
}

export interface ScenarioInput {
  baseline_input: ClimateInput;
  delta_temperature: number;
  delta_rainfall_pct: number;
  delta_heat_wave_days: number;
  scenario_name: string;
}

export interface SimulationResult {
  scenario_name: string;
  is_demo: boolean;
  baseline_prediction: number;
  scenario_prediction: number;
  absolute_difference: number;
  percentage_difference: number;
  yield_unit: string;
  baseline_conditions: Record<string, any>;
  scenario_conditions: Record<string, any>;
  feature_contribution_changes: Array<{
    feature: string;
    feature_label: string;
    unit: string;
    baseline_value: number | string;
    scenario_value: number | string;
    baseline_shap: number;
    scenario_shap: number;
    delta_shap: number;
    direction: 'positive' | 'negative';
  }>;
  explanation: string;
  risk_shift: string;
  is_extrapolation_warning: boolean;
  extrapolation_note?: string;
}

export interface ClimateSeriesResponse {
  kpis: {
    selected_crop: string;
    selected_region: string;
    historical_temp_trend: string;
    latest_observed_yield: string;
    historical_mean_yield: string;
    total_records: number;
    years_covered: string;
  };
  district: string;
  is_demo: boolean;
  data_source: string;
  series: Array<{
    year: number;
    avg_temperature: number;
    max_temperature: number;
    rainfall_mm: number;
    humidity_pct: number;
    soil_moisture_pct: number;
    heat_wave_days: number;
    yield_tonnes_per_hectare?: number;
    district: string;
  }>;
}

export interface MetadataResponse {
  supported_crops: string[];
  supported_countries: string[];
  supported_states: string[];
  supported_districts: string[];
  supported_features: Array<{
    id: string;
    name: string;
    unit: string;
    min: number;
    max: number;
    default: number;
    desc: string;
  }>;
  model_metadata: Record<string, any>;
  demo_mode: boolean;
}

export interface SystemHealth {
  status: string;
  service: string;
  version: string;
  demo_mode: boolean;
  model_loaded: boolean;
  model_name: string;
  shap_available: boolean;
}
