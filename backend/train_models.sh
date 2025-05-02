#!/bin/bash
# Script to generate sample data, preprocess it, and train ML models

# Set up error handling
set -e  # Exit immediately if a command exits with a non-zero status
set -u  # Exit if a referenced variable is unset

echo "===== PropCentre ML Model Training ====="
echo "Starting at $(date)"

# Create necessary directories
mkdir -p backend/data
mkdir -p models/price_model
mkdir -p models/recommender

# Step 1: Generate sample property data
echo ""
echo "Generating sample property data..."
python -m backend.ml.data.generate_sample_data

# Step 2: Preprocess the data
echo ""
echo "Preprocessing property data..."
python data_preprocessing.py

# Step 3: Train the ML models
echo ""
echo "Training ML models..."
python initialize_ml_models.py --data backend/data/processed_properties.csv --force-retrain

echo ""
echo "Training completed at $(date)"
echo "===== PropCentre ML Model Training Complete ====="