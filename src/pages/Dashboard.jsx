import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWorkspaceStore } from '../stores/workspaceStore';
import WorkspaceCard from '../components/Workspace/WorkspaceCard';
import CreateWorkspaceModal from '../components/Workspace/CreateWorkspaceModal';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiSearch, FiGrid, FiList, FiActivity } = FiIcons;

function Dashboard() {
  const { workspaces } = useWorkspaceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Recent activity data (mock)
  const recentActivity = [
    {
      id: 1,
      type: 'workspace_created',
      workspace: 'Marketing Automation',
      timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    },
    {
      id: 2,
      type: 'agent_created',
      workspace: 'AI Development Hub',
      agentName: 'Content Creator',
      timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    },
    {
      id: 3,
      type: 'team_member_added',
      workspace: 'Research & Analysis',
      memberName: 'Sarah Johnson',
      timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    }
  ];

  // Format activity message
  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'workspace_created':
        return `Created workspace "${activity.workspace}"`;
      case 'agent_created':
        return `Added agent "${activity.agentName}" to ${activity.workspace}`;
      case 'team_member_added':
        return `Added ${activity.memberName} to ${activity.workspace}`;
      default:
        return 'Unknown activity';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Your Workspaces</h1>
          <p className="text-slate-400">Manage and organize your AI agent workspaces</p>
        </div>
        
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 lg:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          Create Workspace
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <SafeIcon 
                icon={FiSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"
              />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex bg-slate-800 border border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <SafeIcon icon={FiGrid} className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <SafeIcon icon={FiList} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Workspaces Grid */}
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {filteredWorkspaces.map((workspace, index) => (
              <motion.div
                key={workspace.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <WorkspaceCard workspace={workspace} viewMode={viewMode} />
              </motion.div>
            ))}
          </div>

          {filteredWorkspaces.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                {searchTerm ? 'No workspaces found matching your search.' : 'No workspaces yet.'}
              </div>
              {!searchTerm && (
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                >
                  Create Your First Workspace
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-6">
              <SafeIcon icon={FiActivity} className="w-5 h-5 text-indigo-400" />
              <h3 className="text-white font-semibold">Recent Activity</h3>
            </div>

            <div className="space-y-4">
              {recentActivity.map(activity => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-700 text-indigo-400">
                    <SafeIcon icon={FiActivity} className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm">{getActivityMessage(activity)}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700">
              <h4 className="text-white text-sm font-medium mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs">Total Agents</div>
                  <div className="text-white text-xl font-semibold mt-1">24</div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="text-slate-400 text-xs">Active Projects</div>
                  <div className="text-white text-xl font-semibold mt-1">7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <CreateWorkspaceModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

export default Dashboard;