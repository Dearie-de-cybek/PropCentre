import React from 'react';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';

const StatCard = ({ title, value, change, icon, color = 'bg-blue-500' }) => {
  // Determine if the change is positive, negative, or neutral
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');
  const isNeutral = !isPositive && !isNegative;
  
  return (
    <div className="bg-[#1E1E1E] rounded-lg p-5 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <span className="text-gray-400 text-sm">{title}</span>
        <div className={`p-2 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-white text-2xl font-bold">
            {value && typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          
          {change && (
            <div className="flex items-center mt-1">
              {isPositive && <TrendingUpIcon size={14} className="text-green-500 mr-1" />}
              {isNegative && <TrendingDownIcon size={14} className="text-red-500 mr-1" />}
              {isNeutral && <MinusIcon size={14} className="text-gray-500 mr-1" />}
              
              <span className={`text-xs ${
                isPositive 
                  ? 'text-green-500' 
                  : isNegative 
                    ? 'text-red-500' 
                    : 'text-gray-500'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;