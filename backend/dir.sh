# Create necessary directories
mkdir -p data/external/mauritius_gis
mkdir -p models/price_model
mkdir -p models/recommender

# Create placeholder GeoJSON and CSV files
# Note: In a real application, these would contain actual data

# Create a minimal districts GeoJSON file
cat > data/external/mauritius_gis/districts.geojson << 'EOF'
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "district_name": "Port Louis",
        "population": 120000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[57.498, -20.16], [57.51, -20.16], [57.51, -20.17], [57.498, -20.17], [57.498, -20.16]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "district_name": "Black River",
        "population": 80000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[57.37, -20.32], [57.39, -20.32], [57.39, -20.34], [57.37, -20.34], [57.37, -20.32]]]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "district_name": "Flacq",
        "population": 138000
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [[[57.71, -20.19], [57.73, -20.19], [57.73, -20.21], [57.71, -20.21], [57.71, -20.19]]]
      }
    }
  ]
}
EOF

# Create a beaches CSV file
cat > data/external/mauritius_gis/beaches.csv << 'EOF'
name,latitude,longitude,description
Flic en Flac,-20.2789,57.3641,Popular beach on the west coast
Belle Mare,-20.1986,57.7645,Long white sand beach on the east coast
Trou aux Biches,-20.0361,57.5461,Beautiful beach in the north
Le Morne,-20.4558,57.3089,Beach near the UNESCO heritage site
EOF

# Create a cities CSV file
cat > data/external/mauritius_gis/cities.csv << 'EOF'
name,latitude,longitude,population
Port Louis,-20.1619,57.5012,155000
Curepipe,-20.3189,57.5266,85000
Quatre Bornes,-20.2638,57.4791,80000
Vacoas,-20.2983,57.4783,110000
Grand Baie,-20.0188,57.5802,12000
EOF

# Create an attractions CSV file
cat > data/external/mauritius_gis/attractions.csv << 'EOF'
name,latitude,longitude,type,popularity
Chamarel Seven Colored Earth,-20.4275,57.3792,Natural,9
Black River Gorges National Park,-20.4267,57.4478,Natural,10
Mauritius Botanical Garden,-20.1058,57.5806,Natural,8
Blue Bay Marine Park,-20.4472,57.7183,Natural,9
Le Morne Brabant,-20.4558,57.3089,Cultural,10
EOF

# Create placeholder model files
mkdir -p models/price_model/mauritius
echo "# Placeholder for price model" > models/price_model/mauritius_metadata.json

touch models/recommender/mauritius_recommender.pkl

echo "Data directory structure and placeholder files created successfully"