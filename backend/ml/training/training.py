# backend/ml/training/train_models.py
import asyncio
import logging
import pandas as pd
import os
from datetime import datetime

# Import ML models
from ml.models.price_predication.mauritius_price_model import MauritiusPriceModel
from ml.models.recommendation.mauritius_recommender import MauritiusRecommender
from ml.features.mauritius_locations import MauritiusLocationFeatures

# Import database
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self, config):
        self.config = config
        self.db = None
        self.models_dir = config.get('models_dir', 'models')
        
        # Ensure models directory exists
        os.makedirs(os.path.join(self.models_dir, 'price_model'), exist_ok=True)
        os.makedirs(os.path.join(self.models_dir, 'recommender'), exist_ok=True)
    
    async def connect_db(self):
        """Connect to MongoDB database."""
        try:
            client = AsyncIOMotorClient(self.config['mongodb_url'])
            self.db = client[self.config['mongodb_db']]
            logger.info("Connected to MongoDB database")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            self.db = None
    
    async def load_property_data(self):
        """Load property data from database."""
        if not self.db:
            await self.connect_db()
            if not self.db:
                return None
        
        # Fetch all properties
        cursor = self.db.properties.find({})
        properties = await cursor.to_list(length=None)
        
        if not properties:
            logger.warning("No properties found in database")
            return None
        
        # Convert to DataFrame
        df = pd.DataFrame(properties)
        logger.info(f"Loaded {len(df)} properties from database")
        
        return df
    
    async def enrich_property_data(self, df):
        """Enrich property data with additional features."""
        if df is None or len(df) == 0:
            return None
        
        # Create location features
        location_features = MauritiusLocationFeatures(self.config)
        enriched_df = location_features.generate(df)
        
        return enriched_df
    
    async def train_price_model(self, df=None):
        """Train price prediction model."""
        if df is None:
            df = await self.load_property_data()
            if df is None:
                return
        
        # Enrich data
        enriched_df = await self.enrich_property_data(df)
        if enriched_df is None:
            return
        
        # Initialize model
        price_model = MauritiusPriceModel(self.config)
        
        # Train model
        logger.info("Training price prediction model...")
        price_model.train(enriched_df)
        
        # Save model
        model_path = os.path.join(self.models_dir, 'price_model', 'mauritius')
        price_model.save(model_path)
        logger.info(f"Price model saved to {model_path}")
        
        return price_model
    
    async def train_recommender(self, df=None):
        """Train recommendation model."""
        if df is None:
            df = await self.load_property_data()
            if df is None:
                return
        
        # Enrich data
        enriched_df = await self.enrich_property_data(df)
        if enriched_df is None:
            return
        
        # Initialize model
        recommender = MauritiusRecommender(self.config)
        
        # Train model
        logger.info("Training recommendation model...")
        recommender.fit(enriched_df)
        
        # Save model
        model_path = os.path.join(self.models_dir, 'recommender', 'mauritius_recommender.pkl')
        recommender.save(model_path)
        logger.info(f"Recommender model saved to {model_path}")
        
        return recommender
    
    async def train_all_models(self):
        """Train all ML models."""
        # Load data once
        df = await self.load_property_data()
        if df is None:
            return
        
        # Train both models
        await self.train_price_model(df)
        await self.train_recommender(df)
        
        # Log completion
        logger.info("Model training completed")

async def run_model_training():
    """Run model training as a scheduled task."""
    config = {
        'mongodb_url': 'mongodb://localhost:27017',
        'mongodb_db': 'propcentre',
        'models_dir': 'models'
    }
    
    trainer = ModelTrainer(config)
    await trainer.train_all_models()

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run model training
    asyncio.run(run_model_training())