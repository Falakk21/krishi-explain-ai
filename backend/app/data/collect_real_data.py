"""
KrishiExplain AI - Real Data Collection Pipeline
=================================================
Phase 1: Download genuine district-level Punjab wheat yield data (DES/APY 1997-2014)
Phase 2: Fetch real NASA POWER daily climate data for each district's Rabi season
Phase 3: Aggregate daily climate → seasonal features, merge with yield
Phase 4: Save clean dataset for ML training

Data Sources:
  - Yield: Directorate of Economics & Statistics (DES), Ministry of Agriculture, India
           via publicly hosted APY dataset on GitHub (original Kaggle mirror)
  - Climate: NASA POWER (Prediction of Worldwide Energy Resources) API v2
           Parameters: T2M, T2M_MAX, PRECTOTCORR, RH2M, GWETROOT
"""

import json
import time
import urllib.request
import urllib.error
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime

# ─── Configuration ──────────────────────────────────────────────────────────

OUTPUT_DIR = Path(__file__).resolve().parent / "raw"
OUTPUT_CSV = OUTPUT_DIR / "punjab_wheat_real_data.csv"
INTERMEDIATE_DIR = OUTPUT_DIR / "_intermediate"

# DES APY dataset (publicly hosted mirror of official Govt of India data)
DES_APY_URL = (
    "https://raw.githubusercontent.com/dibyendubiswas1998/"
    "Crop-Production-Analysis/main/DATA/crop_production.csv"
)

# Punjab district headquarters coordinates (lat, lon) for NASA POWER queries
DISTRICT_COORDS = {
    "AMRITSAR":        (31.63, 74.87),
    "BARNALA":         (30.38, 75.55),
    "BATHINDA":        (30.21, 74.95),
    "FARIDKOT":        (30.68, 74.76),
    "FATEHGARH SAHIB": (30.64, 76.39),
    "FAZILKA":         (30.40, 74.03),
    "FIROZEPUR":       (30.93, 74.61),
    "GURDASPUR":       (32.04, 75.41),
    "HOSHIARPUR":      (31.53, 75.98),
    "JALANDHAR":       (31.33, 75.58),
    "KAPURTHALA":      (31.38, 75.38),
    "LUDHIANA":        (30.90, 75.85),
    "MANSA":           (29.98, 75.38),
    "MOGA":            (30.82, 75.17),
    "MUKTSAR":         (30.47, 74.52),
    "NAWANSHAHR":      (31.12, 76.12),
    "PATHANKOT":       (32.27, 75.65),
    "PATIALA":         (30.34, 76.38),
    "RUPNAGAR":        (30.97, 76.53),
    "S.A.S NAGAR":     (30.71, 76.72),
    "SANGRUR":         (30.25, 75.84),
    "TARN TARAN":      (31.45, 74.93),
}

# NASA POWER parameters
NASA_PARAMS = "T2M,T2M_MAX,PRECTOTCORR,RH2M,GWETROOT"

# Rabi wheat season definition
RABI_START_MONTH = 11   # November (sowing)
RABI_END_MONTH = 3      # March (grain filling / harvest begins)
# Terminal heat period: February-March (critical for grain filling)
TERMINAL_MONTHS = [2, 3]
HEAT_THRESHOLD = 31.0   # °C — agronomic terminal heat threshold


# ─── Phase 1: Download DES Yield Data ──────────────────────────────────────

