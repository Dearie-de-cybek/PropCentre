/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircleIcon, PencilIcon, TrashIcon, EyeIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PropertyAPI from '../services/PropertyAPI';

const PropertyManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletePropertyId, setDeletePropertyId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch landlord's properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await PropertyAPI.getLandlordProperties();
        setProperties(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again later.');
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  // Handle delete property
  const handleDeleteProperty = async () => {
    if (!deletePropertyId) return;
    
    try {
      await PropertyAPI.deleteProperty(deletePropertyId);
      
      // Update properties list
      setProperties(properties.filter(property => property.id !== deletePropertyId));
      setShowDeleteModal(false);
      setDeletePropertyId(null);
    } catch (err) {
      console.error('Error deleting property:', err);
      setError('Failed to delete property. Please try again.');
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (propertyId) => {
    setDeletePropertyId(propertyId);
    setShowDeleteModal(true);
  };

  // Format property status for display
  const formatStatus = (status) => {
    switch (status) {
      case 'available':
        return <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs">Available</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-500 text-white rounded-full text-xs">Pending</span>;
      case 'rented':
        return <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs">Rented</span>;
      case 'sold':
        return <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs">Sold</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500 text-white rounded-full text-xs">{status}</span>;
    }
  };

  // Format property type for display
  const formatPropertyType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">My Properties</h1>
        <button
          onClick={() => navigate('/dashboard/properties/add')}
          className="flex items-center gap-2 bg-[#f10000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <PlusCircleIcon size={20} />
          <span>Add Property</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Properties Table */}
      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden">
        {properties.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0D0D0D]">
                <tr>
                  <th className="px-4 py-3 text-left text-white">Property</th>
                  <th className="px-4 py-3 text-left text-white">Location</th>
                  <th className="px-4 py-3 text-left text-white">Price</th>
                  <th className="px-4 py-3 text-left text-white">Type</th>
                  <th className="px-4 py-3 text-left text-white">Status</th>
                  <th className="px-4 py-3 text-left text-white">Listed On</th>
                  <th className="px-4 py-3 text-left text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((property) => (
                  <tr key={property.id} className="border-b border-[#404040]">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={property.images && property.images.length > 0 
                            ? property.images[0].imageUrl 
                            : '../public/images/property-placeholder.jpg'} 
                          alt={property.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="text-white font-medium">{property.title}</p>
                          <p className="text-gray-400 text-sm">{property.bedrooms} bd | {property.bathrooms} ba</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white">{property.city}</td>
                    <td className="px-4 py-3 text-white">
                      ${property.price.toLocaleString()}
                      <span className="text-gray-400 text-xs ml-1">
                        {property.listingType === 'rent' ? '/mo' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{formatPropertyType(property.propertyType)}</td>
                    <td className="px-4 py-3 text-white">{formatStatus(property.status)}</td>
                    <td className="px-4 py-3 text-white">
                      {formatDate(property.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <Link
                          to={`/properties-detail/${property.id}`}
                          className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
                          title="View Property"
                        >
                          <EyeIcon size={16} />
                        </Link>
                        <Link
                          to={`/dashboard/properties/edit/${property.id}`}
                          className="p-1.5 bg-amber-500 text-white rounded hover:bg-amber-600"
                          title="Edit Property"
                        >
                          <PencilIcon size={16} />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(property.id)}
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600"
                          title="Delete Property"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">You haven't listed any properties yet.</p>
            <button
              onClick={() => navigate('/dashboard/properties/add')}
              className="bg-[#f10000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Add Your First Property
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1E1E1E] p-6 rounded-lg w-full max-w-md">
            <h3 className="text-white text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this property? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-[#404040] text-white rounded-lg hover:bg-[#505050]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProperty}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagement;