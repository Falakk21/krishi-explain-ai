import pandas as pd

from app.core.config import settings


def load_historical_data() -> pd.DataFrame:
    """Load collected observations; never generate or substitute synthetic history."""
    data_path = settings.DATA_PATH
    if not data_path.exists():
        raise FileNotFoundError(
            f"Observed climate and yield dataset not found at {data_path}. "
            "Run `python -m app.data.collect_real_data` to collect the source data."
        )

    df = pd.read_csv(data_path)
    required_columns = {
        "year",
        "district",
        "avg_temperature",
        "max_temperature",
        "rainfall_mm",
        "humidity_pct",
        "soil_moisture_pct",
        "heat_wave_days",
        "yield_tonnes_per_hectare",
    }
    missing_columns = required_columns.difference(df.columns)
    if missing_columns:
        raise ValueError(f"Observed dataset is missing columns: {sorted(missing_columns)}")
    return df
