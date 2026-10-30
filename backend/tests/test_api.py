import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data

def test_metadata():
    response = client.get("/api/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "Wheat (Rabi)" in data["supported_crops"]
    assert "Punjab" in data["supported_states"]
    assert len(data["supported_features"]) == 6

def test_climate_series():
    response = client.get("/api/climate?district=Ludhiana&start_year=2000&end_year=2014")
    assert response.status_code == 200
    data = response.json()
    assert "series" in data
    assert len(data["series"]) > 0
    assert "kpis" in data
    assert data["is_demo"] is False
    assert data["kpis"]["years_covered"] == "2000 - 2014"
    assert data["series"][-1]["year"] == 2014

def test_assess_impact_real_model():
    payload = {
        "country": "India",
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "Wheat (Rabi)",
        "growing_season": "Rabi (Nov - Apr)",
        "assessment_year": 2024,
        "irrigation_type": "Canal & Tubewell (Assured)",
        "avg_temperature": 18.2,
        "max_temperature": 32.5,
        "rainfall_mm": 65.0,
        "humidity_pct": 52.0,
        "soil_moisture_pct": 38.0,
        "heat_wave_days": 8
    }
    response = client.post("/api/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_demo"] is False
    assert "assessment_id" in data
    assert data["prediction"]["predicted_yield"] > 0
    assert len(data["key_contributors"]) == 7
    assert data["base_value"] + sum(
        contributor["shap_value"] for contributor in data["key_contributors"]
    ) == pytest.approx(data["prediction"]["predicted_yield"], abs=0.001)
    assert len(data["risk_assessment"]) == 4
    assert len(data["adaptation_insights"]) > 0
    assert "disclaimer" in data["scientific_disclaimer"].lower()

def test_assess_impact_demo_mode():
    payload = {
        "country": "India",
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "Wheat (Rabi)",
        "growing_season": "Rabi (Nov - Apr)",
        "assessment_year": 2024,
        "irrigation_type": "Canal & Tubewell (Assured)",
        "avg_temperature": 17.5,
        "max_temperature": 28.0,
        "rainfall_mm": 95.0,
        "humidity_pct": 55.0,
        "soil_moisture_pct": 42.0,
        "heat_wave_days": 2
    }
    response = client.post("/api/assess?force_demo=true", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_demo"] is True
    assert data["demo_warning"] is not None
    assert data["key_contributors"] == []
    assert data["base_value"] is None
    assert "factor details are unavailable" in data["demo_warning"].lower()

def test_explain_endpoint():
    response = client.post("/api/explain")
    assert response.status_code == 200
    data = response.json()
    assert len(data["global_importances"]) == 7
    assert len(data["sample_individual_contributions"]) == 7
    assert "base_value" in data

def test_explain_demo_has_no_local_shap_values():
    response = client.post("/api/explain?force_demo=true")
    assert response.status_code == 200
    data = response.json()
    assert data["is_demo"] is True
    assert data["base_value"] is None
    assert data["sample_individual_contributions"] == []
    assert "individual factor details are unavailable" in data["demo_warning"].lower()

def test_simulate_endpoint():
    payload = {
        "baseline_input": {
            "country": "India",
            "state": "Punjab",
            "district": "Ludhiana",
            "crop": "Wheat (Rabi)",
            "growing_season": "Rabi (Nov - Apr)",
            "assessment_year": 2024,
            "irrigation_type": "Canal & Tubewell (Assured)",
            "avg_temperature": 17.5,
            "max_temperature": 28.5,
            "rainfall_mm": 95.0,
            "humidity_pct": 55.0,
            "soil_moisture_pct": 42.0,
            "heat_wave_days": 3
        },
        "delta_temperature": 2.5,
        "delta_rainfall_pct": -25.0,
        "delta_heat_wave_days": 6,
        "scenario_name": "Warmer and Drier (+2.5°C, -25% Rain)"
    }
    response = client.post("/api/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "scenario_prediction" in data
    assert "absolute_difference" in data
    assert len(data["feature_contribution_changes"]) == 7

def test_simulate_demo_has_no_shap_deltas():
    payload = {
        "baseline_input": {
            "district": "Ludhiana",
            "avg_temperature": 17.5,
            "max_temperature": 28.5,
            "rainfall_mm": 95.0,
            "humidity_pct": 55.0,
            "soil_moisture_pct": 42.0,
            "heat_wave_days": 3
        },
        "delta_temperature": 2.5,
        "delta_rainfall_pct": -25.0,
        "delta_heat_wave_days": 6,
        "scenario_name": "Demo scenario"
    }
    response = client.post("/api/simulate?force_demo=true", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_demo"] is True
    assert data["feature_contribution_changes"] == []
    assert "no individual factor explanation" in data["explanation"]

def test_report_pdf_generation():
    # Run an assessment first
    payload = {
        "country": "India",
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "Wheat (Rabi)",
        "growing_season": "Rabi (Nov - Apr)",
        "assessment_year": 2024,
        "irrigation_type": "Canal & Tubewell (Assured)",
        "avg_temperature": 18.0,
        "max_temperature": 31.0,
        "rainfall_mm": 85.0,
        "humidity_pct": 50.0,
        "soil_moisture_pct": 40.0,
        "heat_wave_days": 5
    }
    assess_res = client.post("/api/assess", json=payload)
    assess_data = assess_res.json()
    assessment_id = assess_data["assessment_id"]

    # Export by ID
    report_res = client.get(f"/api/report/{assessment_id}")
    assert report_res.status_code == 200
    assert report_res.headers["content-type"] == "application/pdf"
    assert len(report_res.content) > 1000  # valid PDF binary

    # Download by POST payload
    download_res = client.post("/api/report/download", json=assess_data)
    assert download_res.status_code == 200
    assert download_res.headers["content-type"] == "application/pdf"
