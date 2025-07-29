import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAgentStore } from '../stores/agentStore';
import AgentCard from '../components/Agent/AgentCard';
import CreateAgentWizard from '../components/Agent/CreateAgentWizard';
import AgentHierarchyView from '../components/Agent/AgentHierarchyView';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiSearch, FiFilter, FiList, FiGrid } = FiIcons;

function AgentManagement() {
  const { workspaceId } = useParams();
  const { getAgentsByWorkspace } = useAgentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedParentId, setSelectedParentId] = useState(null);

  const agents = getAgentsByWorkspace(workspaceId);
  
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || agent.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const primaryAgents = filteredAgents.filter(agent => agent.type === 'primary');
  const specializedAgents = filteredAgents.filter(agent => agent.type === 'specialized');

  const handleCreateSubAgent = (parentId) => {
    setSelectedParentId(parentId);
    setShowCreateModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Agent Management</h1>
          <p className="text-slate-400">Create and manage your AI agents</p>
        </div>
        
        <motion.button
          onClick={() => {
            setSelectedParentId(null);
            setShowCreateModal(true);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 lg:mt-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-indigo-600 hover:to-purple-700 transition-all duration-200"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5" />
          Create Agent
        </motion.button>
      </div>

      {/* Agent Hierarchy View */}
      <AgentHierarchyView 
        agents={agents} 
        workspaceId={workspaceId} 
        onCreateSubAgent={handleCreateSubAgent}
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <SafeIcon 
            icon={FiSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"
          />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <SafeIcon icon={FiFilter} className="w-5 h-5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Agents</option>
            <option value="primary">Primary Agents</option>
            <option value="specialized">Specialized Agents</option>
          </select>
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

      {/* Primary Agents */}
      {primaryAgents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Primary Agents</h2>
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {primaryAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AgentCard agent={agent} workspaceId={workspaceId} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Specialized Agents */}
      {specializedAgents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Specialized Agents</h2>
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {specializedAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AgentCard agent={agent} workspaceId={workspaceId} />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            {searchTerm ? 'No agents found matching your search.' : 'No agents created yet.'}
          </div>
          {!searchTerm && (
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
            >
              Create Your First Agent
            </motion.button>
          )}
        </div>
      )}

      {/* Create Agent Modal */}
      {showCreateModal && (
        <CreateAgentWizard 
          workspaceId={workspaceId}
          parentAgentId={selectedParentId}
          onClose={() => setShowCreateModal(false)} 
        />
      )}
    </div>
  );
}

export default AgentManagement;