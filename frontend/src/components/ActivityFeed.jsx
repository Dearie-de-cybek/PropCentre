import React from 'react';
import { 
  MessageCircleIcon, 
  CalendarIcon, 
  HomeIcon, 
  BellIcon 
} from 'lucide-react';

const ActivityFeed = ({ activities = [] }) => {
  // Get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'message':
        return (
          <div className="p-2 rounded-full bg-blue-500">
            <MessageCircleIcon size={16} className="text-white" />
          </div>
        );
      case 'appointment':
        return (
          <div className="p-2 rounded-full bg-green-500">
            <CalendarIcon size={16} className="text-white" />
          </div>
        );
      case 'property':
        return (
          <div className="p-2 rounded-full bg-purple-500">
            <HomeIcon size={16} className="text-white" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="p-2 rounded-full bg-gray-500">
            <BellIcon size={16} className="text-white" />
          </div>
        );
    }
  };

  return (
    <div className="p-4">
      {activities.length > 0 ? (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex space-x-3">
              {/* Icon */}
              {getActivityIcon(activity.type)}
              
              {/* Content */}
              <div className="flex-1">
                <p className="text-white text-sm">{activity.content}</p>
                <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400">No recent activity</p>
        </div>
      )}
      
      {activities.length > 4 && (
        <div className="mt-4 text-center">
          <button className="text-blue-500 text-sm">
            View all activity
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;