import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { useAgentStore } from '../stores/agentStore';
import AgentCard from '../components/Agent/AgentCard';
import ProjectCard from '../components/Project/ProjectCard';
import ActivityFeed from '../components/Activity/ActivityFeed';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiUsers, FiFolder, FiBot, FiActivity } = FiIcons;

function WorkspaceView() {
  const { workspaceId } = useParams();
  const { setCurrentWorkspace, currentWorkspace } = useWorkspaceStore();
  const { getAgentsByWorkspace } = useAgentStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setCurrentWorkspace(workspaceId);
  }, [workspaceId, setCurrentWorkspace]);

  if (!currentWorkspace) {
    return <div className="p-6 text-white">Loading workspace...</div>;
  }

  const agents = getAgentsByWorkspace(workspaceId);
  const primaryAgent = agents.find(agent => agent.type === 'primary');
  const specializedAgents = agents.filter(agent => agent.type === 'specialized');

  // Mock projects data
  const projects = [
    {
      id: '1',
      name: 'Content Automation Pipeline',
      description: 'Automated content generation and publishing workflow',
      status: 'active',
      progress: 75,
      members: 3,
      lastActivity: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Customer Support Bot',
      description: 'AI-powered customer service automation',
      status: 'completed',
      progress: 100,
      members: 2,
      lastActivity: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiActivity },
    { id: 'agents', label: 'Agents', icon: FiBot },
    { id: 'projects', label: 'Projects', icon: FiFolder },
    { id: 'members', label: 'Members', icon: FiUsers }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{currentWorkspace.name}</h1>
          <p className="text-slate-400">{currentWorkspace.description}</p>
        </div>
        
        <div className="flex gap-3 mt-4 lg:mt-0">
          <Link
            to={`/workspace/${workspaceId}/agents`}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiBot} className="w-4 h-4" />
            Manage Agents
          </Link>
          <button className="bg-slate-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-600 transition-colors flex items-center gap-2">
            <SafeIcon icon={FiUsers} className="w-4 h-4" />
            Invite Members
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Agents</p>
              <p className="text-2xl font-bold text-white">{agents.length}</p>
            </div>
            <SafeIcon icon={FiBot} className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Projects</p>
              <p className="text-2xl font-bold text-white">{projects.filter(p => p.status === 'active').length}</p>
            </div>
            <SafeIcon icon={FiFolder} className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Team Members</p>
              <p className="text-2xl font-bold text-white">{currentWorkspace.members}</p>
            </div>
            <SafeIcon icon={FiUsers} className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Active Connections</p>
              <p className="text-2xl font-bold text-white">{agents.reduce((sum, agent) => sum + agent.connections, 0)}</p>
            </div>
            <SafeIcon icon={FiActivity} className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Agent */}
              {primaryAgent && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Primary Agent</h3>
                  <AgentCard agent={primaryAgent} workspaceId={workspaceId} />
                </div>
              )}
              
              {/* Specialized Agents */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Specialized Agents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specializedAgents.map(agent => (
                    <AgentCard key={agent.id} agent={agent} workspaceId={workspaceId} />
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'projects' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Projects</h3>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  New Project
                </button>
              </div>
              <div className="space-y-4">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} workspaceId={workspaceId} />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <ActivityFeed workspaceId={workspaceId} />
        </div>
      </div>
    </div>
  );
}

export default WorkspaceView;