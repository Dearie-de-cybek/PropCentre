import React, { useState, useEffect } from 'react';
import { ListFilter } from 'lucide-react';
import recommendationService from '../services/recommendationService';
import PropertyCard from './PropCard';

const SimilarPropertiesComponent = ({ propertyId }) => {
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referenceProperty, setReferenceProperty] = useState(null);

  useEffect(() => {
    if (propertyId) {
      fetchSimilarProperties();
    }
  }, [propertyId]);

  const fetchSimilarProperties = async () => {
    try {
      setLoading(true);
      const response = await recommendationService.getSimilarProperties(propertyId);
      
      if (response.data) {
        setSimilarProperties(response.data.similar_properties || []);
        setReferenceProperty(response.data.reference_property || null);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching similar properties:', err);
      setError('Failed to load similar properties. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
      <div className="border-b border-[#404040] p-4">
        <h2 className="text-white font-bold text-lg flex items-center">
          <ListFilter size={20} className="mr-2 text-amber-500" />
          AI-Powered Similar Properties
        </h2>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <button
              onClick={fetchSimilarProperties}
              className="bg-[#404040] text-white px-4 py-2 rounded hover:bg-[#505050]"
            >
              Try Again
            </button>
          </div>
        ) : similarProperties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No similar properties found.</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-white">
                Our AI analyzed {referenceProperty?.title || 'this property'} and found {similarProperties.length} similar properties:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarProperties.map((property) => (
                <div key={property.property_id} className="relative">
                  <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs px-2 py-1 rounded-full z-10">
                    {Math.round(property.similarity_score * 100)}% Similar
                  </div>
                  <PropertyCard
                    id={property.property_id}
                    imageUrl={property.image_url || "../public/images/property-placeholder.jpg"}
                    address={property.location}
                    price={property.price}
                    bedrooms={property.bedrooms || 0}
                    bathrooms={property.bathrooms || 0}
                    toilets={property.toilets || 0}
                    compact={true}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-[#0D0D0D] p-4 rounded-lg">
              <h3 className="text-white text-base font-semibold mb-2">How We Find Similar Properties</h3>
              <p className="text-gray-300 text-sm">
                Our AI analyzes multiple property features including location, size, amenities, and price point to identify 
                properties that most closely match your interests. Similarity scores represent overall match quality 
                based on these factors.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SimilarPropertiesComponent;