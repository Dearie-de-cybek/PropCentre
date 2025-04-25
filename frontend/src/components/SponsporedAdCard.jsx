import React from 'react';

const SponsoredAdCard = ({
  imageUrl = '../public/images/sponspored1.jpg',
  adTitle = 'Premium Advertisement Space',
  description = 'Reach thousands of potential customers with your sponsored content',
  ctaText = 'Learn More',
  ctaUrl = '#',
  advertiserName = 'Business Name',
  advertiserLogo = '/advertiser-logo.png'
}) => {
  return (
    <div className="w-[450px] h-[450px] bg-[#1E1E1E]  overflow-hidden shadow-lg">
      {/* Ad Image Section */}
      <div className="h-[250px] relative">
        <img 
          src={imageUrl} 
          alt={adTitle}
          className="w-full h-full object-cover"
        />
        
        {/* Sponsored Badge */}
        <div className="absolute top-4 right-4 bg-[#f10000] text-white text-xs font-bold px-3 py-1 rounded-full">
          SPONSORED
        </div>
      </div>
      
      {/* Ad Content */}
      <div className="p-4 flex flex-col h-[200px]">
        {/* Ad Title */}
        <h3 className="text-white font-bold text-xl mb-2">{adTitle}</h3>
        
        {/* Ad Description */}
        <p className="text-gray-300 text-sm mb-4 flex-grow">{description}</p>
        
        {/* Bottom Section with CTA and Advertiser Info */}
        <div className="flex justify-between items-center mt-auto">
          {/* CTA Button */}
          <a 
            href={ctaUrl} 
            className="bg-[#f10000] hover:bg-red-700 text-white py-2 px-6 font-bold transition duration-300"
          >
            {ctaText}
          </a>
          
          {/* Advertiser Info */}
          <div className="flex items-center">
            <img 
              src={advertiserLogo} 
              alt={advertiserName} 
              className="w-8 h-8  object-cover mr-2"
            />
            <span className="text-white text-xs">{advertiserName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsoredAdCard;