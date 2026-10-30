"""Train and compare tree regressors using the collected Punjab wheat records."""

import json
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
import shap
import xgboost as xgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from app.core.config import settings

FEATURE_COLUMNS = [
    "avg_temperature",
    "max_temperature",
    "rainfall_mm",
    "humidity_pct",
    "soil_moisture_pct",
    "heat_wave_days",
]
CATEGORICAL_COLUMNS = ["district"]
MODEL_COLUMNS = FEATURE_COLUMNS + CATEGORICAL_COLUMNS

FEATURE_LABELS = {
    "avg_temperature": "Average Temperature",
    "max_temperature": "Maximum Terminal-Period Temperature",
    "rainfall_mm": "Rabi Seasonal Rainfall",
    "humidity_pct": "Relative Humidity",
    "soil_moisture_pct": "Root-Zone Soil Moisture",
    "heat_wave_days": "Terminal Heat Days",
    "district": "District",
}

FEATURE_UNITS = {
    "avg_temperature": "deg C",
    "max_temperature": "deg C",
    "rainfall_mm": "mm",
    "humidity_pct": "%",
    "soil_moisture_pct": "%",
    "heat_wave_days": "days",
    "district": "",
}

TARGET = "yield_tonnes_per_hectare"
DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "raw" / "punjab_wheat_real_data.csv"


def load_real_data() -> tuple[pd.DataFrame, dict[str, int]]:
    """Load, validate, and summarize the observed DES/NASA POWER merge."""
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Observed dataset not found at {DATA_PATH}. "
            "Run `python -m app.data.collect_real_data` to collect it."
        )

    df = pd.read_csv(DATA_PATH)
    required = {
        "year",
        "state",
        "district",
        "crop",
        "season",
        TARGET,
        *MODEL_COLUMNS,
    }
    missing_columns = required.difference(df.columns)
    if missing_columns:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing_columns)}")

    counts = {"source_rows": len(df)}
    for column in ("state", "district", "crop", "season"):
        df[column] = df[column].astype("string").str.strip()

    df = df[
        df["state"].str.casefold().eq("punjab")
        & df["crop"].str.casefold().eq("wheat")
        & df["season"].str.casefold().eq("rabi")
    ].copy()
    counts["punjab_rabi_wheat_rows"] = len(df)

    numeric_columns = ["year", TARGET, *FEATURE_COLUMNS]
    for column in numeric_columns:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    complete_mask = np.isfinite(df[numeric_columns].to_numpy(dtype=float)).all(axis=1)
    counts["incomplete_or_non_numeric_rows_removed"] = int((~complete_mask).sum())
    df = df.loc[complete_mask].copy()

    before_duplicates = len(df)
    df = df.drop_duplicates(subset=["year", "district"], keep="first")
    counts["duplicate_district_year_rows_removed"] = before_duplicates - len(df)

    valid_mask = (
        df[TARGET].between(1.5, 8.0)
        & df["avg_temperature"].between(-20, 50)
        & df["max_temperature"].between(-20, 60)
        & df["rainfall_mm"].between(0, 2000)
        & df["humidity_pct"].between(0, 100)
        & df["soil_moisture_pct"].between(0, 100)
        & df["heat_wave_days"].between(0, 366)
    )
    counts["out_of_range_rows_removed"] = int((~valid_mask).sum())
    df = df.loc[valid_mask].copy()
    df["year"] = df["year"].astype(int)
    df["district"] = df["district"].astype(str)
    df = df.sort_values(["year", "district"]).reset_index(drop=True)

    if df.empty:
        raise ValueError("No valid Punjab Rabi wheat observations remain after cleaning.")
    if df["year"].nunique() < 5:
        raise ValueError("At least five distinct crop years are required for temporal evaluation.")

    print("\n--- Data quality and coverage ---")
    for name, count in counts.items():
        print(f"  {name}: {count}")
    print(
        f"  retained rows: {len(df)}; years: {df['year'].min()}-{df['year'].max()}; "
        f"districts: {df['district'].nunique()}"
    )
    print("\n--- Exploratory summary (cleaned observations) ---")
    print(df[FEATURE_COLUMNS + [TARGET]].describe().round(3).to_string())
    print("\n--- Annual observation counts ---")
    print(df.groupby("year").size().to_string())
    return df, counts


