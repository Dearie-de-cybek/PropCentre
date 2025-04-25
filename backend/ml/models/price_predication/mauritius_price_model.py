import xgboost as xgb
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import pickle

class MauritiusPriceModel:
    """XGBoost-based price prediction model specifically for Mauritius real estate"""
    
    def __init__(self, config=None):
        self.config = config or {}
        self.models = {}  # Regional models
        
    def train(self, df, target='price'):
        """Train price prediction model for Mauritius properties"""
        print("Training Mauritius price prediction model...")
        
        # Split data by region for region-specific models
        regions = df['region'].unique()
        
        for region in regions:
            if region == 'Unknown':
                continue
                
            region_df = df[df['region'] == region]
            if len(region_df) < 100:  # Skip if not enough data
                print(f"Not enough data for region {region}, skipping")
                continue
                
            print(f"Training model for {region} region with {len(region_df)} properties")
            
            # Features for Mauritius price model
            features = [
                'bedrooms', 'bathrooms', 'property_type_encoded', 
                'area_size', 'dist_to_beach', 'dist_to_city',
                'location_score', 'is_beachfront', 'is_tourist_area'
            ]
            
            # Filter features that exist in the DataFrame
            available_features = [f for f in features if f in region_df.columns]
            
            X = region_df[available_features]
            y = region_df[target]
            
            # Train-test split
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Create and train XGBoost model
            model = xgb.XGBRegressor(
                objective='reg:squarederror',
                n_estimators=200,
                learning_rate=0.05,
                max_depth=6,
                subsample=0.8,
                colsample_bytree=0.8,
                gamma=0.1,
                random_state=42
            )
            
            model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            print(f"{region} Model Performance: MAE = Rs{mae:.2f}, R² = {r2:.4f}")
            
            # Store model
            self.models[region] = {
                'model': model,
                'features': available_features,
                'performance': {
                    'mae': mae,
                    'r2': r2
                }
            }
        
        return self
    
    def predict(self, property_data):
        """Predict price for a property in Mauritius"""
        # Create DataFrame from property data
        if isinstance(property_data, dict):
            df = pd.DataFrame([property_data])
        else:
            df = property_data
            
        # Determine region
        if 'region' not in df.columns:
            if 'district' in df.columns:
                # Map district to region
                district_to_region = {
                    'Port Louis': 'North',
                    'Pamplemousses': 'North',
                    'Rivière du Rempart': 'North',
                    'Flacq': 'East',
                    'Grand Port': 'East',
                    'Moka': 'Central',
                    'Plaines Wilhems': 'Central',
                    'Black River': 'West',
                    'Savanne': 'South'
                }
                df['region'] = df['district'].map(district_to_region)
            elif 'location' in df.columns:
                # Try to map location text to region directly
                df['region'] = df['location'].apply(self._extract_region)
        
        # Make predictions
        results = []
        
        for _, row in df.iterrows():
            region = row.get('region', 'Central')  # Default to Central region
            
            # If no model for this region, use closest region
            if region not in self.models:
                region = 'Central'  # Fallback
            
            if region in self.models:
                model_info = self.models[region]
                model = model_info['model']
                features = model_info['features']
                
                # Extract features
                X = np.array([row.get(f, 0) for f in features]).reshape(1, -1)
                
                # Predict
                predicted_price = model.predict(X)[0]
                confidence = 0.8  # Base confidence
                
                # Adjust confidence based on R² score
                confidence *= self.models[region]['performance']['r2']
                
                results.append({
                    'predicted_price': float(predicted_price),
                    'confidence': float(confidence),
                    'region': region
                })
            else:
                # No model available
                results.append({
                    'predicted_price': None,
                    'confidence': 0,
                    'region': region
                })
        
        if len(results) == 1:
            return results[0]
        return results
    
    def _extract_region(self, location):
        """Extract region from location text for Mauritius"""
        location = str(location).lower()
        
        # North
        if any(place in location for place in ['port louis', 'grand baie', 'pamplemousses', 'triolet', 'grand gaube']):
            return 'North'
        
        # East
        if any(place in location for place in ['flacq', 'belle mare', 'trou d\'eau douce', 'poste lafayette']):
            return 'East'
        
        # Central
        if any(place in location for place in ['curepipe', 'quatre bornes', 'vacoas', 'moka', 'rose hill']):
            return 'Central'
        
        # West
        if any(place in location for place in ['flic en flac', 'tamarin', 'black river', 'rivière noire']):
            return 'West'
        
        # South
        if any(place in location for place in ['mahebourg', 'souillac', 'blue bay', 'savanne']):
            return 'South'
        
        # Default
        return 'Central'
    
    def save(self, path_prefix='models/price_model/mauritius'):
        """Save regional models to disk"""
        for region, model_info in self.models.items():
            path = f"{path_prefix}_{region.lower()}.pkl"
            with open(path, 'wb') as f:
                pickle.dump(model_info, f)
        
        # Save model metadata
        metadata = {
            'regions': list(self.models.keys()),
            'features': {region: info['features'] for region, info in self.models.items()},
            'performance': {region: info['performance'] for region, info in self.models.items()}
        }
        
        with open(f"{path_prefix}_metadata.json", 'w') as f:
            import json
            json.dump(metadata, f)
            
        return self
    
    @classmethod
    def load(cls, path_prefix='models/price_model/mauritius'):
        """Load regional models from disk"""
        import json
        import os
        
        model = cls()
        
        # Load metadata to determine which regional models to load
        try:
            with open(f"{path_prefix}_metadata.json", 'r') as f:
                metadata = json.load(f)
                
            for region in metadata['regions']:
                path = f"{path_prefix}_{region.lower()}.pkl"
                if os.path.exists(path):
                    with open(path, 'rb') as f:
                        model.models[region] = pickle.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            # Fallback: try to load each region directly
            regions = ['North', 'East', 'Central', 'West', 'South']
            for region in regions:
                path = f"{path_prefix}_{region.lower()}.pkl"
                if os.path.exists(path):
                    with open(path, 'rb') as f:
                        model.models[region] = pickle.load(f)
        
        return model