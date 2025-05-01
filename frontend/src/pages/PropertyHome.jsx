import React, { useState, useEffect } from "react";
import PropertyNavbar from "../components/PropertyNavbar";
import SponsoredAdCard from "../components/SponsporedAdCard";
import FilterSidebar from "../components/FilterSidebar";
import PropertyCard from "../components/PropCard";
import PropertyAPI from "../services/PropertyAPI";

const PropertyHome = () => {
  // State management
  const [viewType, setViewType] = useState("grid");
  const [properties, setProperties] = useState([]);
  const [sponsoredAds, setSponsoredAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    propertyType: '',
    listingType: '',
    city: '',
    furnished: false
  });

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
    fetchSponsoredAds();
  }, []);

  // Fetch properties with applied filters
  const fetchProperties = async (appliedFilters = {}) => {
    setLoading(true);
    try {
      const response = await PropertyAPI.getAllProperties({
        ...appliedFilters,
        status: 'available' // Only show available properties
      });
      setProperties(response.data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError("Failed to load properties. Please try again later.");
      setLoading(false);
    }
  };

  // Fetch sponsored ads
  const fetchSponsoredAds = async () => {
    try {
      // This would be a call to your sponsored ads API
      // For now, let's simulate with empty array - would be replaced with actual API
      setSponsoredAds([]);
    } catch (err) {
      console.error("Error fetching sponsored ads:", err);
    }
  };

  // Handle filter changes from sidebar
  const handleFilterChange = (newFilters) => {
    setFilters({...filters, ...newFilters});
    fetchProperties({...filters, ...newFilters});
  };

  // Sample sponsored ads data - would be replaced with API data
  const sampleSponsoredAds = [
    {
      id: 1,
      imageUrl: "../public/images/sponspored1.jpg",
      adTitle: "Premium Oceanview Property",
      description: "Exclusive beachfront living with panoramic views",
      advertiserName: "Luxury Realty",
      advertiserLogo: "../public/images/adlogo.png",
    },
    {
      id: 2,
      imageUrl: "../public/images/sponspored2.jpg",
      adTitle: "Modern Downtown Apartments",
      description: "Urban living redefined in the heart of the city",
      advertiserName: "Metro Properties",
      advertiserLogo: "../public/images/adlogo.png",
    },
    {
      id: 3,
      imageUrl: "../public/images/sponspored3.jpg",
      adTitle: "Riverside Luxury Condos",
      description: "Elegant waterfront living with spectacular views",
      advertiserName: "River Estates",
      advertiserLogo: "../public/images/adlogo.png",
    },
  ];

  // If no sponsored ads from API, use sample data temporarily
  const displaySponsoredAds = sponsoredAds.length > 0 ? sponsoredAds : sampleSponsoredAds;

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Navbar */}
      <PropertyNavbar />

      {/* Sponsored Ads Section */}
      <div className="py-8 px-6">
        <div className="flex justify-center gap-6 overflow-x-auto pb-4 mx-auto">
          {displaySponsoredAds.map((ad) => (
            <SponsoredAdCard
              key={ad.id}
              imageUrl={ad.imageUrl}
              adTitle={ad.adTitle}
              description={ad.description}
              advertiserName={ad.advertiserName}
              advertiserLogo={ad.advertiserLogo}
            />
          ))}
        </div>
      </div>

      {/* Separator Line */}
      <div className="border-t border-[#404040] mx-6"></div>

      {/* Main Content Section */}
      <div className="flex flex-col md:flex-row px-6 py-6">
        {/* Filter Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 mb-6 md:mb-0">
          <FilterSidebar onFilterChange={handleFilterChange} currentFilters={filters} />
        </div>

        {/* Property Listings */}
        <div className="flex-1 md:ml-6">
          {/* View Options and Sort */}
          <div className="flex justify-between items-center mb-6">
            {/* Results Count */}
            <div className="text-white">
              {loading ? 'Loading properties...' : `${properties.length} properties found`}
            </div>
            
            {/* View Toggle and Sort */}
            <div className="flex items-center">
              {/* View Toggle Container */}
              <div className="flex relative bg-[#404040] rounded-lg p-1 mr-4">
                {/* Animated Background Slider */}
                <div
                  className={`absolute top-1 bottom-1 w-10 bg-[#1E1E1E] rounded transition-all duration-300 ease-in-out ${
                    viewType === "grid" ? "left-1" : "left-[43px]"
                  }`}
                ></div>

                {/* Grid View Icon */}
                <button
                  onClick={() => setViewType("grid")}
                  className={`relative z-10 p-2 rounded-md transition-colors duration-300 ${
                    viewType === "grid" ? "text-[#f10000]" : "text-white"
                  }`}
                >
                  <img
                    src="../public/icons/4grid.svg"
                    alt="Grid View"
                    className="h-5 w-5"
                  />
                </button>

                {/* List View Icon */}
                <button
                  onClick={() => setViewType("list")}
                  className={`relative z-10 p-2 rounded-md transition-colors duration-300 ${
                    viewType === "list" ? "text-[#f10000]" : "text-white"
                  }`}
                >
                  <img
                    src="../public/icons/list.svg"
                    alt="List View"
                    className="h-5 w-5"
                  />
                </button>
              </div>

              {/* Separator */}
              <div className="h-6 w-px bg-white mx-3"></div>

              {/* Sort Dropdown */}
              <select 
                className="bg-[#404040] text-white p-2 rounded focus:outline-none"
                onChange={(e) => {
                  // Handle sorting based on selection
                  // Would need to implement sorting logic
                  console.log("Sort by:", e.target.value);
                }}
              >
                <option value="newest">Newest</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : (
            /* Property Grid/List */
            properties.length > 0 ? (
              <div
                className={`grid ${
                  viewType === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                } gap-8 bg-[#404040] p-6`}
              >
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    id={property.id}
                    imageUrl={property.images && property.images.length > 0 
                      ? property.images[0].imageUrl 
                      : "../public/images/property-placeholder.jpg"}
                    address={`${property.address}, ${property.city}`}
                    price={property.price}
                    bedrooms={property.bedrooms}
                    bathrooms={property.bathrooms}
                    toilets={property.toilets}
                    imageCount={property.images ? property.images.length : 0}
                  />
                ))}
              </div>
            ) : (
              /* No properties found */
              <div className="bg-[#404040] p-8 rounded-lg text-center">
                <h3 className="text-white text-xl mb-2">No properties found</h3>
                <p className="text-gray-400 mb-4">Try adjusting your search filters</p>
                <button 
                  className="bg-[#f10000] text-white px-4 py-2 rounded-lg"
                  onClick={() => {
                    setFilters({
                      minPrice: '',
                      maxPrice: '',
                      bedrooms: '',
                      bathrooms: '',
                      propertyType: '',
                      listingType: '',
                      city: '',
                      furnished: false
                    });
                    fetchProperties({});
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyHome;