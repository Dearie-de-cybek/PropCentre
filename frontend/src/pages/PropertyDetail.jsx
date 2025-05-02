import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import PropertyNavbar from "../components/PropertyNavbar";
import PropertyAPI from "../services/PropertyAPI";
import { useAuth } from "../context/AuthContext";
import { HeartIcon, MessageCircleIcon, CalendarIcon } from "lucide-react";
import PropertyDetailsAnalytics from "../components/PropertyDetailsAnalytics";
import SimilarPropertiesComponent from "../components/SimilarPropertiesComponent";

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  // Debug logs to help identify issues
  console.log("PropertyDetail component rendering");
  console.log("URL Params ID:", id);
  console.log("Auth state:", {
    isAuthenticated: isAuthenticated(),
    currentUser,
  });

  // Fetch property details
  useEffect(() => {
    console.log("PropertyDetail useEffect running for ID:", id);

    const fetchPropertyDetails = async () => {
      try {
        console.log("Fetching property data for ID:", id);
        const response = await PropertyAPI.getPropertyById(id);
        console.log("API Response:", response);
        setProperty(response.data);

        // Check if property is saved by user
        if (isAuthenticated() && currentUser?.accountType === "seeker") {
          try {
            const savedProperties = await PropertyAPI.getSavedProperties();
            setSaved(
              savedProperties.data.some((p) => p.propertyId === parseInt(id))
            );
          } catch (err) {
            console.error("Error checking saved status:", err);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching property details:", err, err.response);
        setError("Failed to load property details. Please try again later.");
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id, isAuthenticated, currentUser]);

  // Handle save/unsave property
  const handleSaveProperty = async () => {
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (saved) {
        await PropertyAPI.removeSavedProperty(id);
        setSaved(false);
      } else {
        await PropertyAPI.saveProperty(id);
        setSaved(true);
      }
    } catch (err) {
      console.error("Error saving/unsaving property:", err);
    }
  };

  // Handle contact landlord
  const handleContact = () => {
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }
    setShowContactModal(true);
  };

  // Handle book appointment
  const handleBookAppointment = () => {
    if (!isAuthenticated()) {
      setShowLoginModal(true);
      return;
    }
    setShowAppointmentModal(true);
  };

  // Redirect to login
  const redirectToLogin = () => {
    navigate("/login", { state: { from: `/properties-detail/${id}` } });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <PropertyNavbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <PropertyNavbar />
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-white text-2xl mb-4">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{error || "Property not found."}</p>
          <Link
            to="/properties"
            className="bg-[#f10000] text-white px-6 py-3 rounded-lg inline-block"
          >
            Browse Other Properties
          </Link>
        </div>
      </div>
    );
  }

  // Fix for image paths - use absolute URLs or import images properly
  const getImageUrl = (path) => {
    // If it's already an absolute URL (e.g., http://...)
    if (
      path.startsWith("http") ||
      path.startsWith("https") ||
      path.startsWith("/")
    ) {
      return path;
    }

    // For relative paths that use ../public, convert to absolute path
    if (path.includes("../public")) {
      return path.replace("../public", "");
    }

    // Otherwise assume it's a relative path from public directory
    return `/${path}`;
  };

  // Use actual property data or fallback to placeholder data if needed
  const propertyData = {
    id: property.id,
    name: property.title,
    address: `${property.address}, ${property.city}, ${property.state || ""} ${
      property.zipCode || ""
    }`,
    price: property.price || 0,
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    toilets: property.toilets || 0,
    images:
      property.images && property.images.length > 0
        ? property.images.map((img) => img.imageUrl)
        : [
            "/images/room1.jpg",
            "/images/room2.jpg",
            "/images/room3.jpg",
            "/images/room4.jpg",
          ],
    description: property.description || "No description available.",
    features: [
      property.hasAirConditioning ? "Air Conditioning" : null,
      property.furnished ? "Furnished" : null,
      property.hasInternet ? "Internet" : null,
      property.petFriendly ? "Pet Friendly" : null,
      // Check if amenities is an array of objects or strings and handle accordingly
      ...(property.amenities
        ? property.amenities.map((amenity) =>
            // If amenity is an object with a name property, use that
            typeof amenity === "object" && amenity !== null
              ? amenity.name || amenity.description || JSON.stringify(amenity)
              : // Otherwise use the amenity directly (assuming it's a string)
                amenity
          )
        : []),
    ].filter(Boolean), // Remove null values
    squareFeet: property.squareFeet,
    year: property.yearBuilt,
    landlord: property.owner
      ? {
          name: `${property.owner.firstName} ${property.owner.lastName}`,
          company: property.owner.landlordProfile?.companyName,
          image: property.owner.profileImage,
        }
      : null,
  };
  console.log("Rendering property with data:", propertyData);

  return (
    <>
      <PropertyNavbar />
      <div className="bg-[#0D0D0D] min-h-screen pb-12">
        {/* Back to search link */}
        <div className="container mx-auto px-6 pt-6">
          <Link
            to="/properties"
            className="flex items-center text-[#f10000] mb-4"
          >
            <img
              src={getImageUrl("/icons/back.svg")}
              alt="Back"
              className="h-4 w-4 mr-2"
            />
            <span>BACK TO SEARCH</span>
          </Link>

          {/* Property Title and Actions */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2">
                {propertyData.name}
              </h1>
              <div className="flex items-center text-white">
                <img
                  src={getImageUrl("/icons/map.svg")}
                  alt="Location"
                  className="h-5 w-5 mr-2"
                />
                <span>{propertyData.address}</span>
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="text-white p-2 hover:bg-[#404040] rounded-full transition-colors">
                <img
                  src={getImageUrl("/icons/share.svg")}
                  alt="Share"
                  className="h-[20px] w-[17px]"
                />
              </button>
              <button
                onClick={handleSaveProperty}
                className={`p-2 rounded-full transition-colors ${
                  saved
                    ? "text-red-500 bg-red-500/10"
                    : "text-white hover:bg-[#404040]"
                }`}
              >
                <HeartIcon
                  className="h-6 w-6"
                  fill={saved ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          {/* Image Gallery Grid */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Main large image (700px x 500px) */}
            <div className="relative md:w-7/12">
              <img
                src={propertyData.images[0]}
                alt={propertyData.name}
                className="w-full h-[500px] object-cover rounded-md"
              />
              <button className="absolute left-4 top-4 p-2 rounded">
                <img
                  src={getImageUrl("/icons/expansion.svg")}
                  alt="Expand"
                  className="h-5 w-5"
                />
              </button>
            </div>

            {/* Right side container */}
            <div className="flex flex-col gap-4 md:gap-10 md:w-5/12">
              {/* Top row with two images side by side */}
              <div className="flex gap-4">
                {/* Floor Plan image (280px x 210px) */}
                <div className="relative w-1/2">
                  <img
                    src={propertyData.images[1] || propertyData.images[0]}
                    alt={`${propertyData.name} detail 1`}
                    className="w-full h-[210px] object-cover rounded-md"
                  />
                  <div className="absolute bottom-4 left-4 bg-[#212121] text-white text-sm px-2 py-1 rounded">
                    View 2
                  </div>
                  <button className="absolute left-4 top-4 p-2 rounded">
                    <img
                      src={getImageUrl("/icons/expansion.svg")}
                      alt="Expand"
                      className="h-5 w-5"
                    />
                  </button>
                </div>

                {/* Blueprint image (280px x 210px) */}
                <div className="relative w-1/2">
                  <img
                    src={propertyData.images[2] || propertyData.images[0]}
                    alt={`${propertyData.name} detail 2`}
                    className="w-full h-[210px] object-cover rounded-md"
                  />
                  <div className="absolute bottom-4 left-4 bg-[#212121] text-white text-sm px-2 py-1 rounded">
                    View 3
                  </div>
                  <button className="absolute left-4 top-4 p-2 rounded">
                    <img
                      src={getImageUrl("/icons/expansion.svg")}
                      alt="Expand"
                      className="h-5 w-5"
                    />
                  </button>
                </div>
              </div>

              {/* Bottom larger image (600px x 250px) */}
              <div className="relative">
                <img
                  src={propertyData.images[3] || propertyData.images[0]}
                  alt={`${propertyData.name} detail 3`}
                  className="w-full h-[250px] object-cover rounded-md"
                />
                <button className="absolute left-4 top-4 p-2 rounded">
                  <img
                    src={getImageUrl("/icons/expansion.svg")}
                    alt="Expand"
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Property Overview Section */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Left Side - Description */}
            <div className="flex-1">
              <h2 className="text-white text-2xl font-bold mb-4">
                Property Overview
              </h2>
              <p className="text-white mb-6">{propertyData.description}</p>

              {/* Property Features */}
              <div className="mt-6">
                <h3 className="text-white text-xl font-bold mb-3">Features</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {propertyData.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-white">
                      <div className="w-2 h-2 bg-[#f10000] rounded-full mr-2"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities Rectangles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {/* Bedroom Rectangle */}
                <div className="bg-[#212121] p-6 rounded flex flex-col items-center">
                  <img
                    src={getImageUrl("/icons/bed.svg")}
                    alt="Bedroom"
                    className="h-[68px] w-[91px] mb-3"
                  />
                  <span className="text-white text-center">
                    {propertyData.bedrooms} Bedrooms
                  </span>
                </div>

                {/* Bathroom Rectangle */}
                <div className="bg-[#212121] p-6 rounded flex flex-col items-center">
                  <img
                    src={getImageUrl("/icons/bathtub.svg")}
                    alt="Bathroom"
                    className="h-[68px] w-[91px] mb-3"
                  />
                  <span className="text-white text-center">
                    {propertyData.bathrooms} Bathrooms
                  </span>
                </div>

                {/* Toilet Rectangle */}
                <div className="bg-[#212121] p-6 rounded flex flex-col items-center">
                  <img
                    src={getImageUrl("/icons/toilet.svg")}
                    alt="Toilet"
                    className="h-[68px] w-[91px] mb-3"
                  />
                  <span className="text-white text-center">
                    {propertyData.toilets} Toilets
                  </span>
                </div>

                {/* Area Rectangle */}
                <div className="bg-[#212121] p-6 rounded flex flex-col items-center">
                  <img
                    src={getImageUrl("/icons/expand.svg")}
                    alt="Area"
                    className="mb-3"
                  />
                  <span className="text-white text-center">
                    {propertyData.squareFeet
                      ? `${propertyData.squareFeet} sq ft`
                      : "Area N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Side - Info Box */}
            <div className="bg-[#212121] w-full lg:w-[500px] rounded-lg p-6 flex flex-col">
              {/* Price */}
              <h3 className="text-white text-3xl font-bold mb-4">
                ${property.price ? property.price.toLocaleString() : "0"}
                {property.listingType === "rent" ? "/month" : ""}
              </h3>

              {/* Address */}
              <div className="text-white mb-6">
                <img
                  src={getImageUrl("/icons/map.svg")}
                  alt="Location"
                  className="h-5 w-5 inline mr-2"
                />
                <span>{propertyData.address}</span>
              </div>

              {/* Property Details */}
              <div className="mb-6">
                <div className="flex justify-between text-white mb-2">
                  <span>Property Type:</span>
                  <span className="text-gray-300">
                    {property.propertyType
                      ? property.propertyType.charAt(0).toUpperCase() +
                        property.propertyType.slice(1)
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between text-white mb-2">
                  <span>Status:</span>
                  <span className="text-gray-300">
                    {property.status
                      ? property.status.charAt(0).toUpperCase() +
                        property.status.slice(1)
                      : "N/A"}
                  </span>
                </div>
                {property.yearBuilt && (
                  <div className="flex justify-between text-white mb-2">
                    <span>Year Built:</span>
                    <span className="text-gray-300">{property.yearBuilt}</span>
                  </div>
                )}
              </div>

              <div className="container mx-auto px-6 mb-8">
                {/* Conditionally render PropertyDetailsAnalytics if it's imported and available */}
                {typeof PropertyDetailsAnalytics === "function" && (
                  <PropertyDetailsAnalytics
                    propertyId={id}
                    propertyData={propertyData}
                  />
                )}
              </div>

              {/* Landlord Info */}
              {propertyData.landlord && (
                <div className="mb-6 border-t border-b border-[#404040] py-4">
                  <p className="text-white mb-2">Listed by:</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-[#404040] flex items-center justify-center mr-3 overflow-hidden">
                      {propertyData.landlord.image ? (
                        <img
                          src={propertyData.landlord.image}
                          alt="Owner"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-lg">
                          {propertyData.landlord.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {propertyData.landlord.name}
                      </p>
                      {propertyData.landlord.company && (
                        <p className="text-gray-400 text-sm">
                          {propertyData.landlord.company}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Spacer to push buttons to bottom */}
              <div className="flex-grow"></div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                {/* Different buttons based on listing type and user type */}
                {property.listingType === "sale" ? (
                  <button
                    onClick={handleContact}
                    className="bg-[#f10000] text-white font-bold py-4 w-full rounded flex items-center justify-center gap-2"
                  >
                    <MessageCircleIcon size={20} />
                    Contact About Purchase
                  </button>
                ) : (
                  <button
                    onClick={handleContact}
                    className="bg-[#f10000] text-white font-bold py-4 w-full rounded flex items-center justify-center gap-2"
                  >
                    <MessageCircleIcon size={20} />
                    Contact About Renting
                  </button>
                )}

                <button
                  onClick={handleBookAppointment}
                  className="bg-[#404040] text-white font-bold py-4 w-full rounded flex items-center justify-center gap-2 hover:bg-[#505050]"
                >
                  <CalendarIcon size={20} />
                  Book Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties - only render if component exists */}
      {typeof SimilarPropertiesComponent === "function" && (
        <div className="container mx-auto px-6 py-8">
          <SimilarPropertiesComponent propertyId={id} />
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] p-6 rounded-lg max-w-md w-full">
            <h2 className="text-white text-xl font-bold mb-4">
              Login Required
            </h2>
            <p className="text-gray-300 mb-6">
              You need to be logged in to perform this action.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-4 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#505050]"
              >
                Cancel
              </button>
              <button
                onClick={redirectToLogin}
                className="px-4 py-2 bg-[#f10000] text-white rounded-lg hover:bg-red-700"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] p-6 rounded-lg max-w-md w-full">
            <h2 className="text-white text-xl font-bold mb-4">
              Contact Landlord
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-white mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows="4"
                  className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="I'm interested in this property and would like more information..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#505050]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#f10000] text-white rounded-lg hover:bg-red-700"
                  onClick={() => setShowContactModal(false)}
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] p-6 rounded-lg max-w-md w-full">
            <h2 className="text-white text-xl font-bold mb-4">
              Book Inspection
            </h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-white mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  id="date"
                  className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label htmlFor="timeSlot" className="block text-white mb-2">
                  Preferred Time
                </label>
                <select
                  id="timeSlot"
                  className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a time slot</option>
                  <option value="morning">Morning (9AM - 12PM)</option>
                  <option value="afternoon">Afternoon (1PM - 5PM)</option>
                  <option value="evening">Evening (6PM - 8PM)</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="appointmentMessage"
                  className="block text-white mb-2"
                >
                  Message (Optional)
                </label>
                <textarea
                  id="appointmentMessage"
                  rows="3"
                  className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information for the landlord..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-4 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#505050]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#f10000] text-white rounded-lg hover:bg-red-700"
                  onClick={() => setShowAppointmentModal(false)}
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyDetail;
