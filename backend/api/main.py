# backend/api/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.dependencies import initialize_dependencies
from api.routes import analytics, recommendations, auth, properties

app = FastAPI(title="PropCentre API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize routes
#app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(recommendations.router)
app.include_router(analytics.router)

@app.on_event("startup")
async def startup_event():
    await initialize_dependencies()

@app.get("/")
async def root():
    return {"message": "PropCentre API is running"}