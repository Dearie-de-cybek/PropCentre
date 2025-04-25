import  { useState } from 'react';

const FilterSection = ({ title, children, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-800">
      <div 
        className="flex justify-between items-center py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-white font-medium">{title}</h3>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 text-white transition-transform ${expanded ? 'transform rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div className={`pb-3 ${expanded ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  );
};

// Checkbox Component
const Checkbox = ({ label }) => (
  <div className="flex items-center mb-2">
    <input 
      type="checkbox" 
      className="w-4 h-4 border-gray-600 bg-transparent text-red-600 focus:ring-0 focus:ring-offset-0"
    />
    <label className="ml-2 text-sm text-white">{label}</label>
  </div>
);

// Radio Button Component
const RadioButton = ({ label }) => (
  <div className="flex items-center mb-2">
    <input 
      type="radio" 
      name="priceRange" 
      className="w-4 h-4 border-gray-600 bg-transparent text-red-600 focus:ring-0 focus:ring-offset-0"
    />
    <label className="ml-2 text-sm text-white">{label}</label>
  </div>
);

// Price Slider Component
const PriceSlider = () => {
  return (
    <div className="mt-4 px-1">
      <div className="relative h-1 bg-gray-700 rounded-full">
        <div className="absolute h-1 bg-red-600 rounded-full" style={{ left: '25%', right: '25%' }}></div>
        <div className="absolute w-4 h-4 bg-red-600 rounded-full -mt-1.5" style={{ left: '25%' }}></div>
        <div className="absolute w-4 h-4 bg-red-600 rounded-full -mt-1.5" style={{ right: '25%' }}></div>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-white">$0</span>
        <span className="text-xs text-white">$500k</span>
      </div>
    </div>
  );
};

// Main Filter Sidebar Component
const FilterSidebar = () => {
  return (
    <div className="w-64 bg-[#0D0D0D] p-4">
      <h2 className="text-lg text-white font-bold mb-4">Filter by</h2>
      
      {/* Property Type */}
      <FilterSection title="Property type" defaultExpanded={true}>
        <Checkbox label="Single-Family Home" />
        <Checkbox label="Condominium" />
        <Checkbox label="Town House" />
        <Checkbox label="Multi-Family Home" />
        <Checkbox label="Commercial" />
        <Checkbox label="Land" />
      </FilterSection>
      
      {/* Price Range */}
      <FilterSection title="Price Range" defaultExpanded={true}>
        <RadioButton label="<$300k" />
        <RadioButton label="$300k - $500k" />
        <RadioButton label="$500k - $1M" />
        <RadioButton label=">$1M" />
        <PriceSlider />
      </FilterSection>
      
      {/* Bedrooms */}
      <FilterSection title="Bedrooms" defaultExpanded={true}>
        <Checkbox label="Box/Quarter" />
        <Checkbox label="Studio" />
        <Checkbox label="1 bedroom" />
        <Checkbox label="2 bedrooms" />
        <Checkbox label="3 bedrooms" />
        <Checkbox label="4 bedrooms" />
        <Checkbox label=">4 bedrooms" />
      </FilterSection>
      
      {/* Bathrooms */}
      <FilterSection title="Bathrooms" defaultExpanded={true}>
        <Checkbox label="1 bathroom" />
        <Checkbox label="2 bathrooms" />
        <Checkbox label="3 bathrooms" />
        <Checkbox label="4 bathrooms" />
        <Checkbox label=">4 bathrooms" />
      </FilterSection>
      
      {/* Toilets */}
      <FilterSection title="Toilets" defaultExpanded={false}>
        <Checkbox label="1 toilet" />
        <Checkbox label="2 toilets" />
        <Checkbox label="3 toilets" />
        <Checkbox label="4 toilets" />
        <Checkbox label=">4 toilets" />
      </FilterSection>
      
      {/* Amenities */}
      <FilterSection title="Amenities" defaultExpanded={false}>
        <Checkbox label="Swimming Pool" />
        <Checkbox label="Garden" />
        <Checkbox label="Garage" />
        <Checkbox label="Security" />
        <Checkbox label="Air Conditioning" />
        <Checkbox label="Heating" />
      </FilterSection>
    </div>
  );
};

export default FilterSidebar;