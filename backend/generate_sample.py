#!/usr/bin/env python3
"""
Generate Sample Property Data for ML Model Training
This script creates a sample dataset of Mauritius properties for initial ML model training.
"""

import pandas as pd
import numpy as np
import datetime
import random
import os
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Mauritius locations data
locations = {
    'Port Louis': {'district': 'Port Louis', 'region': 'North', 'latitude': -20.1619, 'longitude': 57.4989},
    'Grand Baie': {'district': 'Rivière du Rempart', 'region': 'North', 'latitude': -20.0182, 'longitude': 57.5822},
    'Flic en Flac': {'district': 'Black River', 'region': 'West', 'latitude': -20.2733, 'longitude': 57.3631},
    'Tamarin': {'district': 'Black River', 'region': 'West', 'latitude': -20.3261, 'longitude': 57.3719},
    'Curepipe': {'district': 'Plaines Wilhems', 'region': 'Central', 'latitude': -20.3162, 'longitude': 57.5166},
    'Quatre Bornes': {'district': 'Plaines Wilhems', 'region': 'Central', 'latitude': -20.2638, 'longitude': 57.4791},
    'Rose Hill': {'district': 'Plaines Wilhems', 'region': 'Central', 'latitude': -20.2422, 'longitude': 57.4707},
    'Vacoas': {'district': 'Plaines Wilhems', 'region': 'Central', 'latitude': -20.2981, 'longitude': 57.4783},
    'Beau Bassin': {'district': 'Plaines Wilhems', 'region': 'Central', 'latitude': -20.2197, 'longitude': 57.4619},
    'Trou aux Biches': {'district': 'Pamplemousses', 'region': 'North', 'latitude': -20.0328, 'longitude': 57.5447},
    'Mahebourg': {'district': 'Grand Port', 'region': 'East', 'latitude': -20.4081, 'longitude': 57.7000},
    'Belle Mare': {'district': 'Flacq', 'region': 'East', 'latitude': -20.1967, 'longitude': 57.7800},
    'Trou d\'Eau Douce': {'district': 'Flacq', 'region': 'East', 'latitude': -20.2261, 'longitude': 57.7883},
    'Blue Bay': {'district': 'Grand Port', 'region': 'East', 'latitude': -20.4397, 'longitude': 57.7144},
    'Souillac': {'district': 'Savanne', 'region': 'South', 'latitude': -20.5238, 'longitude': 57.5213},
}

# Property types with base price per m²
property_types = {
    'apartment': {'base_price': 2000, 'area_range': (50, 150)},
    'house': {'base_price': 1800, 'area_range': (100, 300)},
    'villa': {'base_price': 3000, 'area_range': (150, 400)},
    'condo': {'base_price': 2200, 'area_range': (80, 200)},
    'land': {'base_price': 800, 'area_range': (200, 1000)},
}

# Location price factors
location_factors = {
    'Grand Baie': 1.5,     # Premium tourist area
    'Flic en Flac': 1.4,   # Beach area
    'Tamarin': 1.3,        # Upscale beach area
    'Trou aux Biches': 1.4, # Premium beach
    'Blue Bay': 1.3,       # Beach area
    'Port Louis': 1.1,     # Capital city
    'Curepipe': 0.9,       # Inland city
    'Quatre Bornes': 0.95, # Inland city
    'Rose Hill': 0.9,      # Inland city
    'Vacoas': 0.85,        # Inland city
    'Beau Bassin': 0.9,    # Inland city
    'Mahebourg': 0.8,      # Less developed area
    'Belle Mare': 1.2,     # Beach area
    'Trou d\'Eau Douce': 1.1, # Beach area
    'Souillac': 0.7,       # Remote area
}

def generate_sample_property_data(num_properties=1000, output_path='backend/data/sample_properties.csv', add_nan=False):
    """Generate sample property data for ML model training.
    
    Args:
        num_properties (int): Number of properties to generate
        output_path (str): Path to save the CSV file
        add_nan (bool): Whether to add NaN values for testing robustness
        
    Returns:
        pd.DataFrame: The generated property data
    """
    logger.info(f"Generating {num_properties} sample properties...")
    
    # Lists for each property attribute
    property_ids = []
    titles = []
    locations_list = []
    districts = []
    regions = []
    latitudes = []
    longitudes = []
    property_types_list = []
    prices = []
    bedrooms_list = []
    bathrooms_list = []
    area_sizes = []
    listing_types = []
    years_built = []
    furnished_list = []
    distances_to_beach = []
    
    # Current year for reference
    current_year = datetime.datetime.now().year
    
    # Generate properties
    for i in range(num_properties):
        # Generate property ID
        property_id = f"PROP{i+1000}"
        property_ids.append(property_id)
        
        # Select location
        location = random.choice(list(locations.keys()))
        locations_list.append(location)
        
        # Get district and region
        district = locations[location]['district']
        districts.append(district)
        
        region = locations[location]['region']
        regions.append(region)
        
        # Coordinates with small random variation
        base_lat = locations[location]['latitude']
        base_long = locations[location]['longitude']
        lat_variation = random.uniform(-0.01, 0.01)
        long_variation = random.uniform(-0.01, 0.01)
        
        latitudes.append(base_lat + lat_variation)
        longitudes.append(base_long + long_variation)
        
        # Select property type
        property_type = random.choice(list(property_types.keys()))
        property_types_list.append(property_type)
        
        # Calculate base price based on property type
        base_price_per_sqm = property_types[property_type]['base_price']
        
        # Get area size range for this property type
        min_area, max_area = property_types[property_type]['area_range']
        area = random.randint(min_area, max_area)
        area_sizes.append(area)
        
        # Location price factor
        location_factor = location_factors.get(location, 1.0)
        
        # Calculate price with some random variation
        price_variation = random.uniform(0.85, 1.15)
        price = base_price_per_sqm * area * location_factor * price_variation
        
        # Round price to nearest 5000
        price = round(price / 5000) * 5000
        prices.append(price)
        
        # Generate title
        if property_type == 'land':
            title = f"{area} sqm Land in {location}"
            bedrooms = 0
            bathrooms = 0
            furnished = False
        else:
            bedrooms = random.randint(1, 5) if property_type != 'land' else 0
            bathrooms = random.randint(1, bedrooms + 1) if property_type != 'land' else 0
            furnished = random.choice([True, False]) if property_type != 'land' else False
            
            prefix = random.choice(["Beautiful", "Charming", "Modern", "Spacious", "Cozy", "Elegant", "Luxurious"])
            title = f"{prefix} {bedrooms} Bedroom {property_type.capitalize()} in {location}"
        
        titles.append(title)
        bedrooms_list.append(bedrooms)
        bathrooms_list.append(bathrooms)
        furnished_list.append(furnished)
        
        # Listing type (rent or sale)
        listing_type = random.choice(['rent', 'sale'])
        listing_types.append(listing_type)
        
        # Year built (between 1980 and current year)
        if property_type == 'land':
            year_built = None
        else:
            year_built = random.randint(1980, current_year - 1)
        years_built.append(year_built)
        
        # Calculate distance to beach (closer for coastal locations)
        if region in ['North', 'East', 'West'] and 'beach' in location.lower():
            distance_to_beach = random.uniform(0.1, 1.5)
        elif region in ['North', 'East', 'West']:
            distance_to_beach = random.uniform(1.0, 5.0)
        else:
            distance_to_beach = random.uniform(5.0, 15.0)
        distances_to_beach.append(distance_to_beach)
    
    # Create DataFrame
    data = {
        'property_id': property_ids,
        'title': titles,
        'location': locations_list,
        'district': districts,
        'region': regions,
        'latitude': latitudes,
        'longitude': longitudes,
        'price': prices,
        'property_type': property_types_list,
        'bedrooms': bedrooms_list,
        'bathrooms': bathrooms_list,
        'area_size': area_sizes,
        'listing_type': listing_types,
        'year_built': years_built,
        'furnished': furnished_list,
        'dist_to_beach': distances_to_beach
    }
    
    df = pd.DataFrame(data)
    
    # Add some NaN values to test robustness if requested
    if add_nan:
        logger.info("Adding NaN values to test robustness...")
        
        # Add NaN values to bedrooms (5%)
        mask = np.random.random(size=len(df)) < 0.05
        df.loc[mask, 'bedrooms'] = np.nan
        
        # Add NaN values to bathrooms (5%)
        mask = np.random.random(size=len(df)) < 0.05
        df.loc[mask, 'bathrooms'] = np.nan
    
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(output_path)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Save to CSV
    df.to_csv(output_path, index=False)
    logger.info(f"Generated {num_properties} sample properties and saved to {output_path}")
    
    return df

if __name__ == "__main__":
    output_path = 'backend/data/sample_properties.csv'
    generate_sample_property_data(1000, output_path, add_nan=False)