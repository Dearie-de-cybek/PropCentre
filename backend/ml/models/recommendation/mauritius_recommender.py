
import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import pickle

class MauritiusRecommender:
    """Content-based recommendation system for Mauritius properties"""
    
    def __init__(self, config=None):
        self.config = config or {}
        self.content_similarity = None
        self.property_features = None
        self.feature_weights = {
            'price': 0.2,
            'bedrooms': 0.1,
            'bathrooms': 0.05,
            'property_type_encoded': 0.15,
            'area_size': 0.1,
            'location_score': 0.25,
            'dist_to_beach': 0.15
        }
        
    def fit(self, properties_df):
        """Train recommendation model on Mauritius properties"""
        print("Training Mauritius property recommender...")
        
        # Select and prepare features
        features = [col for col in self.feature_weights.keys() if col in properties_df.columns]
        
        # Store property IDs
        self.property_ids = properties_df['property_id'].values if 'property_id' in properties_df.columns else None
        
        # Normalize features
        scaler = StandardScaler()
        self.property_features = scaler.fit_transform(properties_df[features])
        
        # Apply weights to features
        weighted_features = np.copy(self.property_features)
        for i, feature in enumerate(features):
            if feature in self.feature_weights:
                weighted_features[:, i] *= self.feature_weights[feature]
        
        # Compute similarity matrix
        self.content_similarity = cosine_similarity(weighted_features)
        
        # Store feature names and properties dataframe
        self.features = features
        self.properties_df = properties_df
        
        print(f"Recommender trained on {len(properties_df)} Mauritius properties")
        return self
    
    def recommend_similar(self, property_id, n_recommendations=5):
        """Find similar properties to a given property"""
        if self.content_similarity is None:
            raise ValueError("Model has not been fitted")
            
        if self.property_ids is None:
            raise ValueError("No property IDs available")
        
        # Find index of the target property
        try:
            idx = np.where(self.property_ids == property_id)[0][0]
        except IndexError:
            raise ValueError(f"Property ID {property_id} not found")
        
        # Get similarity scores
        similarity_scores = self.content_similarity[idx]
        
        # Sort properties by similarity
        similar_indices = np.argsort(similarity_scores)[::-1]
        
        # Filter out the input property and get top N
        similar_indices = [i for i in similar_indices if i != idx][:n_recommendations]
        
        # Get property details
        similar_properties = self.properties_df.iloc[similar_indices].copy()
        similar_properties['similarity'] = similarity_scores[similar_indices]
        
        return similar_properties
    
    def recommend_from_preferences(self, preferences, n_recommendations=5):
        """Recommend properties based on user preferences"""
        if self.content_similarity is None or self.property_features is None:
            raise ValueError("Model has not been fitted")
        
        # Create a virtual property based on preferences
        virtual_property = np.zeros(len(self.features))
        
        for i, feature in enumerate(self.features):
            if feature == 'price':
                # Normalize price based on preference
                if 'max_price' in preferences:
                    # Set preferred price to 80% of max budget
                    virtual_property[i] = preferences['max_price'] * 0.8
                else:
                    # Default to median price
                    virtual_property[i] = np.median(self.property_features[:, i])
            
            elif feature == 'bedrooms':
                virtual_property[i] = preferences.get('min_bedrooms', 2)
            
            elif feature == 'bathrooms':
                virtual_property[i] = preferences.get('min_bathrooms', 1)
            
            elif feature == 'property_type_encoded':
                if 'property_type' in preferences:
                    # Map text property type to encoded value
                    type_map = {
                        'apartment': 0,
                        'house': 1,
                        'villa': 2,
                        'land': 3
                    }
                    virtual_property[i] = type_map.get(preferences['property_type'].lower(), 1)
                else:
                    virtual_property[i] = 1  # Default to house
            
            elif feature == 'area_size':
                virtual_property[i] = preferences.get('min_area', 100)
            
            elif feature == 'location_score':
                # Higher score for premium locations
                if 'premium_location' in preferences and preferences['premium_location']:
                    virtual_property[i] = 80  # High score
                else:
                    virtual_property[i] = 50  # Average score
            
            elif feature == 'dist_to_beach':
                if 'beachfront' in preferences and preferences['beachfront']:
                    virtual_property[i] = 0.2  # Very close to beach
                else:
                    virtual_property[i] = 2.0  # Average distance
        
        # Apply feature weights
        for i, feature in enumerate(self.features):
            if feature in self.feature_weights:
                virtual_property[i] *= self.feature_weights[feature]
        
        # Calculate similarity to virtual property
        similarities = cosine_similarity([virtual_property], self.property_features)[0]
        
        # Filter properties based on hard constraints
        mask = np.ones(len(similarities), dtype=bool)
        
        if 'max_price' in preferences:
            price_idx = self.features.index('price')
            mask &= (self.property_features[:, price_idx] <= preferences['max_price'])
        
        if 'min_bedrooms' in preferences:
            bed_idx = self.features.index('bedrooms')
            mask &= (self.property_features[:, bed_idx] >= preferences['min_bedrooms'])
        
        # Apply mask and sort by similarity
        masked_similarities = similarities.copy()
        masked_similarities[~mask] = -1
        
        # Get top indices
        top_indices = np.argsort(masked_similarities)[::-1][:n_recommendations]
        
        # Get recommendations
        recommendations = self.properties_df.iloc[top_indices].copy()
        recommendations['score'] = masked_similarities[top_indices]
        
        return recommendations
    
    def save(self, path='models/recommender/mauritius_recommender.pkl'):
        """Save model to disk"""
        with open(path, 'wb') as f:
            pickle.dump({
                'content_similarity': self.content_similarity,
                'property_features': self.property_features,
                'features': self.features,
                'feature_weights': self.feature_weights,
                'property_ids': self.property_ids
            }, f)
        
        return self
    
    @classmethod
    def load(cls, path='models/recommender/mauritius_recommender.pkl'):
        """Load model from disk"""
        model = cls()
        
        with open(path, 'rb') as f:
            data = pickle.load(f)
            
        model.content_similarity = data['content_similarity']
        model.property_features = data['property_features']
        model.features = data['features']
        model.feature_weights = data['feature_weights']
        model.property_ids = data['property_ids']
        
        return model