def temporal_train_validation_test_split(
    df: pd.DataFrame,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Keep complete years together: train through 2010, validate 2011-12, test 2013+."""
    train = df[df["year"] <= 2010].copy()
    validation = df[df["year"].between(2011, 2012)].copy()
    test = df[df["year"] >= 2013].copy()

    if train.empty or validation.empty or test.empty:
        raise ValueError(
            "Temporal split requires records through 2010, both 2011-2012 validation "
            "years, and at least one test year from 2013 onward."
        )
    if train["year"].max() >= validation["year"].min() or validation["year"].max() >= test["year"].min():
        raise ValueError("Temporal split overlaps; refusing to train with possible year leakage.")

    print("\n--- Leakage-safe temporal split ---")
    for label, subset in (("train", train), ("validation", validation), ("test", test)):
        print(
            f"  {label}: {subset['year'].min()}-{subset['year'].max()} "
            f"({len(subset)} rows, {subset['year'].nunique()} years)"
        )
    return train, validation, test


def make_pipeline(regressor: Any) -> Pipeline:
    """Bundle train-fitted numeric imputation and district one-hot encoding."""
    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", SimpleImputer(strategy="median", keep_empty_features=True), FEATURE_COLUMNS),
            (
                "district",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                    ]
                ),
                CATEGORICAL_COLUMNS,
            ),
        ],
        verbose_feature_names_out=False,
    )
    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("regressor", regressor),
        ]
    )


def evaluate_model(model: Pipeline, features: pd.DataFrame, target: pd.Series) -> dict[str, float]:
    predictions = model.predict(features)
    return {
        "mae": float(mean_absolute_error(target, predictions)),
        "rmse": float(np.sqrt(mean_squared_error(target, predictions))),
        "r2": float(r2_score(target, predictions)),
    }


def _rounded_metrics(metrics: dict[str, float]) -> dict[str, float]:
    return {name: round(value, 4) for name, value in metrics.items()}


def _base_value(explainer: shap.TreeExplainer) -> float:
    return float(np.asarray(explainer.expected_value).reshape(-1)[0])


def train_and_export_model() -> dict[str, Any]:
    df, cleaning_counts = load_real_data()
    train, validation, test = temporal_train_validation_test_split(df)
    X_train, y_train = train[MODEL_COLUMNS], train[TARGET]
    X_validation, y_validation = validation[MODEL_COLUMNS], validation[TARGET]
    X_test, y_test = test[MODEL_COLUMNS], test[TARGET]

    candidates: dict[str, Pipeline] = {
        "Random Forest Regressor": make_pipeline(
            RandomForestRegressor(
                n_estimators=300,
                max_depth=6,
                min_samples_split=5,
                min_samples_leaf=3,
                max_features=0.8,
                random_state=42,
                n_jobs=-1,
            )
        ),
        "XGBoost Regressor": make_pipeline(
            xgb.XGBRegressor(
                n_estimators=200,
                max_depth=3,
                learning_rate=0.04,
                subsample=0.8,
                colsample_bytree=0.8,
                min_child_weight=5,
                reg_alpha=0.1,
                reg_lambda=1.0,
                objective="reg:squarederror",
                random_state=42,
                n_jobs=1,
            )
        ),
    }

    print("\n--- Candidate evaluation on validation years (selection set) ---")
    validation_metrics: dict[str, dict[str, float]] = {}
    for name, model in candidates.items():
        model.fit(X_train, y_train)
        validation_metrics[name] = evaluate_model(model, X_validation, y_validation)
        print(f"  {name}: {_rounded_metrics(validation_metrics[name])}")

    selected_name = min(
        candidates,
        key=lambda name: (
            validation_metrics[name]["mae"],
            validation_metrics[name]["rmse"],
        ),
    )

    train_validation = pd.concat([train, validation], ignore_index=True)
    X_train_validation = train_validation[MODEL_COLUMNS]
    y_train_validation = train_validation[TARGET]

    print("\n--- Final held-out test evaluation (2013 onward) ---")
    test_metrics: dict[str, dict[str, float]] = {}
    for name, model in candidates.items():
        model.fit(X_train_validation, y_train_validation)
        test_metrics[name] = evaluate_model(model, X_test, y_test)
        print(f"  {name}: {_rounded_metrics(test_metrics[name])}")

    selected_model = candidates[selected_name]
    print(f"\nSelected using validation MAE (then RMSE): {selected_name}")

    selected_estimator = selected_model.named_steps["regressor"]
    preprocessor = selected_model.named_steps["preprocessor"]
    transformed_names = list(preprocessor.get_feature_names_out())
    transformed_groups = [
        name if name in FEATURE_COLUMNS else "district"
        for name in transformed_names
    ]
    X_test_processed = pd.DataFrame(
        preprocessor.transform(X_test),
        columns=transformed_names,
        index=X_test.index,
    )
    explainer = shap.TreeExplainer(selected_estimator)
    shap_values = np.asarray(explainer.shap_values(X_test_processed))
    if shap_values.shape != (len(X_test), len(transformed_names)):
        raise ValueError(f"Unexpected SHAP output shape: {shap_values.shape}")

    base_value = _base_value(explainer)
    predictions = selected_model.predict(X_test)
    reconstruction = base_value + shap_values.sum(axis=1)
    max_additivity_error = float(np.max(np.abs(reconstruction - predictions)))
    if not np.allclose(reconstruction, predictions, rtol=1e-4, atol=1e-4):
        raise ValueError(
            "TreeExplainer values do not reconstruct held-out predictions "
            f"(maximum error {max_additivity_error:.6f})."
        )

    grouped_shap = np.zeros((len(X_test), len(MODEL_COLUMNS)), dtype=float)
    for column_index, group in enumerate(transformed_groups):
        grouped_shap[:, MODEL_COLUMNS.index(group)] += shap_values[:, column_index]
    mean_abs_shap = np.abs(grouped_shap).mean(axis=0)
    global_importances = [
        {
            "feature": feature,
            "feature_label": FEATURE_LABELS[feature],
            "mean_abs_shap": round(float(score), 6),
            "unit": FEATURE_UNITS[feature],
            "description": (
                "Mean absolute TreeExplainer SHAP value on the held-out test observations."
            ),
        }
        for feature, score in zip(MODEL_COLUMNS, mean_abs_shap)
    ]
    global_importances.sort(key=lambda item: item["mean_abs_shap"], reverse=True)

    feature_ranges: dict[str, dict[str, float]] = {}
    for feature in FEATURE_COLUMNS:
        values = X_train_validation[feature]
        feature_ranges[feature] = {
            "min": round(float(values.min()), 4),
            "max": round(float(values.max()), 4),
            "p05": round(float(values.quantile(0.05)), 4),
            "p95": round(float(values.quantile(0.95)), 4),
        }

    artifacts_dir = settings.ARTIFACTS_DIR
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    model_path = artifacts_dir / "wheat_model.joblib"
    preprocessor_path = artifacts_dir / "preprocessor.joblib"
    background_path = artifacts_dir / "background_sample.joblib"
    metadata_path = settings.METADATA_PATH

    joblib.dump(selected_model, model_path)
    joblib.dump(preprocessor, preprocessor_path)
    joblib.dump(X_train_validation.sample(min(100, len(X_train_validation)), random_state=42), background_path)

    comparison = {
        name: {
            "validation": _rounded_metrics(validation_metrics[name]),
            "test": _rounded_metrics(test_metrics[name]),
        }
        for name in candidates
    }
    metadata = {
        "model_name": selected_name,
        "model_type": "Tree Ensemble Regressor",
        "target_variable": TARGET,
        "target_unit": "t/ha",
        "crop": "Wheat (Triticum aestivum)",
        "region": "Punjab, India",
        "growing_season": "Rabi (November-March climate window)",
        "dataset": {
            "file": DATA_PATH.name,
            "records": len(df),
            "year_range": [int(df["year"].min()), int(df["year"].max())],
            "districts": int(df["district"].nunique()),
            "cleaning_counts": cleaning_counts,
        },
        "base_value": round(base_value, 6),
        "regional_historical_mean": round(float(y_train_validation.mean()), 6),
        "regional_historical_std": round(float(y_train_validation.std()), 6),
        "training_samples": len(train),
        "validation_samples": len(validation),
        "test_samples": len(test),
        "split_strategy": "Chronological by crop year: train <=2010, validation 2011-2012, test >=2013",
        "selection_criterion": "Lowest validation MAE; RMSE breaks ties. Test set is held out from model selection.",
        "metrics": {
            "validation": _rounded_metrics(validation_metrics[selected_name]),
            "test": _rounded_metrics(test_metrics[selected_name]),
        },
        "comparison": comparison,
        "feature_columns": MODEL_COLUMNS,
        "feature_labels": FEATURE_LABELS,
        "feature_units": FEATURE_UNITS,
        "transformed_feature_names": transformed_names,
        "transformed_feature_groups": transformed_groups,
        "feature_ranges": feature_ranges,
        "global_importances": global_importances,
        "shap": {
            "method": "TreeExplainer",
            "global_importance_scope": "Held-out test observations",
            "max_test_additivity_error": round(max_additivity_error, 8),
        },
        "data_sources": {
            "yield": {
                "name": "Punjab Rabi wheat crop area and production records; DES/APY data via public mirror",
                "url": "https://raw.githubusercontent.com/dibyendubiswas1998/Crop-Production-Analysis/main/DATA/crop_production.csv",
                "official_portal": "https://desagri.gov.in/",
                "coverage": "22 Punjab districts, 1997-2014",
            },
            "climate": {
                "name": "NASA POWER daily point data, Agroclimatology community",
                "url": "https://power.larc.nasa.gov/",
                "coverage": "District-headquarters coordinate points; Rabi crop years 1997-2014",
            },
        },
        "artifacts": {
            "model": model_path.name,
            "preprocessor": preprocessor_path.name,
            "background_sample": background_path.name,
        },
        "status": "TRAINED_ON_COLLECTED_OBSERVATIONS",
    }
    with metadata_path.open("w", encoding="utf-8") as file:
        json.dump(metadata, file, indent=2)

    print("\n--- SHAP verification ---")
    print(f"  Base value: {base_value:.6f} t/ha")
    print(f"  Max test additivity error: {max_additivity_error:.8f} t/ha")
    print(f"  Model and pipeline saved under {artifacts_dir}")
    return metadata


if __name__ == "__main__":
    train_and_export_model()
