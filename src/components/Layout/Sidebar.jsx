import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { ApexSpriteFullLogo } from '../../assets/apexsprite-logo';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiSettings, FiFolder, FiBot, FiUsers, FiDatabase, FiActivity, FiBarChart2, FiClock, FiChevronRight, FiChevronDown } = FiIcons;

function Sidebar() {
  const location = useLocation();
  const { workspaces, currentWorkspace } = useWorkspaceStore();
  const [expandedWorkspace, setExpandedWorkspace] = useState(null);

  const navigationItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/settings', icon: FiSettings, label: 'Settings' }
  ];

  const isActive = (path) => location.pathname === path;
  const isWorkspaceActive = (id) => location.pathname.includes(`/workspace/${id}`);

  const toggleWorkspace = (id) => {
    if (expandedWorkspace === id) {
      setExpandedWorkspace(null);
    } else {
      setExpandedWorkspace(id);
    }
  };

  const workspaceNavigationItems = [
    { path: '', icon: FiActivity, label: 'Overview' },
    { path: '/agents', icon: FiBot, label: 'Agents' },
    { path: '/team', icon: FiUsers, label: 'Team' },
    { path: '/repository', icon: FiDatabase, label: 'Repository' },
    { path: '/history', icon: FiClock, label: 'History' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' }
  ];

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <ApexSpriteFullLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2 mb-6">
          {navigationItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <SafeIcon icon={item.icon} className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Workspaces */}
        <div>
          <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-3">
            Workspaces
          </h3>
          <div className="space-y-1">
            {workspaces.map(workspace => (
              <div key={workspace.id} className="space-y-1">
                <button
                  onClick={() => toggleWorkspace(workspace.id)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${
                    isWorkspaceActive(workspace.id)
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${workspace.color}-500`} />
                    <span className="truncate text-sm">{workspace.name}</span>
                  </div>
                  <SafeIcon
                    icon={expandedWorkspace === workspace.id ? FiChevronDown : FiChevronRight}
                    className="w-4 h-4"
                  />
                </button>

                {(expandedWorkspace === workspace.id || isWorkspaceActive(workspace.id)) && (
                  <div className="ml-4 pl-3 border-l border-slate-700 space-y-1 mt-1">
                    {workspaceNavigationItems.map(item => (
                      <Link
                        key={`${workspace.id}-${item.path}`}
                        to={`/workspace/${workspace.id}${item.path}`}
                        className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-colors ${
                          location.pathname === `/workspace/${workspace.id}${item.path}`
                            ? 'bg-indigo-600/20 text-indigo-400'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <SafeIcon icon={item.icon} className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Sidebar;