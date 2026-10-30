from typing import Any, Optional

import pandas as pd

from app.data.loader import load_historical_data


class ClimateService:
    def __init__(self) -> None:
        self._df: Optional[pd.DataFrame] = None

    def _get_df(self) -> pd.DataFrame:
        if self._df is None:
            self._df = load_historical_data()
        return self._df

    def get_climate_series(
        self,
        district: Optional[str] = "Ludhiana",
        start_year: int = 1997,
        end_year: int = 2014,
    ) -> dict[str, Any]:
        df = self._get_df()
        filtered = df[df["year"].between(start_year, end_year)]
        if district and district.casefold() != "all":
            filtered = filtered[filtered["district"].str.casefold() == district.casefold()]
            series_data = filtered.sort_values("year").to_dict(orient="records")
        else:
            aggregate_columns = [
                "avg_temperature",
                "max_temperature",
                "rainfall_mm",
                "humidity_pct",
                "soil_moisture_pct",
                "heat_wave_days",
                "yield_tonnes_per_hectare",
            ]
            aggregated = (
                filtered.groupby("year")[aggregate_columns]
                .mean()
                .reset_index()
                .round(2)
            )
            aggregated["district"] = "All Districts (Punjab Average)"
            series_data = aggregated.to_dict(orient="records")

        years = [int(record["year"]) for record in series_data]
        yields = [
            float(record["yield_tonnes_per_hectare"])
            for record in series_data
            if pd.notna(record.get("yield_tonnes_per_hectare"))
        ]
        latest_record = series_data[-1] if series_data else {}
        if len(series_data) >= 2:
            first_temp = float(series_data[0]["avg_temperature"])
            latest_temp = float(series_data[-1]["avg_temperature"])
            temp_trend = f"{latest_temp - first_temp:+.2f}°C ({years[0]} to {years[-1]})"
        else:
            temp_trend = "Insufficient observations"

        return {
            "kpis": {
                "selected_crop": "Wheat (Rabi)",
                "selected_region": f"{district or 'All Districts'}, Punjab, India",
                "historical_temp_trend": temp_trend,
                "latest_observed_yield": (
                    f"{latest_record['yield_tonnes_per_hectare']:.2f} t/ha ({years[-1]})"
                    if years and pd.notna(latest_record.get("yield_tonnes_per_hectare"))
                    else "No observation in selected period"
                ),
                "historical_mean_yield": (
                    f"{sum(yields) / len(yields):.2f} t/ha" if yields else "No observations"
                ),
                "total_records": len(series_data),
                "years_covered": f"{min(years)} - {max(years)}" if years else "No observations",
            },
            "district": district or "All",
            "is_demo": False,
            "data_source": "NASA POWER climate + DES/APY yield public mirror",
            "series": series_data,
        }


climate_service = ClimateService()
