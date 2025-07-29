import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiCalendar, FiMoreHorizontal } = FiIcons;

function ProjectCard({ project, workspaceId }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link
              to={`/workspace/${workspaceId}/project/${project.id}`}
              className="text-white font-semibold hover:text-blue-400 transition-colors"
            >
              {project.name}
            </Link>
            <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
          <p className="text-slate-400 text-sm">{project.description}</p>
        </div>
        
        <button className="text-slate-400 hover:text-white">
          <SafeIcon icon={FiMoreHorizontal} className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Project Stats */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <div className="flex items-center gap-1">
          <SafeIcon icon={FiUsers} className="w-4 h-4" />
          <span>{project.members} members</span>
        </div>
        <div className="flex items-center gap-1">
          <SafeIcon icon={FiCalendar} className="w-4 h-4" />
          <span>{formatDistanceToNow(new Date(project.lastActivity), { addSuffix: true })}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default ProjectCard;