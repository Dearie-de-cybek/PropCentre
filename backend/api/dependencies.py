# backend/api/dependencies.py
from ml.models.price_predication.mauritius_price_model import MauritiusPriceModel
from ml.models.recommendation.mauritius_recommender import MauritiusRecommender
from ml.features.mauritius_locations import MauritiusLocationFeatures
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Price prediction model
price_model = None

# Recommendation model
recommender = None

# Location features generator
location_features = None

# Database connection
db = None

def initialize_ml_models():
    global price_model, recommender, location_features
    
    # Initialize price prediction model
    price_model = MauritiusPriceModel.load("models/price_model/mauritius")
    
    # Initialize recommendation model 
    recommender = MauritiusRecommender.load("models/recommender/mauritius_recommender.pkl")
    
    # Initialize location features generator
    location_features = MauritiusLocationFeatures({
        'mauritius_districts_path': 'data/external/mauritius_gis/districts.geojson',
        'mauritius_beaches_path': 'data/external/mauritius_gis/beaches.csv',
        'mauritius_cities_path': 'data/external/mauritius_gis/cities.csv',
        'mauritius_attractions_path': 'data/external/mauritius_gis/attractions.csv'
    })

def initialize_database():
    global db
    # MongoDB connection string
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "properties_mauritius")

    # Initialize the connection
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    return db

async def initialize_dependencies():
    """Initialize all dependencies for the API"""
    # Initialize machine learning models
    initialize_ml_models()
    
    # Initialize database connection
    db_conn = initialize_database()
    
    print("API dependencies initialized successfully")
    
    return {
        "recommender": recommender,
        "price_model": price_model,
        "location_features": location_features,
        "db": db_conn
    }

# Dependency injection for FastAPI
def get_price_model():
    return price_model

def get_recommender_model():
    return recommender

def get_location_features():
    return location_features

def get_db():
    return db