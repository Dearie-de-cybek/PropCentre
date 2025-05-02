# backend/api/routes/analytics.py
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Dict, Any
import pandas as pd

from ml.models.price_predication.mauritius_price_model import MauritiusPriceModel
from ml.features.mauritius_locations import MauritiusLocationFeatures
from api.dependencies import get_price_model, get_location_features, get_db

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.post("/predict-price")
async def predict_property_price(
    property_data: Dict[str, Any],
    price_model: MauritiusPriceModel = Depends(get_price_model)
):
    """Predict property price based on provided features."""
    try:
        prediction = price_model.predict(property_data)
        return {
            "data": {
                "predicted_price": prediction.get("predicted_price"),
                "confidence": prediction.get("confidence"),
                "region": prediction.get("region")
            },
            "message": "Price prediction successful",
            "statusCode": 200
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/location/{location}")
async def get_location_analysis(
    location: str,
    location_features: MauritiusLocationFeatures = Depends(get_location_features),
    db = Depends(get_db)
):
    """Get comprehensive location analysis for a specific location in Mauritius."""
    try:
        # Get location data from database or generate on-the-fly
        location_data = await db.location_analytics.find_one({"location": location})
        
        # If no data in database, generate it
        if not location_data:
            # Create a sample property in this location to analyze
            sample_property = {
                "location": location,
                "latitude": None,
                "longitude": None
            }
            
            # Generate features for this location
            features_df = location_features.generate(pd.DataFrame([sample_property]))
            
            if len(features_df) > 0:
                row = features_df.iloc[0]
                location_score = float(row.get("location_score", 70))
                district = row.get("district", "Unknown")
                is_tourist_area = bool(row.get("is_tourist_area", False))
                
                # Get property data for this location
                properties = await db.properties.find(
                    {"location": {"$regex": location, "$options": "i"}},
                    {"price": 1, "createdAt": 1}
                ).to_list(100)
                
                if properties:
                    # Calculate average price and trends
                    prices = [p.get("price", 0) for p in properties]
                    average_price = sum(prices) / len(prices)
                    
                    # Generate insights
                    insights = [
                        f"Properties in {location} have an average price of ${average_price:,.2f}.",
                        f"This area is in the {district} district of Mauritius.",
                        "This location has good investment potential based on historical price trends."
                    ]
                    
                    if is_tourist_area:
                        insights.append("This is a popular tourist area, making it suitable for holiday rentals.")
                    
                    # Save to database for future use
                    await db.location_analytics.insert_one({
                        "location": location,
                        "district": district,
                        "average_price": average_price,
                        "location_score": location_score,
                        "tourism_rating": 8 if is_tourist_area else 5,
                        "development_growth": 4.2,
                        "insights": insights,
                        "last_updated": pd.Timestamp.now()
                    })
                    
                    location_data = {
                        "location": location,
                        "district": district,
                        "average_price": average_price,
                        "location_score": location_score,
                        "tourism_rating": 8 if is_tourist_area else 5,
                        "development_growth": 4.2,
                        "beach_proximity": row.get("dist_to_beach", 5),
                        "price_trend": 3.5,  # Placeholder
                        "rental_yield": 5.2,  # Placeholder
                        "investment_rating": 4,  # 1-5 scale
                        "investment_recommendation": "Good long-term investment potential",
                        "insights": insights
                    }
        
        # If still no data, provide default
        if not location_data:
            location_data = {
                "location": location,
                "district": "Unknown",
                "average_price": 350000,
                "location_score": 65,
                "tourism_rating": 5,
                "development_growth": 3.0,
                "beach_proximity": 5.0,
                "price_trend": 2.5,
                "rental_yield": 4.5,
                "investment_rating": 3,
                "investment_recommendation": "Moderate investment potential",
                "insights": [
                    f"Limited data available for {location}.",
                    "Consider researching this area further before investing.",
                    "Consult with local real estate experts for more insights."
                ]
            }
        
        return {
            "data": location_data,
            "message": "Location analysis successful",
            "statusCode": 200
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/price-forecast")
async def get_price_forecast(
    location: str,
    propertyType: str = "all",
    months: int = Query(24, ge=6, le=60),
    db = Depends(get_db)
):
    """Get historical price data and forecasts for a location."""
    try:
        # Get historical price data from database
        pipeline = [
            {"$match": {"location": {"$regex": location, "$options": "i"}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m", "date": "$createdAt"}},
                "average_price": {"$avg": "$price"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        
        if propertyType != "all":
            pipeline[0]["$match"]["propertyType"] = propertyType
            
        historical_data = await db.properties.aggregate(pipeline).to_list(100)
        
        # Transform into time series
        time_series = []
        for point in historical_data:
            time_series.append({
                "date": point["_id"],
                "average_price": point["average_price"],
                "sales_volume": point["count"]
            })
            
        # If not enough data, add synthetic data
        if len(time_series) < 6:
            # Generate synthetic data based on average prices in the area
            base_price = 350000  # Default base price
            
            if time_series:
                latest_price = time_series[-1]["average_price"]
                base_price = latest_price
            
            # Get a few months before today
            current_date = pd.Timestamp.now()
            for i in range(1, 13):
                month_date = (current_date - pd.DateOffset(months=i)).strftime("%Y-%m")
                
                # Check if this month already exists
                if not any(p["date"] == month_date for p in time_series):
                    # Add synthetic point with small random variation
                    import random
                    random_factor = 1 + (random.random() * 0.04 - 0.02)  # ±2%
                    time_series.append({
                        "date": month_date,
                        "average_price": base_price * random_factor,
                        "sales_volume": random.randint(3, 15)
                    })
            
            # Sort by date
            time_series.sort(key=lambda x: x["date"])
        
        # Generate forecast
        forecast_data = []
        if time_series:
            last_price = time_series[-1]["average_price"]
            month_date = pd.Timestamp(time_series[-1]["date"])
            
            # Simple exponential growth model (could be replaced with actual ML forecast)
            growth_rate = 0.005  # 0.5% monthly growth
            
            for i in range(1, months + 1):
                month_date = month_date + pd.DateOffset(months=1)
                last_price = last_price * (1 + growth_rate)
                
                forecast_data.append({
                    "date": month_date.strftime("%Y-%m"),
                    "average_price": last_price,
                    "sales_volume": None,  # No sales volume for forecast
                    "is_forecast": True
                })
        
        # Combine historical and forecast data
        trends = time_series + forecast_data
        
        return {
            "data": {
                "location": location,
                "propertyType": propertyType,
                "trends": trends,
                "forecast_months": months
            },
            "message": "Price forecast generated successfully",
            "statusCode": 200
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/environmental/{location}")
async def get_environmental_data(location: str):
    """Get environmental data for a location including climate, terrain, and risks."""
    try:
        # In a real implementation, this would connect to weather/climate APIs
        # For now, returning static data based on location
        
        # Different data for different regions
        is_coastal = any(coastal in location.lower() for coastal in 
                        ["grand baie", "flic en flac", "blue bay", "trou aux biches", "tamarin"])
        
        is_central = any(central in location.lower() for central in 
                        ["curepipe", "quatre bornes", "phoenix", "vacoas", "rose hill"])
        
        is_northern = any(northern in location.lower() for northern in 
                         ["grand baie", "pereybere", "cap malheureux", "grand gaube"])
        
        # Adjust data based on region
        rainfall = 1200  # Default
        if is_central:
            rainfall = 1800  # More rainfall in central
        elif is_coastal:
            rainfall = 900  # Less rainfall on coast
            
        temp = 25  # Default
        if is_central:
            temp = 22  # Cooler in central
        elif is_northern:
            temp = 27  # Warmer in north
            
        beach_distance = 5.0  # Default
        if is_coastal:
            beach_distance = 0.3  # Very close on coast
            
        hurricane_risk = "Medium"  # Default
        if is_coastal:
            hurricane_risk = "High"
        elif is_central:
            hurricane_risk = "Low"
            
        environmental_data = {
            "weather": {
                "yearlyRainfall": rainfall,
                "averageTemperature": temp,
                "windSpeed": 12 if is_coastal else 8,
                "sunnyDays": 300 if is_coastal else 260,
            },
            "terrain": {
                "elevation": 10 if is_coastal else 550 if is_central else 100,
                "distanceToBeach": beach_distance,
                "soilType": "Sandy" if is_coastal else "Volcanic" if is_central else "Clay loam",
                "vegetation": "Coastal" if is_coastal else "Highland" if is_central else "Mixed"
            },
            "risks": {
                "floodRisk": "High" if is_coastal else "Low",
                "hurricaneRisk": hurricane_risk,
                "erosionRisk": "High" if is_coastal else "Low"
            }
        }
        
        return {
            "data": environmental_data,
            "message": "Environmental data retrieved successfully",
            "statusCode": 200
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))