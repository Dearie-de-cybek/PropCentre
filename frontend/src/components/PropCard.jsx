import React from 'react';

const PropCard = ({ 
  imageUrl = '/placeholder-property.jpg',
  address = '123 Anywhere St, Main, OK 12321',
  price = 480000, 
  bedrooms = 3, 
  bathrooms = 3, 
  toilets = 4,
  imageCount = 5
}) => {
  return (
    <div className="flex flex-col">
      {/* Main Card */}
      <div className="w-[250px] h-[365px] relative flex flex-col">
        {/* Property Image */}
        <div className="relative h-[250px] overflow-hidden">
          <img 
            src={imageUrl} 
            alt="Property" 
            className="w-full h-full object-cover"
          />
          
          {/* Address Tag */}
          <div className="absolute top-3 left-3 bg-[#212121] text-white py-1 px-2 rounded flex gap-1.5 items-center text-xs">
            <img src="../public/icons/map.svg" alt="" />
            <span className="truncate max-w-[180px]">{address}</span>
          </div>
          
          {/* Image Count Tag */}
          <div className="absolute bottom-3 left-3 bg-[#212121] text-white p-1 rounded flex gap-1.5 items-center text-xs">
            <img src="../public/icons/camera.svg" alt="" />
            <span>{imageCount}</span>
          </div>
        </div>
        
        {/* Property Details */}
        <div className="bg-[#0D0D0D] flex-1 p-3">
          {/* Price */}
          <div className="text-white font-bold text-xl mb-2">
            ${price.toLocaleString()}
          </div>
          
          {/* Property Features */}
          <div className="flex space-x-2">
            {/* Bedrooms */}
            <div className="bg-[#212121] rounded p-2 flex gap-1.5 items-center">
              <img src="../public/icons/Bed.svg" alt="" />
              <span className="text-white">{bedrooms}</span>
            </div>
            
            {/* Bathrooms */}
            <div className="bg-[#212121] rounded p-2 flex gap-1.5 items-center">
              <img src="../public/icons/Bathtub.svg" alt="" />
              <span className="text-white">{bathrooms}</span>
            </div>
            
            {/* Toilets */}
            <div className="bg-[#212121] rounded p-2 flex gap-1.5 items-center">
              <img src="../public/icons/toilet.svg" alt="" />
              <span className="text-white">{toilets}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Card (Buy and Like) */}
      <div className="w-[250px] h-[66px] bg-[#0D0D0D] mt-1 flex items-center justify-between p-3">
        <button className="bg-[#212121] text-[#f10000] font-bold py-2 px-10 rounded min-w-[170px]">
          Buy
        </button>
        <button className="bg-[#212121] p-2 rounded">
          <img src="../public/icons/like.svg" alt="" />
        </button>
      </div>
    </div>
  );
};

export default PropCard;