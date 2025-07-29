import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBell, FiSearch, FiChevronDown, FiLogOut, FiUser, FiSettings } = FiIcons;

function Header() {
  const { user, logout } = useAuthStore();
  const { workspaceId } = useParams();
  const location = useLocation();
  const { currentWorkspace } = useWorkspaceStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock notifications
  const notifications = [
    {
      id: 1,
      title: 'New team member',
      message: 'Alex Johnson joined your workspace',
      time: '2 minutes ago',
      read: false
    },
    {
      id: 2,
      title: 'Agent configuration updated',
      message: 'Research Assistant agent was updated',
      time: '1 hour ago',
      read: false
    },
    {
      id: 3,
      title: 'Project milestone completed',
      message: 'Content Generation project reached 75% completion',
      time: '3 hours ago',
      read: true
    }
  ];

  const getPageTitle = () => {
    if (location.pathname === '/dashboard') return 'Dashboard';
    if (location.pathname === '/settings') return 'Settings';
    
    if (currentWorkspace) {
      if (location.pathname.endsWith(`/workspace/${workspaceId}`)) return currentWorkspace.name;
      if (location.pathname.includes(`/workspace/${workspaceId}/agents`)) return 'Agent Management';
      if (location.pathname.includes(`/workspace/${workspaceId}/agent/`)) return 'Agent Configuration';
      if (location.pathname.includes(`/workspace/${workspaceId}/project/`)) return 'Project View';
      if (location.pathname.includes(`/workspace/${workspaceId}/chat/`)) return 'Chat Interface';
      if (location.pathname.includes(`/workspace/${workspaceId}/repository`)) return 'Repository';
      if (location.pathname.includes(`/workspace/${workspaceId}/history`)) return 'Content History';
      if (location.pathname.includes(`/workspace/${workspaceId}/team`)) return 'Team Management';
      if (location.pathname.includes(`/workspace/${workspaceId}/analytics`)) return 'Analytics Dashboard';
    }
    
    return 'ApexSprite';
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-white">{getPageTitle()}</h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <SafeIcon 
              icon={FiSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"
            />
            <input
              type="text"
              placeholder="Search agents, projects, or content..."
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              className="relative p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <SafeIcon icon={FiBell} className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                <div className="p-3 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="font-medium text-white">Notifications</h3>
                  <button className="text-xs text-indigo-400 hover:text-indigo-300">Mark all as read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`p-3 border-b border-slate-700 hover:bg-slate-700/50 ${!notification.read ? 'bg-slate-700/20' : ''}`}
                    >
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                        <span className="text-xs text-slate-500">{notification.time}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center">
                  <button className="text-sm text-indigo-400 hover:text-indigo-300">View all notifications</button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-white font-medium">{user?.name}</span>
              <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  <button className="flex items-center gap-3 w-full px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white">
                    <SafeIcon icon={FiUser} className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="flex items-center gap-3 w-full px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white">
                    <SafeIcon icon={FiSettings} className="w-4 h-4" />
                    Preferences
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-4 py-2 text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    <SafeIcon icon={FiLogOut} className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;