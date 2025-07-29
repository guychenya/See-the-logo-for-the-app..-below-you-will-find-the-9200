import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMessageCircle, FiPlus, FiEdit3, FiUsers, FiActivity } = FiIcons;

function ActivityFeed({ workspaceId }) {
  // Mock activity data
  const activities = [
    {
      id: '1',
      type: 'agent_created',
      title: 'New agent created',
      description: 'Content Creator agent was added to the workspace',
      timestamp: new Date().toISOString(),
      icon: FiPlus,
      color: 'text-green-400'
    },
    {
      id: '2',
      type: 'chat_started',
      title: 'Chat session started',
      description: 'User started conversation with Code Assistant',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      icon: FiMessageCircle,
      color: 'text-blue-400'
    },
    {
      id: '3',
      type: 'agent_updated',
      title: 'Agent configuration updated',
      description: 'Orchestrator settings were modified',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      icon: FiEdit3,
      color: 'text-yellow-400'
    },
    {
      id: '4',
      type: 'member_invited',
      title: 'New member invited',
      description: 'Sarah Johnson was invited to join the workspace',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      icon: FiUsers,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <SafeIcon icon={FiActivity} className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-semibold">Recent Activity</h3>
      </div>

      <div className="space-y-4">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-slate-700 ${activity.color}`}>
              <SafeIcon icon={activity.icon} className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-white text-sm font-medium">{activity.title}</h4>
              <p className="text-slate-400 text-xs mt-1">{activity.description}</p>
              <p className="text-slate-500 text-xs mt-1">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 text-blue-400 text-sm hover:text-blue-300 transition-colors">
        View all activity
      </button>
    </div>
  );
}

export default ActivityFeed;