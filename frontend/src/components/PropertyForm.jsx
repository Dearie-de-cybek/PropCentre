/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const PropertyForm = ({ property = null, isEditing = false }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);


  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price || '',
    address: property?.address || '',
    city: property?.city || '',
    state: property?.state || '',
    zipCode: property?.zipCode || '',
    country: property?.country || 'Mauritius',
    propertyType: property?.propertyType || 'apartment',
    listingType: property?.listingType || 'rent',
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    toilets: property?.toilets || 1,
    squareFeet: property?.squareFeet || '',
    yearBuilt: property?.yearBuilt || '',
    parkingSpaces: property?.parkingSpaces || 0,
    furnished: property?.furnished || false,
    petFriendly: property?.petFriendly || false,
    hasAirConditioning: property?.hasAirConditioning || false,
    hasHeating: property?.hasHeating || false,
    hasInternet: property?.hasInternet || false,
    amenities: property?.amenities || [],
    availableFrom: property?.availableFrom ? new Date(property.availableFrom).toISOString().split('T')[0] : '',
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle number inputs
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string or valid numbers
    if (value === '' || !isNaN(value)) {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value)
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setPreviewImages([...previewImages, ...files.map(file => URL.createObjectURL(file))]);
    setImages([...images, ...files]);
  };

  // Remove image
  const removeImage = (index) => {
    const newPreviewImages = [...previewImages];
    const newImages = [...images];
    newPreviewImages.splice(index, 1);
    newImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
    setImages(newImages);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Create FormData object for file uploads
      const propertyData = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'amenities') {
          propertyData.append(key, formData[key]);
        }
      });
      
      // Add amenities as JSON string
      if (formData.amenities.length > 0) {
        propertyData.append('amenities', JSON.stringify(formData.amenities));
      }
      
      // Add images
      images.forEach(image => {
        propertyData.append('images', image);
      });
      
      // Set upload status
      setUploadingImages(true);
      
      // Send to API
      const url = isEditing 
        ? `http://localhost:8080/api/properties/${property.id}` 
        : 'http://localhost:8080/api/properties';
      
      const method = isEditing ? 'put' : 'post';
      
      const response = await axios({
        method,
        url,
        data: propertyData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setSuccess(true);
      setUploadingImages(false);
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/dashboard/properties');
      }, 1500);
      
    } catch (err) {
      setUploadingImages(false);
      setError(err.response?.data?.message || 'Failed to save property. Please try again.');
      console.error('Property save error:', err);
    } finally {
      setLoading(false);
    }
  };

  // List of property types
  const propertyTypes = [
    'apartment', 'house', 'condo', 'townhouse', 'land', 'commercial', 'office'
  ];

  // List of amenities for checkboxes
  const availableAmenities = [
    'Swimming Pool', 'Gym', 'Elevator', 'Security', 'Balcony', 'Garden', 
    'Parking', 'Laundry', 'Dishwasher', 'Fireplace', 'Storage', 'Walk-in Closet'
  ];

  // Toggle amenity selection
  const toggleAmenity = (amenity) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter(a => a !== amenity)
      });
    } else {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenity]
      });
    }
  };

  return (
    <div className="bg-[#1E1E1E] rounded-lg p-6">
      <h2 className="text-white text-xl font-bold mb-6">
        {isEditing ? 'Edit Property' : 'Add New Property'}
      </h2>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500 text-white p-3 rounded-lg mb-6">
          Property successfully {isEditing ? 'updated' : 'created'}!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="p-4 bg-[#0D0D0D] rounded-lg">
          <h3 className="text-white font-semibold mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Title */}
            <div className="col-span-2">
              <label htmlFor="title" className="block text-white mb-2">Property Title*</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Modern Beachfront Apartment"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Property Type */}
            <div>
              <label htmlFor="propertyType" className="block text-white mb-2">Property Type*</label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                required
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Listing Type */}
            <div>
              <label htmlFor="listingType" className="block text-white mb-2">Listing Type*</label>
              <select
                id="listingType"
                name="listingType"
                value={formData.listingType}
                onChange={handleChange}
                required
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>
            
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-white mb-2">Price* (in $)</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleNumberChange}
                required
                placeholder="e.g. 250000"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Available From */}
            <div>
              <label htmlFor="availableFrom" className="block text-white mb-2">Available From</label>
              <input
                type="date"
                id="availableFrom"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-white mb-2">Description*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe your property..."
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Location Section */}
        <div className="p-4 bg-[#0D0D0D] rounded-lg">
          <h3 className="text-white font-semibold mb-4">Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address */}
            <div className="col-span-2">
              <label htmlFor="address" className="block text-white mb-2">Street Address*</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                placeholder="e.g. 123 Main Street"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-white mb-2">City*</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="e.g. Port Louis"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* State/Province */}
            <div>
              <label htmlFor="state" className="block text-white mb-2">State/Province</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="e.g. Western"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Zip/Postal Code */}
            <div>
              <label htmlFor="zipCode" className="block text-white mb-2">Zip/Postal Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="e.g. 12345"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-white mb-2">Country*</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                placeholder="e.g. Mauritius"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="p-4 bg-[#0D0D0D] rounded-lg">
          <h3 className="text-white font-semibold mb-4">Features & Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bedrooms */}
            <div>
              <label htmlFor="bedrooms" className="block text-white mb-2">Bedrooms*</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleNumberChange}
                required
                min="0"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Bathrooms */}
            <div>
              <label htmlFor="bathrooms" className="block text-white mb-2">Bathrooms*</label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleNumberChange}
                required
                min="0"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Toilets */}
            <div>
              <label htmlFor="toilets" className="block text-white mb-2">Toilets*</label>
              <input
                type="number"
                id="toilets"
                name="toilets"
                value={formData.toilets}
                onChange={handleNumberChange}
                required
                min="0"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Square Feet */}
            <div>
              <label htmlFor="squareFeet" className="block text-white mb-2">Square Feet</label>
              <input
                type="number"
                id="squareFeet"
                name="squareFeet"
                value={formData.squareFeet}
                onChange={handleNumberChange}
                min="0"
                placeholder="e.g. 1500"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Year Built */}
            <div>
              <label htmlFor="yearBuilt" className="block text-white mb-2">Year Built</label>
              <input
                type="number"
                id="yearBuilt"
                name="yearBuilt"
                value={formData.yearBuilt}
                onChange={handleNumberChange}
                min="1800"
                max={new Date().getFullYear()}
                placeholder="e.g. 2010"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Parking Spaces */}
            <div>
              <label htmlFor="parkingSpaces" className="block text-white mb-2">Parking Spaces</label>
              <input
                type="number"
                id="parkingSpaces"
                name="parkingSpaces"
                value={formData.parkingSpaces}
                onChange={handleNumberChange}
                min="0"
                placeholder="e.g. 2"
                className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Property Features Checkboxes */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="furnished"
                name="furnished"
                checked={formData.furnished}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="furnished" className="text-white">Furnished</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="petFriendly"
                name="petFriendly"
                checked={formData.petFriendly}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="petFriendly" className="text-white">Pet Friendly</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasAirConditioning"
                name="hasAirConditioning"
                checked={formData.hasAirConditioning}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="hasAirConditioning" className="text-white">Air Conditioning</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasHeating"
                name="hasHeating"
                checked={formData.hasHeating}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="hasHeating" className="text-white">Heating</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasInternet"
                name="hasInternet"
                checked={formData.hasInternet}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="hasInternet" className="text-white">Internet/Wifi</label>
            </div>
          </div>
        </div>
        
        {/* Amenities Section */}
        <div className="p-4 bg-[#0D0D0D] rounded-lg">
          <h3 className="text-white font-semibold mb-4">Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  id={`amenity-${amenity}`}
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="mr-2"
                />
                <label htmlFor={`amenity-${amenity}`} className="text-white">
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Images Section */}
        <div className="p-4 bg-[#0D0D0D] rounded-lg">
          <h3 className="text-white font-semibold mb-4">Property Images</h3>
          
          <div className="mb-4">
            <label htmlFor="images" className="block text-white mb-2">
              Upload Images (Max 10 images, 5MB each)
            </label>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
            <label 
              htmlFor="images"
              className="block w-full bg-[#404040] text-white p-3 rounded-lg cursor-pointer text-center hover:bg-[#505050]"
            >
              Click to select images
            </label>
            <p className="text-gray-400 text-sm mt-1">
              Recommended image size: 1200x800 pixels
            </p>
          </div>
          
          {/* Image Preview */}
          {previewImages.length > 0 && (
            <div>
              <h4 className="text-white mb-2">Preview</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewImages.map((src, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={src} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      ✕
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard/properties')}
            className="px-6 py-3 bg-[#404040] text-white rounded-lg hover:bg-[#505050]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#f10000] text-white rounded-lg hover:bg-red-700 disabled:bg-red-300"
          >
            {loading ? (
              <>
                {uploadingImages ? 'Uploading Images...' : 'Saving...'}
                <span className="ml-2 inline-block animate-spin">&#8986;</span>
              </>
            ) : (
              isEditing ? 'Update Property' : 'Create Property'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;