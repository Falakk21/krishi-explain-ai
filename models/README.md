# Crop-yield model and evaluation

## Trained artifact

The current model artifacts are written to `backend/app/ml/artifacts/` by `python -m app.ml.train`:

- `wheat_model.joblib`: selected scikit-learn `Pipeline` (median imputer + tree regressor).
- `preprocessor.joblib`: fitted median imputer used by the pipeline.
- `background_sample.joblib`: sample of train-plus-validation feature rows.
- `metadata.json`: data coverage, cleaning counts, model comparison, hold-out metrics, training ranges, and SHAP summary.

The model is trained on `punjab_wheat_real_data.csv`, not on the old generated 1990-2023 demonstration CSV. Predictors are the six engineered NASA POWER variables plus district. The preprocessing pipeline fits median imputation for numeric variables and one-hot encoding for district categories on training rows only. Yield is the target in tonnes per hectare.

## Split and model selection

Rows are kept together by crop year to avoid leakage between districts from the same year:

- **Train:** 1997-2010, 252 records
- **Validation:** 2011-2012, 42 records
- **Test:** 2013-2014, 44 records

The Random Forest and XGBoost candidates are first compared on validation MAE (RMSE breaks ties). Each candidate is then refit on train + validation and evaluated on the untouched test years. The test set is not used to select the model.

### Results from the actual training run

| Model | Validation MAE | Validation RMSE | Validation R² | Test MAE | Test RMSE | Test R² |
|---|---:|---:|---:|---:|---:|---:|
| Random Forest Regressor | 0.4623 | 0.5375 | -1.5323 | 0.5174 | 0.5899 | -0.0586 |
| XGBoost Regressor | 0.5198 | 0.5855 | -2.0043 | 0.5150 | 0.5982 | -0.0885 |

**Selected:** Random Forest Regressor, because it had the lower validation MAE. On the test years, XGBoost had slightly lower MAE (0.5150 vs. 0.5174), while Random Forest had lower RMSE and higher R². Choosing the model using test results would leak the test set into model selection. Negative validation R² and near-zero test R² indicate weak out-of-time predictive skill; do not describe this model as production-validated or use it for agronomic decisions without stronger independent data and validation.

Metrics are tonnes per hectare for MAE/RMSE; R² is unitless. Values are from the training command's output and are reproduced in `metadata.json`.

## Explainability

The selected estimator is explained using `shap.TreeExplainer`. Local SHAP values and mean absolute global SHAP values are calculated from the selected tree model. The SHAP values of district's one-hot columns are summed to provide one district contribution. Global importance in the API is based on the 44 held-out test rows. Training verifies the SHAP additivity identity against model predictions; the recorded maximum test reconstruction error is 0.0 t/ha for this run.

The existing waterfall chart shows local SHAP contributions for trained-model predictions. Feature attribution describes the fitted model's behavior, not biological causation. Demonstration mode, when explicitly enabled or when artifacts are unavailable, remains clearly marked and has no local SHAP explanation; no illustrative or simulated SHAP values are returned. Global importance, when available in demo mode, is still sourced from the trained model and is not an explanation of the demo prediction.

The climate simulator changes temperature and rainfall inputs and derives humidity, soil moisture, and heat-day changes using explicit rules in `backend/app/services/simulation_service.py`. Scenario outputs are model predictions for those hypothetical feature values, not forecasts of future weather or observed seasons.

## Reproducibility

From `backend/`:

```powershell
python -m app.ml.train
```

The alias `python -m app.ml.train_real` runs the same pipeline. Evaluation metrics and artifact paths are written to the console and metadata JSON. Re-run the training command after collecting new source observations; never edit metrics or status fields by hand.
