```markdown
# PropCentre: Real Estate Price Recommendation System

## ⚠️ IMPORTANT WARNING ⚠️
**IF THE CODE FAILS TO RUN**  Compression can cause critical files to be deleted or corrupted, particularly with the ML models and data files. Many features will not work correctly if you use a ZIP file.

For the complete, functional project, check the Git repository.

## Getting Started

### Prerequisites
- Python 3.8 or higher
- Node.js 16.x or higher
- Postgres 18
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Dearie-de-cybek/PropCentre.git
cd PropCentre
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd ../frontend
npm install
```

4. Configure environment variables:
   - Create a `.env` file in the backend directory based on `.env.example`
   - Set your DB connection string and other required variables

### Running the Application

1. Start the backend server:
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python app.py
```

2. In a new terminal, start the frontend:
```bash
cd frontend
npm start
```

3. Access the application:
   - Open your browser and navigate to `http://localhost:3000`

## Features

- AI-powered property recommendations
- Price prediction using region-specific models
- Neighborhood analysis with location-based scoring
- Property comparison tool
- User preference management
- Interactive property search



## Contact

For any questions or issues, please open a GitHub issue
```

Link to figma repo 
https://www.figma.com/design/z9LwuWES1z1tUIdN8ksWMx/PropCentre?node-id=0-1&p=f&t=q3hPrdLIVyYbKC6U-0