def download_des_yield_data() -> pd.DataFrame:
    """
    Download official DES Area-Production-Yield data for Punjab Wheat.
    Source: DES, Ministry of Agriculture & Farmers Welfare, India
    """
    print("=" * 70)
    print("PHASE 1: Downloading DES Punjab Wheat Yield Data")
    print("=" * 70)
    print(f"Source: {DES_APY_URL}")

    df = pd.read_csv(DES_APY_URL)
    print(f"  Total APY records downloaded: {len(df):,}")

    # Filter to Punjab Rabi wheat; the source includes a Season column.
    mask = (
        (df["State_Name"].str.strip().str.upper() == "PUNJAB")
        & (df["Crop"].str.strip().str.lower() == "wheat")
        & (df["Season"].str.strip().str.lower() == "rabi")
    )
    pb = df[mask].copy()
    print(f"  Punjab Wheat records: {len(pb)}")

    # Standardize district names
    pb["District_Name"] = pb["District_Name"].str.strip().str.upper()

    # Drop rows with missing Area or Production
    pb = pb.dropna(subset=["Area", "Production"])
    pb = pb[(pb["Area"] > 0) & (pb["Production"] > 0)]

    # Compute yield in tonnes per hectare
    # DES format: Area in hectares, Production in tonnes
    pb["yield_tonnes_per_hectare"] = pb["Production"] / pb["Area"]

    # Sanity check: Punjab wheat yield should be ~3-6 t/ha
    valid_mask = (pb["yield_tonnes_per_hectare"] >= 1.5) & (pb["yield_tonnes_per_hectare"] <= 8.0)
    outliers = pb[~valid_mask]
    if len(outliers) > 0:
        print(f"  WARNING: Removing {len(outliers)} rows with implausible yield values:")
        for _, row in outliers.iterrows():
            print(f"    {row['District_Name']} {row['Crop_Year']}: {row['yield_tonnes_per_hectare']:.2f} t/ha")
    pb = pb[valid_mask].copy()

    # Keep only districts we have coordinates for
    known_districts = set(DISTRICT_COORDS.keys())
    pb = pb[pb["District_Name"].isin(known_districts)].copy()

    print(f"  Final yield records: {len(pb)}")
    print(f"  Year range: {pb['Crop_Year'].min()} - {pb['Crop_Year'].max()}")
    print(f"  Districts: {sorted(pb['District_Name'].unique())}")
    print(f"  Yield range: {pb['yield_tonnes_per_hectare'].min():.2f} - {pb['yield_tonnes_per_hectare'].max():.2f} t/ha")
    print(f"  Yield mean: {pb['yield_tonnes_per_hectare'].mean():.3f} t/ha")
    print(f"  Yield std:  {pb['yield_tonnes_per_hectare'].std():.3f} t/ha")

    return pb[["Crop_Year", "District_Name", "Area", "Production", "yield_tonnes_per_hectare"]].reset_index(drop=True)


# ─── Phase 2: Fetch NASA POWER Climate Data ───────────────────────────────

