#!/bin/bash

# PropCentre AI/ML System Initialization Script
# This script sets up and initializes all AI/ML components for the PropCentre system

# Set working directory to project root
cd "$(dirname "$0")"

echo "🚀 Starting PropCentre AI/ML Initialization..."

# 1. Check Python installation
echo "🔍 Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.8+ and try again."
    exit 1
fi

# 2. Create and activate virtual environment (optional)
if [ ! -d "venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created."
fi

# Source the virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    echo "🔄 Activating virtual environment..."
    source venv/bin/activate
fi

# 3. Install Python requirements
echo "📦 Installing Python dependencies..."
if [ -f "backend/requirements.txt" ]; then
    pip install -r backend/requirements.txt
    echo "✅ Python dependencies installed."
else
    echo "❌ requirements.txt not found. Creating it..."
    cat > backend/requirements.txt << 'EOF'
# Web Framework
fastapi==0.103.1
uvicorn[standard]==0.23.2
pydantic==2.3.0
python-multipart==0.0.6
python-dotenv==1.0.0

# Database
motor==3.3.1
pymongo==4.5.0
sqlalchemy==2.0.20
psycopg2-binary==2.9.7
prisma==0.9.1

# Data Processing
pandas==2.1.0
numpy==1.25.2
openpyxl==3.1.2

# ML Libraries
scikit-learn==1.3.0
xgboost==1.7.6
lightgbm==4.0.0
matplotlib==3.7.3
seaborn==0.12.2

# Geospatial
geopandas==0.13.2
shapely==2.0.1
geopy==2.3.0

# Web Scraping
requests==2.31.0
beautifulsoup4==4.12.2
lxml==4.9.3

# Utils
tqdm==4.66.1
joblib==1.3.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
httpx==0.25.0
aiohttp==3.8.5
tenacity==8.2.3
colorama==0.4.6
EOF
    pip install -r backend/requirements.txt
    echo "✅ requirements.txt created and dependencies installed."
fi

# 4. Create necessary directories
echo "📁 Creating directories..."
mkdir -p backend/data
mkdir -p backend/models/price_model
mkdir -p backend/models/recommender
mkdir -p backend/models/trained
mkdir -p backend/uploads/properties
mkdir -p backend/logs

# 5. Generate sample property data if it doesn't exist
echo "🏠 Generating sample property data..."
if [ ! -f backend/data/sample_properties.csv ]; then
    python backend/data/sample_properties.py
    echo "✅ Sample property data generated."
else
    echo "✅ Sample property data already exists."
fi

# 6. Initialize and train ML models
echo "🧠 Initializing ML models..."
python backend/scripts/initialize_ml.py --data backend/data/sample_properties.csv
echo "✅ ML models initialized and trained."

# 7. Set up environment variables if they don't exist
if [ ! -f backend/.env ]; then
    echo "🔑 Creating environment variables file..."
    cat > backend/.env << 'EOF'
# Server settings
PORT=8080
NODE_ENV=development

# Database settings
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/propcentre
MONGODB_URL=mongodb://localhost:27017/propcentre

# JWT settings
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h

# File uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
EOF
    echo "✅ Environment variables file created."
fi

# 8. Check if Node.js and npm are available
echo "🔍 Checking Node.js and npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js and npm for the frontend."
else
    # 9. Install frontend dependencies if needed
    echo "📦 Checking frontend dependencies..."
    if [ ! -d frontend/node_modules ]; then
        echo "Installing frontend dependencies..."
        (cd frontend && npm install)
        echo "✅ Frontend dependencies installed."
    else
        echo "✅ Frontend dependencies already installed."
    fi
fi

# 10. Final setup instructions
echo ""
echo "✨ PropCentre AI/ML system initialization complete! ✨"
echo ""
echo "To run the complete system:"
echo "1. Start the backend: cd backend && uvicorn api.main:app --reload"
echo "2. Start the frontend: cd frontend && npm run dev"
echo ""
echo "The ML models are now ready to provide recommendations, price predictions, and analytics!"