import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiFolder, FiBot, FiMoreHorizontal } = FiIcons;

function WorkspaceCard({ workspace, viewMode = 'grid' }) {
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-indigo-500';
      case 'admin': return 'bg-green-500';
      case 'member': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all duration-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-${workspace.color}-500 rounded-lg flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">{workspace.name.charAt(0)}</span>
            </div>
            <div>
              <Link to={`/workspace/${workspace.id}`} className="text-white font-semibold hover:text-indigo-400 transition-colors">
                {workspace.name}
              </Link>
              <p className="text-slate-400 text-sm">{workspace.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <SafeIcon icon={FiUsers} className="w-4 h-4" />
                {workspace.members}
              </div>
              <div className="flex items-center gap-1">
                <SafeIcon icon={FiFolder} className="w-4 h-4" />
                {workspace.projects}
              </div>
              <div className="flex items-center gap-1">
                <SafeIcon icon={FiBot} className="w-4 h-4" />
                {workspace.agents}
              </div>
            </div>
            
            <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getRoleBadgeColor(workspace.role)}`}>
              {workspace.role}
            </span>
            
            <button className="text-slate-400 hover:text-white">
              <SafeIcon icon={FiMoreHorizontal} className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-${workspace.color}-500 rounded-lg flex items-center justify-center`}>
          <span className="text-white font-bold text-lg">{workspace.name.charAt(0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getRoleBadgeColor(workspace.role)}`}>
            {workspace.role}
          </span>
          <button className="text-slate-400 hover:text-white">
            <SafeIcon icon={FiMoreHorizontal} className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <Link to={`/workspace/${workspace.id}`} className="text-white font-semibold text-lg hover:text-indigo-400 transition-colors">
          {workspace.name}
        </Link>
        <p className="text-slate-400 text-sm mt-1">{workspace.description}</p>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <SafeIcon icon={FiUsers} className="w-4 h-4" />
            {workspace.members}
          </div>
          <div className="flex items-center gap-1">
            <SafeIcon icon={FiFolder} className="w-4 h-4" />
            {workspace.projects}
          </div>
          <div className="flex items-center gap-1">
            <SafeIcon icon={FiBot} className="w-4 h-4" />
            {workspace.agents}
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Last activity {formatDistanceToNow(new Date(workspace.lastActivity), { addSuffix: true })}
      </div>
    </motion.div>
  );
}

export default WorkspaceCard;