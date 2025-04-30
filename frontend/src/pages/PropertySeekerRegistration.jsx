import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PropertyNavbar from "../components/PropertyNavbar";

const PropertySeekerRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    preferredLocation: '',
    budget: '',
    propertyType: [],
    acceptTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handlePropertyTypeChange = (type) => {
    const updatedTypes = [...formData.propertyType];
    
    if (updatedTypes.includes(type)) {
      // Remove from array if already selected
      const index = updatedTypes.indexOf(type);
      updatedTypes.splice(index, 1);
    } else {
      // Add to array if not selected
      updatedTypes.push(type);
    }
    
    setFormData({
      ...formData,
      propertyType: updatedTypes
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);
    
    try {
      // Here you would make an API call to register the property seeker
      // Example API call:
      // const response = await api.post('/auth/register/seeker', {
      //   ...formData,
      //   userType: 'seeker'
      // });
      
      console.log('Registering property seeker with data:', {
        ...formData,
        userType: 'seeker'
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // After successful registration, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Property types options
  const propertyTypes = [
    'Apartment', 'House', 'Condo', 'Townhouse', 'Land'
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <PropertyNavbar />
      
      <div className="px-6 py-12">
        <div className="max-w-2xl mx-auto bg-[#1E1E1E] p-8 rounded-lg">
          <h1 className="text-white font-montserrat font-bold text-2xl text-center mb-8">
            Property Seeker Registration
          </h1>
          
          {errors.submit && (
            <div className="bg-red-500 text-white p-3 rounded-lg mb-6">
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-white mb-2">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.firstName ? 'border border-red-500' : ''}`}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              
              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-white mb-2">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastName ? 'border border-red-500' : ''}`}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-white mb-2">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-white mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border border-red-500' : ''}`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>
              
              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-white mb-2">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? 'border border-red-500' : ''}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            
            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-white mb-2">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phoneNumber ? 'border border-red-500' : ''}`}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferred Location */}
              <div>
                <label htmlFor="preferredLocation" className="block text-white mb-2">Preferred Location</label>
                <input
                  type="text"
                  id="preferredLocation"
                  name="preferredLocation"
                  value={formData.preferredLocation}
                  onChange={handleChange}
                  placeholder="City, neighborhood, etc."
                  className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Budget Range */}
              <div>
                <label htmlFor="budget" className="block text-white mb-2">Budget Range</label>
                <select
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className="w-full bg-[#404040] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Budget Range</option>
                  <option value="0-50000">$0 - $50,000</option>
                  <option value="50000-100000">$50,000 - $100,000</option>
                  <option value="100000-200000">$100,000 - $200,000</option>
                  <option value="200000-300000">$200,000 - $300,000</option>
                  <option value="300000-500000">$300,000 - $500,000</option>
                  <option value="500000-750000">$500,000 - $750,000</option>
                  <option value="750000-1000000">$750,000 - $1,000,000</option>
                  <option value="1000000+">$1,000,000+</option>
                </select>
              </div>
            </div>
            
            {/* Property Types */}
            <div>
              <label className="block text-white mb-2">Property Types (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {propertyTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePropertyTypeChange(type)}
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      formData.propertyType.includes(type)
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#404040] text-white hover:bg-[#505050]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="acceptTerms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="mt-1 mr-2"
              />
              <label htmlFor="acceptTerms" className="text-white text-sm">
                I agree to the <a href="/terms" className="text-blue-500">Terms and Conditions</a> and <a href="/privacy" className="text-blue-500">Privacy Policy</a>
              </label>
            </div>
            {errors.acceptTerms && <p className="text-red-500 text-sm mt-1">{errors.acceptTerms}</p>}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            >
              {isSubmitting ? 'Registering...' : 'Register as Property Seeker'}
            </button>
            
            {/* Login Link */}
            <div className="text-center mt-4">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-500 font-semibold">
                  Log In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertySeekerRegistration;