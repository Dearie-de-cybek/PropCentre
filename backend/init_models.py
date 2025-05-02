# backend/initialize_models.py
import os
import pickle
import json
import pandas as pd
import numpy as np
import shutil

def create_mock_price_model():
    """Create a mock price prediction model for development purposes"""
    print("Creating mock price prediction model...")
    
    # Create directory structure if it doesn't exist
    os.makedirs("models/price_model", exist_ok=True)
    
    # Regions in Mauritius
    regions = ["North", "East", "Central", "West", "South"]
    
    for region in regions:
        # Create mock model data for each region
        model_data = {
            'model': None,  # In a real scenario, this would be the trained model
            'features': [
                'bedrooms', 'bathrooms', 'property_type_encoded', 
                'area_size', 'dist_to_beach', 'dist_to_city',
                'location_score', 'is_beachfront', 'is_tourist_area'
            ],
            'performance': {
                'mae': 25000.0,
                'r2': 0.78
            }
        }
        
        # Save each regional model
        model_path = f"models/price_model/mauritius_{region.lower()}.pkl"
        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)
    
    # Create metadata
    metadata = {
        'regions': regions,
        'features': {region: model_data['features'] for region in regions},
        'performance': {region: model_data['performance'] for region in regions}
    }
    
    # Save metadata
    with open("models/price_model/mauritius_metadata.json", 'w') as f:
        json.dump(metadata, f)
    
    print("Mock price models created successfully")


def create_mock_recommender_model():
    """Create a mock recommendation model for development purposes"""
    print("Creating mock recommendation model...")
    
    # Create directory structure if it doesn't exist
    os.makedirs("models/recommender", exist_ok=True)
    
    # Create mock recommender data
    mock_recommender = {
        'content_similarity': np.random.rand(100, 100),  # Random similarity matrix
        'property_features': np.random.rand(100, 10),    # Random features
        'features': [
            'price', 'bedrooms', 'bathrooms', 'property_type_encoded',
            'area_size', 'location_score', 'dist_to_beach'
        ],
        'feature_weights': {
            'price': 0.2,
            'bedrooms': 0.1,
            'bathrooms': 0.05,
            'property_type_encoded': 0.15,
            'area_size': 0.1,
            'location_score': 0.25,
            'dist_to_beach': 0.15
        },
        'property_ids': np.arange(1, 101)  # Property IDs 1-100
    }
    
    # Save recommender model
    with open("models/recommender/mauritius_recommender.pkl", 'wb') as f:
        pickle.dump(mock_recommender, f)
    
    print("Mock recommender model created successfully")


def create_gis_data():
    """Check if GIS data exists and create if needed"""
    print("Checking GIS data...")
    
    # Create directory structure if it doesn't exist
    os.makedirs("data/external/mauritius_gis", exist_ok=True)
    
    # Check if districts GeoJSON exists
    if not os.path.exists("data/external/mauritius_gis/districts.geojson"):
        print("Creating mock districts geojson...")
        # Create a simplified districts GeoJSON
        districts = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {"district_name": "Port Louis", "population": 120000},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[57.498, -20.16], [57.51, -20.16], [57.51, -20.17], [57.498, -20.17], [57.498, -20.16]]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {"district_name": "Black River", "population": 80000},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[57.37, -20.32], [57.39, -20.32], [57.39, -20.34], [57.37, -20.34], [57.37, -20.32]]]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {"district_name": "Flacq", "population": 138000},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [[[57.71, -20.19], [57.73, -20.19], [57.73, -20.21], [57.71, -20.21], [57.71, -20.19]]]
                    }
                }
            ]
        }
        
        with open("data/external/mauritius_gis/districts.geojson", 'w') as f:
            json.dump(districts, f)
    
    # Check if beaches CSV exists
    if not os.path.exists("data/external/mauritius_gis/beaches.csv"):
        print("Creating mock beaches CSV...")
        beaches = pd.DataFrame({
            'name': ['Flic en Flac', 'Belle Mare', 'Trou aux Biches', 'Le Morne'],
            'latitude': [-20.2789, -20.1986, -20.0361, -20.4558],
            'longitude': [57.3641, 57.7645, 57.5461, 57.3089],
            'description': [
                'Popular beach on the west coast',
                'Long white sand beach on the east coast',
                'Beautiful beach in the north',
                'Beach near the UNESCO heritage site'
            ]
        })
        beaches.to_csv("data/external/mauritius_gis/beaches.csv", index=False)
    
    # Check if cities CSV exists
    if not os.path.exists("data/external/mauritius_gis/cities.csv"):
        print("Creating mock cities CSV...")
        cities = pd.DataFrame({
            'name': ['Port Louis', 'Curepipe', 'Quatre Bornes', 'Vacoas', 'Grand Baie'],
            'latitude': [-20.1619, -20.3189, -20.2638, -20.2983, -20.0188],
            'longitude': [57.5012, 57.5266, 57.4791, 57.4783, 57.5802],
            'population': [155000, 85000, 80000, 110000, 12000]
        })
        cities.to_csv("data/external/mauritius_gis/cities.csv", index=False)
    
    # Check if attractions CSV exists
    if not os.path.exists("data/external/mauritius_gis/attractions.csv"):
        print("Creating mock attractions CSV...")
        attractions = pd.DataFrame({
            'name': [
                'Chamarel Seven Colored Earth',
                'Black River Gorges National Park',
                'Mauritius Botanical Garden',
                'Blue Bay Marine Park',
                'Le Morne Brabant'
            ],
            'latitude': [-20.4275, -20.4267, -20.1058, -20.4472, -20.4558],
            'longitude': [57.3792, 57.4478, 57.5806, 57.7183, 57.3089],
            'type': ['Natural', 'Natural', 'Natural', 'Natural', 'Cultural'],
            'popularity': [9, 10, 8, 9, 10]
        })
        attractions.to_csv("data/external/mauritius_gis/attractions.csv", index=False)
    
    print("GIS data setup complete")


def main():
    """Initialize all mock models and data for development"""
    print("Initializing mock models and data for development...")
    
    # Create necessary data and models
    create_gis_data()
    create_mock_price_model()
    create_mock_recommender_model()
    
    print("Mock environment setup complete!")
    print("You can now run your application with: uvicorn api.main:app --reload")


if __name__ == "__main__":
    main()