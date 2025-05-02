# PropCentre AI/ML System Initialization Script - PowerShell version
Write-Host "🚀 Starting PropCentre AI/ML Initialization..." -ForegroundColor Cyan

# 1. Check Python installation
Write-Host "🔍 Checking Python installation..." -ForegroundColor Cyan
if (!(Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python not found. Please install Python 3.8+ and try again." -ForegroundColor Red
    exit
}

# 2. Create virtual environment if it doesn't exist
if (!(Test-Path "venv")) {
    Write-Host "🐍 Creating Python virtual environment..." -ForegroundColor Cyan
    python -m venv venv
    Write-Host "✅ Virtual environment created." -ForegroundColor Green
}

# 3. Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# 4. Install Python requirements
Write-Host "📦 Installing Python dependencies..." -ForegroundColor Cyan
if (Test-Path "backend\requirements.txt") {
    pip install -r backend\requirements.txt
    Write-Host "✅ Python dependencies installed." -ForegroundColor Green
} else {
    Write-Host "❌ requirements.txt not found. Creating it..." -ForegroundColor Yellow
    $requirements = @"
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
"@
    Set-Content -Path "backend\requirements.txt" -Value $requirements
    pip install -r backend\requirements.txt
    Write-Host "✅ requirements.txt created and dependencies installed." -ForegroundColor Green
}

# 5. Create necessary directories
Write-Host "📁 Creating directories..." -ForegroundColor Cyan
$directories = @(
    "backend\data",
    "backend\models\price_model",
    "backend\models\recommender",
    "backend\models\trained",
    "backend\uploads\properties",
    "backend\logs"
)
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "✅ Directories created." -ForegroundColor Green

# 6. Generate sample property data if it doesn't exist
Write-Host "🏠 Generating sample property data..." -ForegroundColor Cyan
if (!(Test-Path "backend\data\sample_properties.csv")) {
    python backend\data\sample_properties.py
    Write-Host "✅ Sample property data generated." -ForegroundColor Green
} else {
    Write-Host "✅ Sample property data already exists." -ForegroundColor Green
}

# 7. Initialize and train ML models
Write-Host "🧠 Initializing ML models..." -ForegroundColor Cyan
python backend\scripts\initialize_ml.py --data backend\data\sample_properties.csv
Write-Host "✅ ML models initialized and trained." -ForegroundColor Green

# 8. Set up environment variables if they don't exist
if (!(Test-Path "backend\.env")) {
    Write-Host "🔑 Creating environment variables file..." -ForegroundColor Cyan
    $envContent = @"
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
"@
    Set-Content -Path "backend\.env" -Value $envContent
    Write-Host "✅ Environment variables file created." -ForegroundColor Green
}

# 9. Check if Node.js and npm are available
Write-Host "🔍 Checking Node.js and npm installation..." -ForegroundColor Cyan
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm not found. Please install Node.js and npm for the frontend." -ForegroundColor Yellow
} else {
    # 10. Install frontend dependencies if needed
    Write-Host "📦 Checking frontend dependencies..." -ForegroundColor Cyan
    if (!(Test-Path "frontend\node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
        Set-Location -Path "frontend"
        npm install
        Set-Location -Path ".."
        Write-Host "✅ Frontend dependencies installed." -ForegroundColor Green
    } else {
        Write-Host "✅ Frontend dependencies already installed." -ForegroundColor Green
    }
}

# 11. Final setup instructions
Write-Host "`n✨ PropCentre AI/ML system initialization complete! ✨" -ForegroundColor Magenta
Write-Host "`nTo run the complete system:" -ForegroundColor White
Write-Host "1. Start the backend: cd backend && uvicorn api.main:app --reload" -ForegroundColor Cyan
Write-Host "2. Start the frontend: cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host "`nThe ML models are now ready to provide recommendations, price predictions, and analytics!" -ForegroundColor Green