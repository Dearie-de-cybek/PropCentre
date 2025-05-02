#!/usr/bin/env python3
"""
Data Preprocessing for Mauritius Property ML Models

This script preprocesses property data to handle missing values and prepare
features for ML model training. It should be run before model training.
"""

import pandas as pd
import numpy as np
import os
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def preprocess_property_data(input_file, output_file=None):
    """
    Preprocess property data, handling missing values and creating derived features.
    
    Args:
        input_file (str): Path to input CSV file
        output_file (str, optional): Path to save processed data. If None, returns DataFrame only.
        
    Returns:
        pd.DataFrame: Processed property data
    """
    logger.info(f"Loading property data from {input_file}...")
    
    try:
        # Load data
        df = pd.read_csv(input_file)
        logger.info(f"Loaded {len(df)} properties")
        
        # Check for missing values
        na_counts = df.isna().sum()
        for column, count in na_counts.items():
            if count > 0:
                logger.info(f"Column '{column}' has {count} missing values ({count/len(df)*100:.2f}%)")
        
        # ---- Handle missing values ----
        logger.info("Handling missing values...")
        
        # For bedrooms and bathrooms, fill with median by property type
        for feature in ['bedrooms', 'bathrooms']:
            if feature in df.columns:
                # For property type 'land', use 0
                df.loc[(df['property_type'] == 'land') & df[feature].isna(), feature] = 0
                
                # For other property types, use median by property type
                for prop_type in df['property_type'].unique():
                    if prop_type != 'land':
                        median_value = df[df['property_type'] == prop_type][feature].median()
                        df.loc[(df['property_type'] == prop_type) & df[feature].isna(), feature] = median_value
        
        # For year_built, fill with median by property type or set to 0 for land
        if 'year_built' in df.columns:
            df.loc[(df['property_type'] == 'land') & df['year_built'].isna(), 'year_built'] = 0
            
            for prop_type in df['property_type'].unique():
                if prop_type != 'land':
                    # Use only non-NaN values for calculating the median
                    median_year = df[(df['property_type'] == prop_type) & df['year_built'].notna()]['year_built'].median()
                    if not np.isnan(median_year):  # Ensure we have a valid median
                        df.loc[(df['property_type'] == prop_type) & df['year_built'].isna(), 'year_built'] = median_year
        
        # ---- Create derived features ----
        logger.info("Creating derived features...")
        
        # Encode property types
        property_type_mapping = {
            'apartment': 0,
            'house': 1,
            'villa': 2,
            'condo': 3,
            'land': 4
        }
        df['property_type_encoded'] = df['property_type'].map(property_type_mapping)
        
        # Encode listing type
        if 'listing_type' in df.columns:
            listing_type_mapping = {'rent': 0, 'sale': 1}
            df['listing_type_encoded'] = df['listing_type'].map(listing_type_mapping)
        
        # Create location score based on premium locations
        location_premiums = {
            'Grand Baie': 90,
            'Flic en Flac': 85,
            'Tamarin': 80,
            'Trou aux Biches': 85,
            'Belle Mare': 75,
            'Blue Bay': 70,
            'Port Louis': 65,
            'Trou d\'Eau Douce': 65,
            'Curepipe': 55,
            'Quatre Bornes': 60,
            'Rose Hill': 55,
            'Beau Bassin': 55,
            'Vacoas': 50,
            'Mahebourg': 45,
            'Souillac': 40
        }
        df['location_score'] = df['location'].map(location_premiums).fillna(50)
        
        # Create beachfront and tourist area indicators
        df['is_beachfront'] = np.where(df['dist_to_beach'] < 0.5, 1, 0)
        
        tourist_locations = ['Grand Baie', 'Flic en Flac', 'Trou aux Biches', 'Belle Mare', 'Blue Bay']
        df['is_tourist_area'] = np.where(df['location'].isin(tourist_locations), 1, 0)
        
        # Calculate distance to city centers
        city_locations = {
            'Port Louis': (-20.1619, 57.4989),
            'Curepipe': (-20.3162, 57.5166),
            'Quatre Bornes': (-20.2638, 57.4791)
        }
        
        def distance_to_nearest_city(lat, lon):
            if pd.isna(lat) or pd.isna(lon):
                return np.nan
                
            min_dist = float('inf')
            for city_coords in city_locations.values():
                city_lat, city_lon = city_coords
                # Simple Euclidean distance (approximate for small distances)
                dist = ((lat - city_lat) ** 2 + (lon - city_lon) ** 2) ** 0.5
                # Convert to km (rough approximation - 1 degree is about 111km at the equator)
                dist_km = dist * 111
                min_dist = min(min_dist, dist_km)
            return min_dist
        
        # Only calculate if lat and lon are present
        if 'latitude' in df.columns and 'longitude' in df.columns:
            df['dist_to_city'] = df.apply(
                lambda row: distance_to_nearest_city(row['latitude'], row['longitude']), 
                axis=1
            )
        
        # Check for any remaining NaN values
        na_counts_after = df.isna().sum()
        columns_with_na = [col for col, count in na_counts_after.items() if count > 0]
        
        if columns_with_na:
            logger.warning(f"Columns still containing NaN values: {columns_with_na}")
            
            # Fill remaining NaNs with sensible defaults
            for col in columns_with_na:
                if df[col].dtype == 'float64' or df[col].dtype == 'int64':
                    # For numeric columns, use median
                    df[col] = df[col].fillna(df[col].median())
                else:
                    # For categorical columns, use most common value
                    df[col] = df[col].fillna(df[col].mode()[0])
        
        # Final check
        if df.isna().any().any():
            logger.warning("There are still NaN values in the dataset. Using dropna() as last resort.")
            df = df.dropna()
        
        # Save processed data if output file is specified
        if output_file:
            output_dir = os.path.dirname(output_file)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)
                
            df.to_csv(output_file, index=False)
            logger.info(f"Saved processed data to {output_file}")
        
        return df
        
    except Exception as e:
        logger.error(f"Error preprocessing data: {e}")
        raise

if __name__ == "__main__":
    # Default paths
    input_path = 'backend/data/sample_properties.csv'
    output_path = 'backend/data/processed_properties.csv'
    
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Process data
    processed_df = preprocess_property_data(input_path, output_path)
    logger.info("Data preprocessing complete!")