# backend/ml/data/collectors/data_collector.py
import asyncio
import logging
from datetime import datetime
import pandas as pd

# Import scrapers
from ml.data.scrapers.lexpress_scrapers import LexpressScraper
from ml.data.scrapers.leal_scraper import LealScraper
from ml.data.scrapers.property_scraper_finder import PropertyScraperFinder

# Import preprocessing
from ml.data.preprocessing.cleaner import DataCleaner
from ml.data.preprocessing.mauritius_mapping import MauritiusMapper

# Import database
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

class DataCollector:
    def __init__(self, config):
        self.config = config
        self.db = None
        self.scrapers = {
            'lexpress': LexpressScraper(config),
            'leal': LealScraper(config),
            'finder': PropertyScraperFinder(config)
        }
        self.cleaner = DataCleaner()
        self.mapper = MauritiusMapper()
    
    async def connect_db(self):
        """Connect to MongoDB database."""
        try:
            client = AsyncIOMotorClient(self.config['mongodb_url'])
            self.db = client[self.config['mongodb_db']]
            logger.info("Connected to MongoDB database")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            self.db = None
    
    async def collect_data(self):
        """Collect property data from all sources."""
        if not self.db:
            await self.connect_db()
            if not self.db:
                return
        
        all_properties = []
        
        # Collect from all scrapers
        for name, scraper in self.scrapers.items():
            try:
                logger.info(f"Collecting data from {name}...")
                properties = scraper.scrape(pages=self.config.get('pages_to_scrape', 5))
                logger.info(f"Collected {len(properties)} properties from {name}")
                all_properties.append(properties)
            except Exception as e:
                logger.error(f"Error collecting data from {name}: {e}")
        
        # Combine all properties
        if all_properties:
            combined_df = pd.concat(all_properties)
            
            # Clean and process data
            cleaned_df = self.cleaner.clean(combined_df)
            mapped_df = self.mapper.map_locations(cleaned_df)
            
            # Store in database
            await self.store_properties(mapped_df)
            
            # Return the processed data
            return mapped_df
        
        return None
    
    async def store_properties(self, properties_df):
        """Store properties in database."""
        if not self.db:
            logger.error("No database connection")
            return
        
        # Convert to records
        records = properties_df.to_dict('records')
        
        # Store each property
        for prop in records:
            # Check if property already exists
            existing = await self.db.properties.find_one({
                'source': prop['source'],
                'source_id': prop.get('source_id', ''),
                'title': prop['title']
            })
            
            if existing:
                # Update existing property
                await self.db.properties.update_one(
                    {'_id': existing['_id']},
                    {'$set': {
                        'price': prop['price'],
                        'updatedAt': datetime.now()
                    }}
                )
                
                # Record price history
                await self.db.property_price_history.insert_one({
                    'propertyId': existing['_id'],
                    'date': datetime.now(),
                    'price': prop['price']
                })
            else:
                # Add createdAt
                prop['createdAt'] = datetime.now()
                prop['updatedAt'] = datetime.now()
                
                # Insert new property
                result = await self.db.properties.insert_one(prop)
                
                # Record initial price
                await self.db.property_price_history.insert_one({
                    'propertyId': result.inserted_id,
                    'date': datetime.now(),
                    'price': prop['price']
                })
        
        logger.info(f"Stored {len(records)} properties in database")

async def run_data_collection():
    """Run data collection as a scheduled task."""
    config = {
        'mongodb_url': 'mongodb://localhost:27017',
        'mongodb_db': 'propcentre',
        'pages_to_scrape': 10
    }
    
    collector = DataCollector(config)
    await collector.collect_data()

if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run data collection
    asyncio.run(run_data_collection())