def fetch_nasa_power_daily(lat: float, lon: float, start_date: str, end_date: str,
                           max_retries: int = 3) -> dict:
    """
    Fetch daily climate data from NASA POWER API.
    Returns dict of parameter -> {date_str: value}
    """
    url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"parameters={NASA_PARAMS}"
        f"&community=AG"
        f"&longitude={lon}"
        f"&latitude={lat}"
        f"&start={start_date}"
        f"&end={end_date}"
        f"&format=JSON"
    )

    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "KrishiExplainAI/1.0"})
            with urllib.request.urlopen(req, timeout=60) as response:
                data = json.loads(response.read())
            return data["properties"]["parameter"]
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            print(f"    Attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                time.sleep(5 * (attempt + 1))
            else:
                raise


def aggregate_rabi_season(daily_data: dict, crop_year: int) -> dict:
    """
    Aggregate daily NASA POWER data into Rabi season features.

    Rabi crop_year convention (Indian agriculture):
      crop_year = harvest year
      Rabi 2005 → sowing Nov 2004, harvest Mar-Apr 2005
      Climate window: Nov (year-1) to March (year)
    """
    # Build list of dates in this Rabi season
    season_dates = []
    terminal_dates = []

    # November and December of previous year
    for month in [11, 12]:
        for day in range(1, 32):
            date_str = f"{crop_year - 1}{month:02d}{day:02d}"
            if date_str in daily_data.get("T2M", {}):
                season_dates.append(date_str)

    # January, February, March of crop year
    for month in [1, 2, 3]:
        for day in range(1, 32):
            date_str = f"{crop_year}{month:02d}{day:02d}"
            if date_str in daily_data.get("T2M", {}):
                season_dates.append(date_str)
                if month in TERMINAL_MONTHS:
                    terminal_dates.append(date_str)

    if len(season_dates) < 100:  # Expect ~151 days Nov-Mar
        return None  # Insufficient data

    # Extract daily values (filter out NASA POWER fill values: -999)
    def safe_values(param, dates):
        vals = []
        for d in dates:
            v = daily_data.get(param, {}).get(d)
            if v is not None and v > -900:
                vals.append(v)
        return vals

    t2m_vals = safe_values("T2M", season_dates)
    t2m_max_vals = safe_values("T2M_MAX", season_dates)
    precip_vals = safe_values("PRECTOTCORR", season_dates)
    rh2m_vals = safe_values("RH2M", season_dates)
    gwetroot_vals = safe_values("GWETROOT", season_dates)

    # Terminal period values
    t2m_max_terminal = safe_values("T2M_MAX", terminal_dates)

    if len(t2m_vals) < 80:
        return None

    # Compute seasonal aggregates
    features = {
        "avg_temperature": round(np.mean(t2m_vals), 2),
        "max_temperature": round(np.max(t2m_max_terminal) if t2m_max_terminal else np.max(t2m_max_vals), 2),
        "rainfall_mm": round(np.sum(precip_vals), 1),
        "humidity_pct": round(np.mean(rh2m_vals), 1),
        "soil_moisture_pct": round(np.mean(gwetroot_vals) * 100, 1) if gwetroot_vals else None,
        "heat_wave_days": sum(1 for v in t2m_max_terminal if v > HEAT_THRESHOLD),
        # Additional metadata
        "season_days": len(season_dates),
        "terminal_days": len(terminal_dates),
        "avg_terminal_max_temp": round(np.mean(t2m_max_terminal), 2) if t2m_max_terminal else None,
    }

    return features


def fetch_all_district_climate(yield_df: pd.DataFrame) -> pd.DataFrame:
    """
    Fetch NASA POWER climate data for all districts and crop years present in yield_df.
    """
    print("\n" + "=" * 70)
    print("PHASE 2: Fetching NASA POWER Climate Data")
    print("=" * 70)

    districts = yield_df["District_Name"].unique()
    crop_years = sorted(yield_df["Crop_Year"].unique())
    min_year = min(crop_years)
    max_year = max(crop_years)

    # We need Nov of (min_year - 1) to Mar of max_year
    start_date = f"{min_year - 1}1101"
    end_date = f"{max_year}0331"

    print(f"  Districts: {len(districts)}")
    print(f"  Crop years: {min_year} - {max_year}")
    print(f"  NASA POWER date range: {start_date} - {end_date}")
    print(f"  Parameters: {NASA_PARAMS}")
    print()

    # Check for cached intermediate results
    INTERMEDIATE_DIR.mkdir(parents=True, exist_ok=True)

    all_records = []
    for i, district in enumerate(sorted(districts)):
        lat, lon = DISTRICT_COORDS[district]
        cache_file = INTERMEDIATE_DIR / f"nasa_{district.replace(' ', '_')}_{start_date}_{end_date}.json"

        print(f"  [{i+1}/{len(districts)}] {district} (lat={lat}, lon={lon})...", end=" ", flush=True)

        # Check cache
        if cache_file.exists():
            with open(cache_file, "r") as f:
                daily_data = json.load(f)
            print("(cached)", end=" ")
        else:
            try:
                daily_data = fetch_nasa_power_daily(lat, lon, start_date, end_date)
                # Cache the raw daily data
                with open(cache_file, "w") as f:
                    json.dump(daily_data, f)
                print("(fetched)", end=" ")
                time.sleep(3)  # Rate limiting
            except Exception as e:
                print(f"FAILED: {e}")
                continue

        # Aggregate for each crop year
        district_records = 0
        for cy in crop_years:
            # Only process if we have yield data for this district-year
            has_yield = ((yield_df["District_Name"] == district) & (yield_df["Crop_Year"] == cy)).any()
            if not has_yield:
                continue

            features = aggregate_rabi_season(daily_data, cy)
            if features is not None:
                features["district"] = district
                features["crop_year"] = cy
                all_records.append(features)
                district_records += 1

        print(f"-> {district_records} seasons aggregated")

    climate_df = pd.DataFrame(all_records)
    print(f"\n  Total climate records: {len(climate_df)}")
    return climate_df


# ─── Phase 3: Merge and Clean ──────────────────────────────────────────────

def merge_and_clean(yield_df: pd.DataFrame, climate_df: pd.DataFrame) -> pd.DataFrame:
    """
    Merge yield and climate data, perform quality checks, save clean dataset.
    """
    print("\n" + "=" * 70)
    print("PHASE 3: Merging Yield + Climate Data")
    print("=" * 70)

    merged = yield_df.merge(
        climate_df,
        left_on=["Crop_Year", "District_Name"],
        right_on=["crop_year", "district"],
        how="inner"
    )

    print(f"  Yield records: {len(yield_df)}")
    print(f"  Climate records: {len(climate_df)}")
    print(f"  Merged records: {len(merged)}")

    # Check for missing values
    feature_cols = ["avg_temperature", "max_temperature", "rainfall_mm",
                    "humidity_pct", "soil_moisture_pct", "heat_wave_days"]
    missing = merged[feature_cols].isnull().sum()
    print(f"\n  Missing values per feature:")
    for col, count in missing.items():
        print(f"    {col}: {count}")

    # Drop rows with any missing features
    clean = merged.dropna(subset=feature_cols).copy()

    # Build final clean dataframe
    # Map district names to title case for the app
    district_name_map = {d: d.title() for d in DISTRICT_COORDS.keys()}
    # Special cases
    district_name_map["FIROZEPUR"] = "Firozpur"
    district_name_map["S.A.S NAGAR"] = "S.A.S Nagar"
    district_name_map["FATEHGARH SAHIB"] = "Fatehgarh Sahib"
    district_name_map["TARN TARAN"] = "Tarn Taran"

    final = pd.DataFrame({
        "year": clean["Crop_Year"].astype(int),
        "country": "India",
        "state": "Punjab",
        "district": clean["District_Name"].map(district_name_map),
        "crop": "Wheat",
        "season": "Rabi",
        "avg_temperature": clean["avg_temperature"].astype(float),
        "max_temperature": clean["max_temperature"].astype(float),
        "rainfall_mm": clean["rainfall_mm"].astype(float),
        "humidity_pct": clean["humidity_pct"].astype(float),
        "soil_moisture_pct": clean["soil_moisture_pct"].astype(float),
        "heat_wave_days": clean["heat_wave_days"].astype(int),
        "yield_tonnes_per_hectare": clean["yield_tonnes_per_hectare"].round(3),
        "area_hectares": clean["Area"].astype(float),
        "production_tonnes": clean["Production"].astype(float),
    })

    final = final.sort_values(["year", "district"]).reset_index(drop=True)

    print(f"\n  Final clean dataset: {len(final)} records")
    print(f"  Year range: {final['year'].min()} - {final['year'].max()}")
    print(f"  Districts: {final['district'].nunique()}")
    print(f"  Yield: {final['yield_tonnes_per_hectare'].mean():.3f} ± {final['yield_tonnes_per_hectare'].std():.3f} t/ha")

    print("\n  Feature Summary Statistics:")
    print(final[["avg_temperature", "max_temperature", "rainfall_mm",
                  "humidity_pct", "soil_moisture_pct", "heat_wave_days",
                  "yield_tonnes_per_hectare"]].describe().round(3).to_string())

    return final


# ─── Phase 4: Save ─────────────────────────────────────────────────────────

def save_dataset(df: pd.DataFrame):
    """Save the clean merged dataset."""
    print("\n" + "=" * 70)
    print("PHASE 4: Saving Clean Dataset")
    print("=" * 70)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"  Saved to: {OUTPUT_CSV}")
    print(f"  Records: {len(df)}")
    print(f"  File size: {OUTPUT_CSV.stat().st_size:,} bytes")

    # Save provenance metadata
    provenance = {
        "dataset_name": "Punjab Rabi Wheat - Real Climate + Yield Dataset",
        "created_at": datetime.now().isoformat(),
        "yield_source": {
            "name": "Directorate of Economics & Statistics (DES), Ministry of Agriculture, India",
            "url": "https://desagri.gov.in/",
            "mirror_url": DES_APY_URL,
            "variables": ["Area (hectares)", "Production (tonnes)", "Yield (t/ha)"],
            "coverage": "District-level, Punjab, India",
        },
        "climate_source": {
            "name": "NASA POWER (Prediction of Worldwide Energy Resources)",
            "url": "https://power.larc.nasa.gov/",
            "api_version": "v2",
            "community": "AG (Agroclimatology)",
            "parameters": {
                "T2M": "Temperature at 2 Meters (deg C) - daily mean",
                "T2M_MAX": "Temperature at 2 Meters Maximum (deg C) - daily max",
                "PRECTOTCORR": "Precipitation Corrected (mm/day) - total daily",
                "RH2M": "Relative Humidity at 2 Meters (%) - daily mean",
                "GWETROOT": "Root Zone Soil Wetness (fraction 0-1) - daily mean",
            },
            "spatial_resolution": "0.5° x 0.5° latitude/longitude grid",
        },
        "season_definition": {
            "crop": "Wheat (Triticum aestivum)",
            "season": "Rabi",
            "sowing_months": "November",
            "harvest_months": "March-April",
            "climate_window": "November (year-1) to March (year)",
            "terminal_heat_period": "February-March",
            "heat_threshold_celsius": HEAT_THRESHOLD,
        },
        "feature_engineering": {
            "avg_temperature": "Mean of daily T2M over Nov-Mar",
            "max_temperature": "Maximum of daily T2M_MAX during Feb-Mar (terminal period)",
            "rainfall_mm": "Sum of daily PRECTOTCORR over Nov-Mar",
            "humidity_pct": "Mean of daily RH2M over Nov-Mar",
            "soil_moisture_pct": "Mean of daily GWETROOT over Nov-Mar × 100",
            "heat_wave_days": "Count of days in Feb-Mar where T2M_MAX > 31°C",
        },
        "records": len(df),
        "year_range": f"{int(df['year'].min())} - {int(df['year'].max())}",
        "districts": sorted(df["district"].unique().tolist()),
        "district_count": int(df["district"].nunique()),
    }

    provenance_path = OUTPUT_DIR / "data_provenance.json"
    with open(provenance_path, "w") as f:
        json.dump(provenance, f, indent=2)
    print(f"  Provenance metadata saved to: {provenance_path}")


# ─── Main ──────────────────────────────────────────────────────────────────

def main():
    print("=" * 70)
    print("   KrishiExplain AI - Real Data Collection Pipeline")
    print("   Genuine DES Yield + NASA POWER Climate Data")
    print("=" * 70)
    print()

    # Phase 1: Download yield data
    yield_df = download_des_yield_data()

    # Phase 2: Fetch climate data
    climate_df = fetch_all_district_climate(yield_df)

    # Phase 3: Merge and clean
    final_df = merge_and_clean(yield_df, climate_df)

    # Phase 4: Save
    save_dataset(final_df)

    print("\n" + "=" * 70)
    print("DATA COLLECTION COMPLETE")
    print("=" * 70)
    print(f"  Dataset ready for ML training: {OUTPUT_CSV}")
    return final_df


if __name__ == "__main__":
    main()
