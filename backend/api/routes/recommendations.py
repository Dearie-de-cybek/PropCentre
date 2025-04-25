# backend/api/routes/recommendations.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
import pandas as pd

from ml.models.recommendation.mauritius_recommender import MauritiusRecommender
from api.dependencies import get_recommender_model, get_db

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.post("/suggest")
async def get_recommendations(
    preferences: Dict[str, Any],
    recommender: MauritiusRecommender = Depends(get_recommender_model),
    db = Depends(get_db),
    limit: int = Query(5, ge=1, le=20)
):
    """Get property recommendations based on user preferences."""
    try:
        # Get fresh property data from database
        properties_df = pd.DataFrame(db.properties.find({}, {'_id': 0}))
        
        # Generate recommendations
        if len(properties_df) > 0:
            # Ensure recommender has the latest property data
            recommender.properties_df = properties_df
            
            # Get recommendations
            recommendations = recommender.recommend_from_preferences(
                preferences,
                n_recommendations=limit
            )
            
            # Format response
            result = []
            for _, rec in recommendations.iterrows():
                result.append({
                    "property_id": str(rec["property_id"]),
                    "title": rec["title"],
                    "price": float(rec["price"]),
                    "location": rec["location"],
                    "bedrooms": int(rec["bedrooms"]) if not pd.isna(rec["bedrooms"]) else None,
                    "bathrooms": float(rec["bathrooms"]) if not pd.isna(rec["bathrooms"]) else None,
                    "property_type": rec["property_type"],
                    "image_url": rec.get("image_url", ""),
                    "score": float(rec["score"]),
                    "match_percentage": round(float(rec["score"]) * 100, 1)
                })
            
            return {"recommendations": result}
        else:
            raise HTTPException(status_code=404, detail="No properties found in database")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/similar/{property_id}")
async def get_similar_properties(
    property_id: str,
    recommender: MauritiusRecommender = Depends(get_recommender_model),
    db = Depends(get_db),
    limit: int = Query(5, ge=1, le=20)
):
    """Get similar properties to a given property."""
    try:
        # Get property data from database
        properties_df = pd.DataFrame(db.properties.find({}, {'_id': 0}))
        
        if len(properties_df) > 0:
            # Ensure recommender has the latest property data
            recommender.properties_df = properties_df
            
            # Find the property
            property_row = properties_df[properties_df["property_id"] == property_id]
            if property_row.empty:
                raise HTTPException(status_code=404, detail="Property not found")
            
            # Get similar properties
            similar_properties = recommender.recommend_similar(property_id, limit)
            
            # Format response
            result = []
            for _, prop in similar_properties.iterrows():
                result.append({
                    "property_id": str(prop["property_id"]),
                    "title": prop["title"],
                    "price": float(prop["price"]),
                    "location": prop["location"],
                    "bedrooms": int(prop["bedrooms"]) if not pd.isna(prop["bedrooms"]) else None,
                    "bathrooms": float(prop["bathrooms"]) if not pd.isna(prop["bathrooms"]) else None,
                    "property_type": prop["property_type"],
                    "image_url": prop.get("image_url", ""),
                    "similarity_score": float(prop["similarity"])
                })
            
            return {
                "reference_property": {
                    "property_id": property_id,
                    "title": property_row["title"].values[0],
                    "price": float(property_row["price"].values[0])
                },
                "similar_properties": result
            }
        else:
            raise HTTPException(status_code=404, detail="No properties found in database")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))