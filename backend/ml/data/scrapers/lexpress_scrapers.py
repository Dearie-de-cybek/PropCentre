# backend/ml/data/scrapers/lexpress_scraper.py
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random

class LexpressScraper:
    """Scraper for Lexpress Property - Mauritius's largest property portal"""
    
    def __init__(self, config):
        self.base_url = config.get('base_url', 'https://property.lexpressproperty.com/en/buy/house/')
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
    def scrape(self, pages=10):
        """Scrape property listings from Lexpress Property"""
        properties = []
        
        for page in range(1, pages + 1):
            url = f"{self.base_url}?page={page}"
            
            try:
                response = requests.get(url, headers=self.headers)
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Lexpress Property specific selectors
                listings = soup.find_all('div', class_='property-item')
                
                for listing in listings:
                    property_data = {
                        'title': listing.find('h2', class_='property-title').text.strip(),
                        'price': self._extract_price(listing.find('span', class_='price').text.strip()),
                        'location': listing.find('div', class_='location').text.strip(),
                        'bedrooms': self._extract_number(listing.find('span', class_='bedrooms')),
                        'bathrooms': self._extract_number(listing.find('span', class_='bathrooms')),
                        'property_type': self._extract_property_type(listing),
                        'area_size': self._extract_area(listing.find('span', class_='area')),
                        'area_size_unit': 'sqm' if 'm²' in listing.find('span', class_='area').text else 'sqft',
                        'url': self.base_url + listing.find('a')['href'],
                        'source': 'Lexpress Property',
                        'country': 'Mauritius'
                    }
                    properties.append(property_data)
                
                # Be respectful with scraping
                time.sleep(random.uniform(2, 5))
                
            except Exception as e:
                print(f"Error scraping page {page}: {e}")
                continue
        
        return pd.DataFrame(properties)
    
    def _extract_price(self, price_text):
        """Extract numeric price from text"""
        # Handle Mauritian Rupees format (e.g., "Rs 5,000,000")
        price_text = price_text.replace('Rs', '').replace(',', '').strip()
        try:
            return float(price_text)
        except ValueError:
            return None
    
    def _extract_number(self, element):
        """Extract numeric value from element"""
        if element is None:
            return None
        
        text = element.text.strip()
        try:
            return int(text)
        except ValueError:
            return None
    
    def _extract_property_type(self, listing):
        """Extract property type from listing"""
        type_element = listing.find('span', class_='property-type')
        if type_element:
            return type_element.text.strip()
        else:
            # Try to infer from title
            title = listing.find('h2', class_='property-title').text.lower()
            if 'apartment' in title:
                return 'Apartment'
            elif 'villa' in title:
                return 'Villa'
            elif 'house' in title:
                return 'House'
            elif 'land' in title:
                return 'Land'
            else:
                return 'Other'
    
    def _extract_area(self, area_element):
        """Extract area size from element"""
        if area_element is None:
            return None
        
        text = area_element.text.strip()
        try:
            # Extract numeric part
            return float(''.join(filter(lambda x: x.isdigit() or x == '.', text)))
        except ValueError:
            return None