import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAgentStore } from '../../stores/agentStore';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiInfo } = FiIcons;

function CreateAgentModal({ workspaceId, onClose }) {
  const { createAgent } = useAgentStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'specialized',
    capabilities: '',
    systemPrompt: '',
    parentId: null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const agentData = {
      ...formData,
      workspaceId,
      capabilities: formData.capabilities.split(',').map(cap => cap.trim()).filter(Boolean)
    };
    createAgent(agentData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Create New Agent</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Agent Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter agent name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="Describe your agent's purpose and functionality"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Agent Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="specialized">Specialized Agent</option>
                <option value="primary">Primary Agent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Capabilities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.capabilities}
                onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Code Generation, Debug Analysis, Architecture Review"
              />
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-white">System Prompt</h3>
              <SafeIcon icon={FiInfo} className="w-4 h-4 text-slate-400" />
            </div>
            
            <div>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="6"
                placeholder="Define your agent's behavior, personality, and specific instructions..."
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Settings</h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Enable Internet Access</h4>
                <p className="text-slate-400 text-sm">Allow this agent to access real-time information from the web</p>
              </div>
              <input
                type="checkbox"
                className="w-5 h-5 text-blue-500 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <h4 className="text-white font-medium">Knowledge Base</h4>
                <p className="text-slate-400 text-sm">Connect to workspace knowledge base for enhanced responses</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 text-blue-500 bg-slate-600 border-slate-500 rounded focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Create Agent
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateAgentModal;