# backend/api/dependencies.py
from ml.models.price_predication.mauritius_price_model import MauritiusPriceModel
from ml.models.recommendation.mauritius_recommender import MauritiusRecommender
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Price prediction model
price_model = None

# Recommendation model
recommender = None

# Database connection
db = None

def initialize_ml_models():
    global price_model, recommender
    
    # Initialize price prediction model
    price_model = MauritiusPriceModel.load("models/price_model/mauritius")
    
    # Initialize recommendation model 
    recommender = MauritiusRecommender.load("models/recommender/mauritius_recommender.pkl")

def initialize_database():
    global db
    # MongoDB connection string
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "properties_mauritius")

    # Initialize the connection
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    return db

def initialize_dependencies():
    """Initialize all dependencies for the API"""
    # Initialize machine learning models
    initialize_ml_models()
    
    # Initialize database connection
    db_conn = initialize_database()
    
    print("API dependencies initialized successfully")
    
    return {
        "recommender": recommender,
        "price_model": price_model,
        "db": db_conn
    }

# Dependency injection for FastAPI
def get_price_model():
    return price_model

def get_recommender_model():
    return recommender

def get_db():
    return db