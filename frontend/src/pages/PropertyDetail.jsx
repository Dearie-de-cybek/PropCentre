import React from "react";
import { Link } from "react-router-dom";
import PropertyNavbar from "../components/PropertyNavbar";

const PropertyDetail = () => {
  const property = {
    id: 1,
    name: "La Rouge Maisonnette",
    address: "123, Anywhere st, any city, any state, 123456",
    price: 480000,
    bedrooms: 3,
    bathrooms: 2,
    toilets: 2,
    images: [
      "../public/images/room1.jpg",
      "../public/images/room2.jpg",
      "../public/images/room3.jpg",
      "../public/images/room4.jpg",
    ],
    description: "Welcome to La Rouge Maisonette, a luxurious and modern home designed for comfort and elegance. This stunning property offers a perfect blend of contemporary aesthetics and functional living spaces, making it ideal for families, professionals, or anyone seeking a premium lifestyle.",
    features: ["Air Conditioning", "Pool", "Garden", "Garage"],
  };

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
              src="../public/icons/back.svg"
              alt="Back"
              className="h-4 w-4 mr-2"
            />
            <span>BACK TO SEARCH</span>
          </Link>

          {/* Property Title and Actions */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-white text-3xl font-bold mb-2">
                {property.name}
              </h1>
              <div className="flex items-center text-white">
                <img
                  src="../public/icons/map.svg"
                  alt="Location"
                  className="h-5 w-5 mr-2"
                />
                <span>{property.address}</span>
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="text-white">
                <img
                  src="../public/icons/share.svg"
                  alt="Share"
                  className="h-[20px] w-[17px]"
                />
              </button>
              <button className="text-white">
                <img
                  src="../public/icons/heart.svg"
                  alt="Like"
                  className="h-6 w-6"
                />
              </button>
            </div>
          </div>

          {/* Image Gallery Grid */}
          <div className="flex gap-4 mb-8">
            {/* Main large image (700px x 500px) */}
            <div className="relative">
              <img
                src={property.images[0]}
                alt={property.name}
                className="w-[700px] h-[500px] object-cover rounded-md"
              />
              <button className="absolute left-4 top-4 p-2 rounded">
                <img
                  src="../public/icons/expansion.svg"
                  alt="Expand"
                  className="h-5 w-5"
                />
              </button>
            </div>

            {/* Right side container */}
            <div className="flex flex-col gap-10">
              {/* Top row with two images side by side */}
              <div className="flex gap-4">
                {/* Floor Plan image (280px x 210px) */}
                <div className="relative">
                  <img
                    src={property.images[1]}
                    alt={`${property.name} detail 1`}
                    className="w-[280px] h-[210px] object-cover rounded-md"
                  />
                  <div className="absolute bottom-4 left-4 bg-[#212121] text-white text-sm px-2 py-1 rounded">
                    Floor Plan
                  </div>
                  <button className="absolute left-4 top-4  p-2 rounded">
                    <img
                      src="../public/icons/expansion.svg"
                      alt="Expand"
                      className="h-5 w-5"
                    />
                  </button>
                </div>

                {/* Blueprint image (280px x 210px) */}
                <div className="relative">
                  <img
                    src={property.images[2]}
                    alt={`${property.name} detail 2`}
                    className="w-[280px] h-[210px] object-cover rounded-md"
                  />
                  <div className="absolute bottom-4 left-4 bg-[#212121] text-white text-sm px-2 py-1 rounded">
                    Blueprint
                  </div>
                  <button className="absolute left-4 top-4  p-2 rounded">
                    <img
                      src="../public/icons/expansion.svg"
                      alt="Expand"
                      className="h-5 w-5"
                    />
                  </button>
                </div>
              </div>

              {/* Bottom larger image (600px x 250px) */}
              <div className="relative">
                <img
                  src={property.images[3]}
                  alt={`${property.name} detail 3`}
                  className="w-[600px] h-[250px] object-cover rounded-md"
                />
                <button className="absolute left-4 top-4 p-2 rounded">
                  <img
                    src="../public/icons/expansion.svg"
                    alt="Expand"
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Property Overview Section */}
          <div className="flex gap-8 mb-8">
            {/* Left Side - Description */}
            <div className="flex-1">
              <h2 className="text-white text-2xl font-bold mb-4">
                Property Overview
              </h2>
              <p className="text-white mb-6">
                {property.description ||
                  "This beautiful property offers modern amenities and a convenient location. Perfect for families or professionals, it features spacious rooms, plenty of natural light, and a functional layout. The property has been well-maintained and includes recent upgrades to ensure comfort and efficiency."}
              </p>

              {/* Amenities Rectangles */}
              <div className="grid grid-cols-4 gap-4 mt-8">
                {/* Bedroom Rectangle */}
                <div className="bg-[#212121] p-6 rounded flex flex-col items-center">
                  <img
                    src="../public/icons/bed.svg"
                    alt="Bedroom"
                    className="h-[68px] w-[91px] mb-3"
                  />
                  <span className="text-white text-center">
                    {property.bedrooms} Bedrooms
                  </span>
                </div>

                {/* Bathroom Rectangle */}
                <div className="bg-[#212121] p-6 rounded flex flex-col items-center">
                  <img
                    src="../public/icons/bathtub.svg"
                    alt="Bathroom"
                    className="h-[68px] w-[91px] mb-3"
                  />
                  <span className="text-white text-center">
                    {property.bathrooms} Bathrooms
                  </span>
                </div>

                {/* Toilet Rectangle */}
                <div className="bg-[#212121] p-6 rounded flex flex-col items-center">
                  <img
                    src="../public/icons/toilet.svg"
                    alt="Toilet"
                    className="h-[68px] w-[91px] mb-3"
                  />
                  <span className="text-white text-center">
                    {property.toilets} Toilets
                  </span>
                </div>

                {/* Area Rectangle */}
                <div className="bg-[#212121] p-6 rounded flex flex-col items-center">
                  <img
                    src="../public/icons/expand.svg"
                    alt="Area"
                    className=" mb-3"
                  />
                  <span className="text-white text-center">2,500 sq ft</span>
                </div>
              </div>
            </div>

            {/* Right Side - Info Box */}
            <div className="bg-[#212121] w-[500px] h-[352px] rounded-lg p-6 flex flex-col">
              {/* Price */}
              <h3 className="text-white text-3xl font-bold mb-4">
                ${property.price.toLocaleString()}
              </h3>

              {/* Address */}
              <div className="text-white mb-6">
                <img
                  src="../public/icons/map.svg"
                  alt="Location"
                  className="h-5 w-5 inline mr-2"
                />
                <span>{property.address}</span>
              </div>

              {/* Spacer to push buttons to bottom */}
              <div className="flex-grow"></div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button className="bg-[#f10000] text-white font-bold py-4 w-[210px] h-[66px] rounded">
                  Initiate Purchase
                </button>
                <button className="bg-[#404040] text-white font-bold py-4 w-[210px] h-[66px] rounded">
                  Book Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PropertyDetail;
