# KrishiExplain AI — Explainable AI for Climate Change Impact Assessment on Agriculture

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com)
[![SHAP](https://img.shields.io/badge/SHAP-0.44+-FF6F00.svg)](https://shap.readthedocs.io)
[![XGBoost](https://img.shields.io/badge/XGBoost-2.0+-EB5424.svg)](https://xgboost.readthedocs.io)

> **"Climate Insights. Explainable AI. Resilient Agriculture."**

KrishiExplain AI is a modern, hackathon-ready agricultural intelligence platform engineered to move beyond black-box crop yield predictions. By coupling temporal machine learning with **SHAP (Shapley Additive Explanations)**, the system quantifies *and explains* how temperature regimes, terminal heatwave events, and precipitation anomalies influence Rabi wheat productivity across Punjab, India.

---

## 🌾 The Core Journey

```
Climate Data (NASA POWER) + Yield Statistics (DES/APY public mirror)
      ↓
Temporal Machine Learning (XGBoost / Random Forest Regressor)
      ↓
Explainable AI (SHAP TreeExplainer Local Attribution)
      ↓
Agro-Climatic Risk Indicators (Heat Stress, Moisture Anomaly, Tillering Penalty)
      ↓
Evidence-Based Adaptation Actions (PAU & ICAR-IIWBR Technical Guidelines)
      ↓
Official PDF Assessment Report
```

---

## 🚀 Key Features

1. **Interactive Climate Dashboard**:
   - Historical climate and yield observations for 22 Punjab districts, 1997–2014.
   - Dual-axis temperature trends, cumulative rainfall patterns, yield trajectories, and moisture balances.
   - Historical series use collected observations only; no generated history is presented as observed.

2. **Crop Impact Assessment**:
   - Six climate inputs engineered from NASA POWER daily observations.
   - Yield prediction in tonnes per hectare (t/ha), compared with the train-plus-validation mean.
   - One-click **"Load Demo Scenario"** simulating an early March terminal heatwave shock.

3. **Explainable AI (SHAP TreeExplainer)**:
   - **Global Feature Importance**: Horizontal bar chart of mean absolute SHAP values across held-out test observations.
   - **Individual Prediction Waterfall Chart**: Recharts-powered additive bridge showing step-by-step contributions from model baseline to the final prediction.
   - **Positive & Negative Attributions**: Favorable contributions in Forest Green (+ t/ha), adverse pressures in Restrained Red (- t/ha).
   - **Automated Natural Language Synthesis**: Plain-language explanation generated directly from calculated SHAP values.
   - **Clear Causality Boundary**: Explicitly distinguishes model feature attribution from verified physical biological causation.

4. **Climate What-If Simulator**:
   - Interactive sliders for temperature perturbations (-2.0°C to +6.0°C) and rainfall shifts (-50% to +60%).
   - Presets: *Baseline*, *Warmer (+2.0°C)*, *Reduced Rainfall (-25%)*, *Combined Heat & Drought (+3.0°C, -30%)*, *Extreme Heat Shock (+4.5°C, -40%)*.
   - Instant before-and-after yield comparison from the selected trained model, actual SHAP attribution changes, and warnings for inputs outside training ranges.

5. **From Insight to Action (Adaptation Framework)**:
   - Rule-based agronomic recommendations mapped directly to identified vulnerability factors (early sowing with DBW-187/PBW-824, tensiometer irrigation, Happy Seeder mulching, sprinkler evaporative cooling).
   - Clear documentation of favorable conditions, practical limitations, and citations from Punjab Agricultural University (PAU) and ICAR-IIWBR.

6. **Official PDF Report Generator**:
   - One-click compilation using Python's `reportlab` library streaming a publication-grade PDF containing assessment summary, parameters, SHAP tables, risk scores, adaptation strategies, data provenance, and scientific disclaimers.

---

## 🎨 Design System Palette

- **Forest Green**: `#174D38` (Primary brand color)
- **Deep Green**: `#103C2C` (Headings and emphasis)
- **Sage**: `#A8C3A0` (Accents and borders)
- **Pale Mint**: `#E8F1E8` (Card backgrounds and badges)
- **Warm Cream**: `#F8F7F0` (Application surface background)
- **White**: `#FFFFFF` (Card surfaces)
- **Charcoal**: `#26332C` (Primary typography)
- **Muted Gray**: `#78847B` (Subtitles and secondary text)
- **Restrained Amber**: `#D97706` (Moderate risk & demo badges)
- **Restrained Red**: `#DC2626` (Critical stress & adverse attributions)

---

## 🏗️ Architecture & Project Structure

```
krishiexplain-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entrypoint, CORS & lifespans
│   │   ├── core/
│   │   │   └── config.py               # Application configuration & artifact paths
│   │   ├── schemas/
│   │   │   └── models.py               # Pydantic schemas (ClimateInput, Assessment, etc.)
│   │   ├── ml/
│   │   │   ├── train.py                # Observed-data temporal training (XGBoost vs Random Forest)
│   │   │   ├── predictor.py            # Model inference engine & demo fallback
│   │   │   └── artifacts/              # Saved model, metadata.json, background samples
│   │   ├── explainability/
│   │   │   └── shap_explainer.py       # SHAP TreeExplainer & NL summary generator
│   │   ├── services/
│   │   │   ├── assessment_service.py   # Assessment orchestrator & risk calculator
│   │   │   ├── simulation_service.py   # Scenario comparison & extrapolation checker
│   │   │   └── climate_service.py      # Historical time series & KPI analytics
│   │   ├── data/
│   │   │   ├── loader.py               # Observed-data loader (no generated fallback)
│   │   │   └── raw/                    # Collected Punjab wheat observations (1997-2014)
│   │   └── reports/
│   │       └── pdf_generator.py        # ReportLab PDF report generator
│   ├── tests/
│   │   └── test_api.py                 # Pytest suite (8 endpoints, 100% pass)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar, Footer, DemoBadge, ShapWaterfallChart...
│   │   ├── context/                    # AppContext for state and mode management
│   │   ├── pages/                      # Home, Dashboard, Assessment, ExplainableAI, Simulator...
│   │   ├── services/                   # Frontend API client
│   │   ├── types/                      # TypeScript definitions
│   │   └── index.css                   # Tailwind CSS styling & custom scrollbars
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── data/
│   └── README.md                       # Data provenance documentation
├── models/
│   └── README.md                       # Evaluation results, selection, and SHAP documentation
├── README.md
├── .gitignore
└── .env.example
```

---

## 💻 Quick Start & Execution Instructions

### Prerequisites
- Python 3.10+ (Python 3.14 verified)
- Node.js v18+ and npm v9+

### 1. Backend Setup & Run

Open a terminal in the project directory:

```bash
# Navigate to backend
cd backend

# (Optional) Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Collect source observations only if the merged data/cache is absent or needs refresh
python -m app.data.collect_real_data

# Train both candidates, compare evaluation metrics, and save model/SHAP artifacts
python -m app.ml.train

# Run backend tests
pytest tests/

# Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be active at:
- **API Base**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **Health Check**: `http://127.0.0.1:8000/health`

---

### 2. Frontend Setup & Run

In a separate terminal:

```bash
# Navigate to frontend
cd frontend

# Install npm dependencies
npm install

# Run frontend tests
npm run test

# Launch Vite development server
npm run dev
```

Frontend will be accessible at:
- **Application URL**: `http://localhost:5173`

---

## ⚙️ Switching Between Demo Mode and Real-Model Mode

When the trained artifacts are loaded and `DEMO_MODE=false`, impact assessments and climate scenarios use the selected Random Forest model and local TreeExplainer SHAP values. The UI displays an observed-data model badge. The current model has weak out-of-time R²; see the evaluation table and treat results as experimental, not as validated agronomic advice.

When `DEMO_MODE=true` or the artifacts are unavailable, prediction responses are explicitly marked `DEMO DATA (SIMULATED)`. Demo predictions have no local SHAP explanation; the API returns no contribution values or baseline for them. If global importance is shown, it is calculated from the trained model and does not explain the demo prediction. The real historical dashboard is not switched to synthetic data.

To switch mode:
- **In UI**: Click the badge in the navigation bar to toggle modes dynamically.
- **In Configuration**: Edit `.env` or set `DEMO_MODE=true` / `DEMO_MODE=false`.

---

## 📊 Data Sources & Provenance

1. **Punjab crop area, production, and yield:** wheat Rabi records from a [public APY CSV mirror](https://raw.githubusercontent.com/dibyendubiswas1998/Crop-Production-Analysis/main/DATA/crop_production.csv), with the [DES Agri portal](https://desagri.gov.in/) as the official statistics reference. The file used is a mirror, not a direct DES API download.
2. **NASA POWER:** Daily Agroclimatology point data from [NASA POWER](https://power.larc.nasa.gov/) at 22 district-headquarters coordinates; seasonal features cover crop years 1997–2014.
3. **IMD:** Not used in the current training dataset or historical dashboard.

See [`data/README.md`](data/README.md) for variable definitions, cleaning, coverage, and limitations; see [`models/README.md`](models/README.md) for the actual train/validation/test metrics and selected model.

---

## ⚖️ Limitations & Ethical Considerations

- **Attribution vs. Causality**: SHAP values reflect the mathematical feature attributions of the tree ensemble. They represent statistical associations and do not prove biological cause-and-effect.
- **Evaluation limitation**: Only 18 crop years are available, with 44 records in the two-year held-out test. The selected Random Forest has test R² -0.0586 and validation R² -1.5323; meaningful deployment requires more recent observations and stronger independent temporal validation.
- **Spatial limitation**: NASA POWER inputs are point estimates at district headquarters, not district-area climate averages.
- **Unmodelled Confounders**: Unforeseen hail storms, localized pest attacks (e.g. pink stem borer), and micro-scale soil chemistry variations are outside the feature schema.
- **Advisory Status**: Adaptation suggestions are rule-based agronomic guidelines and should always be confirmed with local State Agricultural Extension Officers.

---

## 🏆 Hackathon Credits
Developed for live hackathon demonstration with technical transparency, verified machine learning, and explainable AI.
