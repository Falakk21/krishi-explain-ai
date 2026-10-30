# Punjab Rabi Wheat Data

## Dataset used by training and the historical dashboard

The current merged file is [`backend/app/data/raw/punjab_wheat_real_data.csv`](../backend/app/data/raw/punjab_wheat_real_data.csv). It contains 338 district-year observations for Punjab Rabi wheat, spanning crop years 1997-2014 and 22 districts. Annual coverage is incomplete at the beginning of the series: 17 districts are represented in 1997-2005, 19-20 in 2006-2011, and all 22 from 2012 onward.

### Agricultural yield

- **Measure:** yield in tonnes per hectare, computed as reported production (tonnes) divided by area (hectares).
- **Source record:** Punjab, crop `Wheat`, season `Rabi`, from the publicly available APY crop-production CSV hosted at [the source mirror](https://raw.githubusercontent.com/dibyendubiswas1998/Crop-Production-Analysis/main/DATA/crop_production.csv).
- **Official reference portal:** [Directorate of Economics and Statistics, Ministry of Agriculture & Farmers Welfare](https://desagri.gov.in/).
- **Important provenance qualification:** the file used by this project is a public GitHub mirror, not a direct DES API download. The mirror has `State_Name`, `District_Name`, `Crop_Year`, `Season`, `Crop`, `Area`, and `Production` fields. The Punjab wheat Rabi filter was checked against the live mirror and yielded 338 records, 1997-2014, across 22 districts. The official portal is cited as the government statistics reference; it is not the download URL used by the pipeline.
- **Coverage:** district-level; some districts have no records for early years. Do not treat this as a balanced panel.

### Climate

- **Source:** [NASA POWER](https://power.larc.nasa.gov/), daily point API v2, Agroclimatology community.
- **Spatial coverage:** one query at each district headquarters coordinate in `backend/app/data/collect_real_data.py`; these are gridded point estimates, not district-area averages. The documented POWER grid is approximately 0.5°.
- **Time coverage:** Rabi seasons for crop years 1997-2014; cached source responses are in `backend/app/data/raw/_intermediate/`.
- **Variables:** daily T2M (2 m mean air temperature, °C), T2M_MAX (2 m daily maximum, °C), PRECTOTCORR (corrected precipitation, mm/day), RH2M (2 m relative humidity, %), and GWETROOT (root-zone soil wetness, fraction).
- **Season alignment:** crop year is the harvest year; a season covers November-December of the prior calendar year and January-March of the crop year. Terminal heat is February-March.

### Engineered model features

| Feature | Engineering from NASA POWER | Unit |
|---|---|---|
| `avg_temperature` | Mean daily T2M over the November-March season | °C |
| `max_temperature` | Maximum daily T2M_MAX in February-March | °C |
| `rainfall_mm` | Sum of daily PRECTOTCORR over November-March | mm |
| `humidity_pct` | Mean daily RH2M over November-March | % |
| `soil_moisture_pct` | Mean daily GWETROOT over November-March × 100 | % |
| `heat_wave_days` | Count of February-March days with T2M_MAX > 31°C | days |
| `district` | Punjab district name, one-hot encoded in the train-fitted preprocessing pipeline | category |

IMD data is **not** part of the current training dataset. It is not represented as a source of measured values in the model or dashboard.

## Cleaning and exploratory checks

The training pipeline filters Punjab + Wheat + Rabi, coerces numeric fields, removes non-finite/incomplete values, de-duplicates district-year keys, and drops yields outside the collector's 1.5-8.0 t/ha plausibility interval or physically invalid climate values. On the checked 338-row file, no rows were removed by these checks.

Observed full-dataset summary (338 rows):

| Variable | Mean | Std. dev. | Min | Max |
|---|---:|---:|---:|---:|
| Mean season temperature (°C) | 17.277 | 0.892 | 12.450 | 18.790 |
| Terminal-period max temperature (°C) | 36.591 | 2.408 | 27.080 | 41.690 |
| Season rainfall (mm) | 78.251 | 50.959 | 11.900 | 272.200 |
| Relative humidity (%) | 37.694 | 7.161 | 24.400 | 55.700 |
| Root-zone wetness (%) | 38.581 | 3.967 | 33.100 | 56.000 |
| Terminal heat days | 17.633 | 8.125 | 0 | 37 |
| Yield (t/ha) | 4.421 | 0.496 | 2.738 | 7.462 |

These are descriptive statistics for the observed merged file, not district-weighted state estimates or model evaluation metrics.

## Not used as observations

`backend/app/data/raw/punjab_wheat_climate_1990_2023.csv` was produced by an old synthetic-data generator. It is **not** an observed dataset and is excluded from training, inference baselines, and the historical dashboard. Do not cite its values as NASA, IMD, or DES observations. The loader fails explicitly if the collected dataset is unavailable rather than generating substitute history.

## Collection

From `backend/`, run:

```powershell
python -m app.data.collect_real_data
```

The collector filters the mirror to the `Rabi` season, requests/caches NASA POWER daily data, aggregates seasons, merges on crop year and district, and writes both the merged CSV and `data_provenance.json`.
