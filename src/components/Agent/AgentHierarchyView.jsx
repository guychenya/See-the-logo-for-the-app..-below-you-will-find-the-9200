import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlusCircle } = FiIcons;

function AgentHierarchyView({ agents, workspaceId, onCreateSubAgent }) {
  // Filter primary agents (those without a parent)
  const primaryAgents = agents.filter(agent => agent.parentId === null);
  
  // Get specialized agents for a specific parent
  const getChildAgents = (parentId) => {
    return agents.filter(agent => agent.parentId === parentId);
  };
  
  const renderAgent = (agent, isChild = false) => {
    const childAgents = getChildAgents(agent.id);
    
    return (
      <div key={agent.id} className={`${isChild ? 'ml-8' : ''}`}>
        <div className={`bg-slate-800 border ${isChild ? 'border-slate-700/50' : 'border-slate-700'} rounded-lg p-4 mb-2 hover:border-slate-600 transition-all duration-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${isChild ? 'bg-slate-700/70' : 'bg-slate-700'} rounded-lg flex items-center justify-center text-xl`}>
                {isChild ? '🤖' : '🎯'}
              </div>
              <div>
                <Link to={`/workspace/${workspaceId}/agent/${agent.id}`} className="text-white font-medium hover:text-indigo-400">
                  {agent.name}
                </Link>
                <div className="text-slate-400 text-xs mt-0.5">
                  {agent.capabilities.slice(0, 2).join(', ')}
                  {agent.capabilities.length > 2 && ' ...'}
                </div>
              </div>
            </div>
            
            {!isChild && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => onCreateSubAgent(agent.id)}
                className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
              >
                <SafeIcon icon={FiPlusCircle} className="w-4 h-4" />
                Add Sub-Agent
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Render child agents */}
        {childAgents.length > 0 && (
          <div className="pl-4 border-l-2 border-slate-700 ml-5 mt-1 mb-4 space-y-2">
            {childAgents.map(childAgent => renderAgent(childAgent, true))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6">
      <h3 className="text-white font-semibold mb-4">Agent Hierarchy</h3>
      
      <div className="space-y-4">
        {primaryAgents.map(agent => renderAgent(agent))}
      </div>
      
      {primaryAgents.length === 0 && (
        <div className="text-center py-6 text-slate-400">
          <p>No primary agents created yet.</p>
        </div>
      )}
    </div>
  );
}

export default AgentHierarchyView;