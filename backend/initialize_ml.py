#!/usr/bin/env python3
"""
ML Models Initialization Script
This script initializes ML models for the PropCentre application.
Run this before starting the application or as part of the startup process.
"""

import os
import sys
import logging
import argparse
import pandas as pd
import numpy as np
from pathlib import Path

# Add the backend directory to the path
sys.path.append(str(Path(__file__).parent.parent))

# Import ML models
from ml.models.price_predication.mauritius_price_model import MauritiusPriceModel
from ml.models.recommendation.mauritius_recommender import MauritiusRecommender

# Import data preprocessing
from data_preprocess import preprocess_property_data

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_model_dirs():
    """Create directories for model files."""
    os.makedirs(Path("models/price_model"), exist_ok=True)
    os.makedirs(Path("models/recommender"), exist_ok=True)
    
def initialize_models(data_path=None, force_retrain=False, preprocess=True):
    """
    Initialize ML models for the application.
    
    Args:
        data_path (str): Path to the data file
        force_retrain (bool): Whether to force retraining even if models exist
        preprocess (bool): Whether to preprocess the data before training
        
    Returns:
        tuple: (price_model, recommender) - Trained models
    """
    logger.info("Initializing ML models...")
    
    # Create model directories
    create_model_dirs()
    
    # Check if models already exist
    price_model_path = Path("models/price_model/mauritius_metadata.json")
    recommender_model_path = Path("models/recommender/mauritius_recommender.pkl")
    
    models_exist = price_model_path.exists() and recommender_model_path.exists()
    
    if models_exist and not force_retrain:
        logger.info("Models already exist. Loading from disk...")
        
        # Load existing models
        try:
            price_model = MauritiusPriceModel.load("models/price_model/mauritius")
            recommender = MauritiusRecommender.load("models/recommender/mauritius_recommender.pkl")
            logger.info("Models loaded successfully.")
            return price_model, recommender
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            logger.info("Will try to train new models...")
    
    # If data path is provided, load data and train models
    if data_path:
        try:
            logger.info(f"Loading data from {data_path}...")
            
            # Determine file type and load accordingly
            if data_path.endswith('.csv'):
                if preprocess:
                    # Preprocess data before training
                    logger.info("Preprocessing data...")
                    processed_path = data_path.replace('.csv', '_processed.csv')
                    df = preprocess_property_data(data_path, processed_path)
                    logger.info(f"Data preprocessed and saved to {processed_path}")
                else:
                    # Load raw data
                    df = pd.read_csv(data_path)
                    
                    # Quick check for NaN values
                    nan_count = df.isna().sum().sum()
                    if nan_count > 0:
                        logger.warning(f"Data contains {nan_count} NaN values. Consider using preprocess=True.")
                        
                        # Basic cleaning to prevent model training failures
                        df = df.dropna()
                        logger.info(f"Dropped rows with NaN values. {len(df)} rows remaining.")
                    
            elif data_path.endswith('.xlsx'):
                if preprocess:
                    # For Excel files, first load, then preprocess
                    raw_df = pd.read_excel(data_path)
                    processed_path = data_path.replace('.xlsx', '_processed.csv')
                    df = preprocess_property_data(raw_df, processed_path)
                    logger.info(f"Data preprocessed and saved to {processed_path}")
                else:
                    # Load raw data
                    df = pd.read_excel(data_path)
                    
                    # Quick check for NaN values
                    nan_count = df.isna().sum().sum()
                    if nan_count > 0:
                        logger.warning(f"Data contains {nan_count} NaN values. Consider using preprocess=True.")
                        
                        # Basic cleaning to prevent model training failures
                        df = df.dropna()
                        logger.info(f"Dropped rows with NaN values. {len(df)} rows remaining.")
            else:
                raise ValueError("Unsupported file format. Use CSV or Excel.")
            
            logger.info(f"Loaded {len(df)} property records.")
            
            # Check required columns
            required_columns = ['price', 'location', 'property_type']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                raise ValueError(f"Data is missing required columns: {missing_columns}")
            
            # Check that we have property_type_encoded column (should be added in preprocessing)
            if 'property_type_encoded' not in df.columns:
                logger.info("Adding property_type_encoded column...")
                property_type_mapping = {
                    'apartment': 0,
                    'house': 1,
                    'villa': 2,
                    'condo': 3,
                    'land': 4
                }
                df['property_type_encoded'] = df['property_type'].map(property_type_mapping)
            
            # Final check for NaN values before training
            if df.isna().any().any():
                logger.warning("Dataset still contains NaN values. Dropping affected rows...")
                df = df.dropna()
                logger.info(f"After final cleaning: {len(df)} property records.")
            
            # Initialize and train price model
            logger.info("Training price prediction model...")
            config = {}
            price_model = MauritiusPriceModel(config)
            price_model.train(df)
            price_model.save("models/price_model/mauritius")
            logger.info("Price model trained and saved.")
            
            # Initialize and train recommender
            logger.info("Training recommendation model...")
            recommender = MauritiusRecommender(config)
            recommender.fit(df)
            recommender.save("models/recommender/mauritius_recommender.pkl")
            logger.info("Recommender model trained and saved.")
            
            return price_model, recommender
            
        except Exception as e:
            logger.error(f"Error training models: {e}")
            raise
    else:
        logger.warning("No data provided. Cannot train models.")
        return None, None

def main():
    parser = argparse.ArgumentParser(description='Initialize ML models for PropCentre application.')
    parser.add_argument('--data', help='Path to property data CSV or Excel file')
    parser.add_argument('--force-retrain', action='store_true', help='Force retraining even if models exist')
    parser.add_argument('--no-preprocess', action='store_true', help='Skip data preprocessing step')
    args = parser.parse_args()
    
    try:
        price_model, recommender = initialize_models(
            args.data, 
            args.force_retrain, 
            preprocess=not args.no_preprocess
        )
        
        if price_model and recommender:
            logger.info("ML models initialized successfully!")
        else:
            logger.warning("ML models initialization incomplete. Check logs for details.")
    except Exception as e:
        logger.error(f"ML models initialization failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()