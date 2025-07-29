import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMessageCircle, FiEdit3, FiActivity, FiUsers, FiSettings, FiBarChart2, FiZap } = FiIcons;

function AgentCard({ agent, workspaceId }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAgentIcon = (type) => {
    return type === 'primary' ? '🎯' : '🤖';
  };

  const getAgentTypeLabel = (type) => {
    return type === 'primary' ? 'Primary' : 'Specialized';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center text-2xl">
            {getAgentIcon(agent.type)}
          </div>
          <div>
            <h3 className="text-white font-semibold">{agent.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
              <span className="text-slate-400 text-xs capitalize">{agent.status}</span>
              <span className="text-xs text-slate-500 px-1.5 py-0.5 bg-slate-700 rounded">
                {getAgentTypeLabel(agent.type)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link 
            to={`/workspace/${workspaceId}/agent/${agent.id}`}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
          >
            <SafeIcon icon={FiSettings} className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <p className="text-slate-400 text-sm mb-4">{agent.description}</p>

      {/* Capabilities */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {agent.capabilities.map((capability, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md"
            >
              {capability}
            </span>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      {agent.metrics && (
        <div className="mb-4 pt-3 border-t border-slate-700">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <div className="flex items-center gap-1">
              <SafeIcon icon={FiBarChart2} className="w-3 h-3" />
              <span>Performance</span>
            </div>
            <span className="text-indigo-400">View Details</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-slate-300 text-xs mb-1">Success Rate</div>
              <div className="text-white text-sm font-semibold">{agent.metrics.successRate}%</div>
            </div>
            <div className="bg-slate-700/50 rounded p-2">
              <div className="text-slate-300 text-xs mb-1">Avg. Response</div>
              <div className="text-white text-sm font-semibold">{agent.metrics.avgResponse}s</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
        <div className="flex items-center gap-1">
          <SafeIcon icon={FiUsers} className="w-4 h-4" />
          <span>{agent.connections} connections</span>
        </div>
        <div className="flex items-center gap-1">
          <SafeIcon icon={FiActivity} className="w-4 h-4" />
          <span>{formatDistanceToNow(new Date(agent.lastActivity), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/workspace/${workspaceId}/chat/${agent.id}`}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon={FiMessageCircle} className="w-4 h-4" />
          Chat
        </Link>
        <button
          className="flex-1 bg-slate-700 text-white py-2 px-4 rounded-lg font-medium hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
        >
          <SafeIcon icon={FiZap} className="w-4 h-4" />
          Run Task
        </button>
      </div>
    </motion.div>
  );
}

export default AgentCard;