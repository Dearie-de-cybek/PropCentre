import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircleIcon, 
  CalendarIcon, 
  MessageCircleIcon, 
  HeartIcon,
  BuildingIcon,
  SearchIcon,
  UsersIcon,
  FileTextIcon
} from 'lucide-react';

const QuickActions = ({ userType }) => {
  const isLandlord = userType === 'landlord';
  
  // Define quick actions based on user type
  const actions = isLandlord 
    ? [
        {
          icon: <PlusCircleIcon size={20} className="text-white" />,
          label: 'Add Property',
          path: '/dashboard/properties/add',
          color: 'bg-green-500'
        },
        {
          icon: <BuildingIcon size={20} className="text-white" />,
          label: 'Manage Properties',
          path: '/dashboard/properties',
          color: 'bg-blue-500'
        },
        {
          icon: <CalendarIcon size={20} className="text-white" />,
          label: 'Appointments',
          path: '/dashboard/appointments',
          color: 'bg-amber-500'
        },
        {
          icon: <UsersIcon size={20} className="text-white" />,
          label: 'Applicants',
          path: '/dashboard/applications',
          color: 'bg-purple-500'
        },
      ]
    : [
        {
          icon: <SearchIcon size={20} className="text-white" />,
          label: 'Search Properties',
          path: '/properties',
          color: 'bg-blue-500'
        },
        {
          icon: <HeartIcon size={20} className="text-white" />,
          label: 'Saved Properties',
          path: '/dashboard/saved',
          color: 'bg-red-500'
        },
        {
          icon: <CalendarIcon size={20} className="text-white" />,
          label: 'My Appointments',
          path: '/dashboard/appointments',
          color: 'bg-amber-500'
        },
        {
          icon: <FileTextIcon size={20} className="text-white" />,
          label: 'My Applications',
          path: '/dashboard/my-applications',
          color: 'bg-green-500'
        },
      ];

  return (
    <div className="bg-[#1E1E1E] rounded-lg">
      <div className="border-b border-[#404040] p-4">
        <h2 className="text-white font-bold">Quick Actions</h2>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className="bg-[#404040] rounded-lg p-4 flex flex-col items-center justify-center hover:bg-[#505050] transition-colors"
          >
            <div className={`p-2 rounded-full ${action.color} mb-2`}>
              {action.icon}
            </div>
            <span className="text-white text-sm text-center">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;