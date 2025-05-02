#!/usr/bin/env python3
"""
PropCentre ML Model Training Script

This script runs the complete pipeline:
1. Generate sample property data
2. Preprocess the data
3. Train and save ML models
"""

import os
import sys
import logging
import time
import subprocess
import importlib.util
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def ensure_module_exists(module_path):
    """Check if a module file exists and return its absolute path."""
    file_path = Path(module_path)
    if not file_path.exists():
        logger.error(f"Module file not found: {module_path}")
        return None
    return str(file_path.absolute())

def run_script(script_path, *args):
    """Run a Python script as a subprocess."""
    cmd = [sys.executable, script_path] + list(args)
    logger.info(f"Running command: {' '.join(cmd)}")
    
    try:
        process = subprocess.run(
            cmd, 
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        logger.info(process.stdout)
        if process.stderr:
            logger.warning(process.stderr)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Command failed with exit code {e.returncode}")
        logger.error(e.stderr)
        return False

def import_and_run_function(module_path, function_name, *args, **kwargs):
    """Import a module and run a function from it."""
    try:
        spec = importlib.util.spec_from_file_location("module", module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        
        if hasattr(module, function_name):
            func = getattr(module, function_name)
            return func(*args, **kwargs)
        else:
            logger.error(f"Function {function_name} not found in module {module_path}")
            return False
    except Exception as e:
        logger.error(f"Error importing/running {module_path}: {e}")
        return False

def create_directories():
    """Create necessary directories for the pipeline."""
    dirs = [
        'backend/data',
        'models/price_model',
        'models/recommender'
    ]
    
    for directory in dirs:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Ensured directory exists: {directory}")

def main():
    start_time = time.time()
    logger.info("===== PropCentre ML Model Training =====")
    
    # Step 0: Create directories
    create_directories()
    
    # Step 1: Generate sample property data
    sample_data_script = ensure_module_exists("backend/ml/data/generate_sample_data.py")
    if not sample_data_script:
        # If the sample data generator is not found, try the one from this package
        sample_data_script = "generate_sample_data.py"
        if not os.path.exists(sample_data_script):
            logger.error("Could not find sample data generator script.")
            sys.exit(1)
    
    logger.info("Generating sample property data...")
    if not run_script(sample_data_script):
        logger.error("Sample data generation failed. Exiting.")
        sys.exit(1)
    
    # Step 2: Preprocess the data
    logger.info("Preprocessing property data...")
    preprocess_script = "data_preprocessing.py"
    if not run_script(preprocess_script):
        logger.error("Data preprocessing failed. Exiting.")
        sys.exit(1)
    
    # Step 3: Train the ML models
    logger.info("Training ML models...")
    initialize_script = "initialize_ml_models.py"
    if not run_script(initialize_script, "--data", "backend/data/processed_properties.csv", "--force-retrain"):
        logger.error("Model training failed. Exiting.")
        sys.exit(1)
    
    # Done!
    elapsed_time = time.time() - start_time
    logger.info(f"Training completed in {elapsed_time:.2f} seconds")
    logger.info("===== PropCentre ML Model Training Complete =====")

if __name__ == "__main__":
    main()