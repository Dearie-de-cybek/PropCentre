import pandas as pd
import numpy as np
import geopandas as gpd
from shapely.geometry import Point

class MauritiusLocationFeatures:
    """Generate Mauritius-specific location features"""
    
    def __init__(self, config):
        self.config = config
        self.district_data = gpd.read_file(config.get('mauritius_districts_path', 'data/external/mauritius_gis/districts.geojson'))
        self.beaches = pd.read_csv(config.get('mauritius_beaches_path', 'data/external/mauritius_gis/beaches.csv'))
        self.city_centers = pd.read_csv(config.get('mauritius_cities_path', 'data/external/mauritius_gis/cities.csv'))
        self.tourist_attractions = pd.read_csv(config.get('mauritius_attractions_path', 'data/external/mauritius_gis/attractions.csv'))
        
    def generate(self, properties_df):
        """Generate location-based features for Mauritius properties"""
        # Create geometry points for spatial operations
        if 'latitude' in properties_df.columns and 'longitude' in properties_df.columns:
            geometry = [Point(xy) for xy in zip(properties_df['longitude'], properties_df['latitude'])]
            gdf = gpd.GeoDataFrame(properties_df, geometry=geometry)
            
            # Join with district data
            gdf = gpd.sjoin(gdf, self.district_data, how="left", op="within")
            
            # Calculate distance to nearest beach
            gdf['dist_to_beach'] = gdf.apply(lambda row: self._distance_to_nearest(
                row['longitude'], row['latitude'], self.beaches
            ), axis=1)
            
            # Calculate distance to nearest city center
            gdf['dist_to_city'] = gdf.apply(lambda row: self._distance_to_nearest(
                row['longitude'], row['latitude'], self.city_centers
            ), axis=1)
            
            # Calculate distance to nearest tourist attraction
            gdf['dist_to_attraction'] = gdf.apply(lambda row: self._distance_to_nearest(
                row['longitude'], row['latitude'], self.tourist_attractions
            ), axis=1)
            
            # Create location value index (higher score for prime locations)
            gdf['location_score'] = self._calculate_location_score(gdf)
            
            # Create boolean indicators for special locations
            gdf['is_beachfront'] = gdf['dist_to_beach'] < 0.5  # Within 500m of beach
            gdf['is_urban'] = gdf['dist_to_city'] < 3.0  # Within 3km of city center
            
            # Remove geometry column for regular DataFrame
            result = pd.DataFrame(gdf.drop(columns='geometry'))
            return result
        else:
            # If no coordinates, use district mapping based on text location
            properties_df['district'] = properties_df['location'].apply(self._map_location_to_district)
            properties_df['region'] = properties_df['district'].map(self._district_to_region_map())
            properties_df['is_tourist_area'] = properties_df['district'].apply(self._is_tourist_district)
            
            return properties_df
    
    def _distance_to_nearest(self, lon, lat, points_df):
        """Calculate distance in km to nearest point"""
        if pd.isna(lon) or pd.isna(lat):
            return None
            
        from geopy.distance import geodesic
        
        min_dist = float('inf')
        for _, point in points_df.iterrows():
            dist = geodesic((lat, lon), (point['latitude'], point['longitude'])).kilometers
            if dist < min_dist:
                min_dist = dist
                
        return min_dist
    
    def _calculate_location_score(self, gdf):
        """Calculate location desirability score (0-100)"""
        # Normalize distances
        beach_score = 1 - np.clip(gdf['dist_to_beach'] / 10.0, 0, 1)  # Higher score closer to beach
        city_score = 1 - np.clip(gdf['dist_to_city'] / 15.0, 0, 1)    # Higher score closer to city
        
        # District premium (based on average property values)
        district_premium = gdf['district_name'].map(self._district_premium_map())
        
        # Weighted score (beach proximity matters more in Mauritius)
        score = (beach_score * 0.4 + city_score * 0.3 + district_premium * 0.3) * 100
        return score.clip(0, 100)
    
    def _map_location_to_district(self, location):
        """Map location text to Mauritius district"""
        location = str(location).lower()
        
        # Direct district mentions
        if 'port louis' in location:
            return 'Port Louis'
        elif 'plaines wilhems' in location or 'curepipe' in location or 'quatre bornes' in location:
            return 'Plaines Wilhems'
        elif 'black river' in location or 'rivière noire' in location:
            return 'Black River'
        elif 'flacq' in location:
            return 'Flacq'
        elif 'grand port' in location:
            return 'Grand Port'
        elif 'moka' in location:
            return 'Moka'
        elif 'pamplemousses' in location:
            return 'Pamplemousses'
        elif 'rivière du rempart' in location:
            return 'Rivière du Rempart'
        elif 'savanne' in location:
            return 'Savanne'
        
        # Common locations mapped to districts
        common_locations = {
            'grand baie': 'Rivière du Rempart',
            'flic en flac': 'Black River',
            'tamarin': 'Black River',
            'trou aux biches': 'Pamplemousses',
            'belle mare': 'Flacq',
            'mahebourg': 'Grand Port',
            'rose hill': 'Plaines Wilhems',
            'beau bassin': 'Plaines Wilhems',
            'phoenix': 'Plaines Wilhems',
            'vacoas': 'Plaines Wilhems',
            'ebene': 'Plaines Wilhems',
            'triolet': 'Pamplemousses',
            'goodlands': 'Rivière du Rempart',
            'surinam': 'Savanne',
            'souillac': 'Savanne',
            'chemin grenier': 'Savanne',
            'le morne': 'Black River',
            'rivière noire': 'Black River',
            'trou d\'eau douce': 'Flacq'
        }
        
        for loc, district in common_locations.items():
            if loc in location:
                return district
        
        # Default if no match
        return 'Unknown'
    
    def _district_to_region_map(self):
        """Map Mauritius districts to regions"""
        return {
            'Port Louis': 'North',
            'Pamplemousses': 'North',
            'Rivière du Rempart': 'North',
            'Flacq': 'East',
            'Grand Port': 'East',
            'Moka': 'Central',
            'Plaines Wilhems': 'Central',
            'Black River': 'West',
            'Savanne': 'South',
            'Unknown': 'Unknown'
        }
    
    def _district_premium_map(self):
        """Return district premium scores based on property values"""
        return {
            'Port Louis': 0.65,
            'Pamplemousses': 0.70,
            'Rivière du Rempart': 0.85,  # Grand Baie is here
            'Flacq': 0.75,
            'Grand Port': 0.60,
            'Moka': 0.80,
            'Plaines Wilhems': 0.75,
            'Black River': 0.90,  # Luxury areas like Tamarin, Flic en Flac
            'Savanne': 0.50,
            'Unknown': 0.50
        }
    
    def _is_tourist_district(self, district):
        """Check if district is a tourist hotspot"""
        tourist_districts = ['Black River', 'Rivière du Rempart', 'Flacq']
        return district in tourist_districts