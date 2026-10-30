"""Compatibility entry point for the observed-data training pipeline."""

from app.ml.train_real import train_and_export_model


if __name__ == "__main__":
    train_and_export_model()
