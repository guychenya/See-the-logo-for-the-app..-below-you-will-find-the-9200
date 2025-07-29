import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAgentStore } from '../stores/agentStore';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSave, FiTrash2, FiInfo, FiArrowLeft, FiPlus, FiX } = FiIcons;

function AgentConfiguration() {
  const { workspaceId, agentId } = useParams();
  const navigate = useNavigate();
  const { agents, updateAgent, deleteAgent } = useAgentStore();
  const agent = agents.find(a => a.id === agentId);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    capabilities: '',
    systemPrompt: '',
    parentId: null,
    settings: {
      internetAccess: false,
      knowledgeBase: true,
      memoryEnabled: true,
      maxTokens: 2000,
      temperature: 0.7,
      contextWindow: 'medium'
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (agent) {
      setFormData({
        ...agent,
        capabilities: agent.capabilities.join(', ')
      });
    }
  }, [agent]);

  if (!agent) {
    return <div className="p-6 text-white">Agent not found</div>;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedAgent = {
      ...formData,
      capabilities: formData.capabilities.split(',').map(cap => cap.trim()).filter(Boolean)
    };
    updateAgent(agentId, updatedAgent);
    // Show success message
  };

  const handleDelete = () => {
    deleteAgent(agentId);
    navigate(`/workspace/${workspaceId}/agents`);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'system-prompt', label: 'System Prompt' },
    { id: 'settings', label: 'Settings' },
    { id: 'connections', label: 'Connections' },
    { id: 'analytics', label: 'Analytics' }
  ];

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(`/workspace/${workspaceId}/agents`)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Agent Configuration</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700 mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
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
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled
              >
                <option value="primary">Primary Agent</option>
                <option value="specialized">Specialized Agent</option>
              </select>
              <p className="mt-1 text-xs text-slate-400">Agent type cannot be changed after creation.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Capabilities
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.capabilities}
                  onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Code Generation, Debug Analysis, Architecture Review"
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Separate capabilities with commas</p>
            </div>
          </div>
        )}

        {/* System Prompt Tab */}
        {activeTab === 'system-prompt' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-white">System Prompt</h3>
              <div className="group relative">
                <SafeIcon icon={FiInfo} className="w-4 h-4 text-slate-400" />
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-slate-900 rounded text-xs text-slate-300">
                  The system prompt defines your agent's behavior, personality, and capabilities. Be specific about what your agent should and shouldn't do.
                </div>
              </div>
            </div>
            
            <div>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows="15"
                placeholder="Define your agent's behavior, personality, and specific instructions..."
              />
            </div>

            <div className="p-3 bg-slate-700/50 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">Prompt Guidelines</h4>
              <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                <li>Be specific about the agent's role and responsibilities</li>
                <li>Define communication style and personality traits</li>
                <li>Include any domain-specific knowledge or approaches</li>
                <li>Specify any limitations or boundaries</li>
              </ul>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Advanced Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Enable Internet Access</h4>
                  <p className="text-slate-400 text-sm">Allow this agent to access real-time information from the web</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.settings.internetAccess}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        internetAccess: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Knowledge Base</h4>
                  <p className="text-slate-400 text-sm">Connect to workspace knowledge base for enhanced responses</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.settings.knowledgeBase}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        knowledgeBase: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Memory Persistence</h4>
                  <p className="text-slate-400 text-sm">Enable conversation history and context retention</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.settings.memoryEnabled}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        memoryEnabled: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-medium">Max Tokens</h4>
                  <span className="text-indigo-400 text-sm">{formData.settings.maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="8000"
                  step="500"
                  value={formData.settings.maxTokens}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      maxTokens: parseInt(e.target.value)
                    }
                  })}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>500</span>
                  <span>8000</span>
                </div>
              </div>

              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white font-medium">Temperature</h4>
                  <span className="text-indigo-400 text-sm">{formData.settings.temperature.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={formData.settings.temperature}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: {
                      ...formData.settings,
                      temperature: parseFloat(e.target.value)
                    }
                  })}
                  className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white">Agent Connections</h3>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Connected Data Sources</h4>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600/30 rounded-lg flex items-center justify-center text-indigo-400">
                      DB
                    </div>
                    <div>
                      <h5 className="text-white text-sm font-medium">Workspace Knowledge Base</h5>
                      <p className="text-slate-400 text-xs">Default repository for this workspace</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-white">
                    <SafeIcon icon={FiX} className="w-4 h-4" />
                  </button>
                </div>
                
                {formData.settings.internetAccess && (
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600/30 rounded-lg flex items-center justify-center text-blue-400">
                        🌐
                      </div>
                      <div>
                        <h5 className="text-white text-sm font-medium">Internet Access</h5>
                        <p className="text-slate-400 text-xs">Real-time web data</p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-white">
                      <SafeIcon icon={FiX} className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <button className="flex items-center gap-2 text-indigo-400 text-sm hover:text-indigo-300">
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                Connect New Data Source
              </button>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Agent Collaborations</h4>
              
              {formData.type === 'primary' ? (
                <div>
                  <p className="text-slate-400 text-sm mb-3">Sub-agents connected to this primary agent:</p>
                  <div className="space-y-2 mb-4">
                    {agents.filter(a => a.parentId === agentId).length > 0 ? (
                      agents.filter(a => a.parentId === agentId).map(subAgent => (
                        <div key={subAgent.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-lg">
                              🤖
                            </div>
                            <div>
                              <h5 className="text-white text-sm font-medium">{subAgent.name}</h5>
                              <p className="text-slate-400 text-xs">{subAgent.capabilities[0]}{subAgent.capabilities.length > 1 ? ', ...' : ''}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-sm">No sub-agents connected yet.</p>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/workspace/${workspaceId}/agents`)}
                    className="flex items-center gap-2 text-indigo-400 text-sm hover:text-indigo-300"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    Add Sub-Agent
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-slate-400 text-sm mb-3">This specialized agent is connected to:</p>
                  {formData.parentId ? (
                    <div className="bg-slate-800 p-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-lg">
                          🎯
                        </div>
                        <div>
                          <h5 className="text-white text-sm font-medium">
                            {agents.find(a => a.id === formData.parentId)?.name || 'Primary Agent'}
                          </h5>
                          <p className="text-slate-400 text-xs">Primary Agent</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">This agent operates independently (no parent agent).</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-white">Performance Analytics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-slate-400 text-sm mb-2">Success Rate</h4>
                <div className="text-white text-2xl font-bold">{agent.metrics?.successRate || 0}%</div>
                <div className="mt-2 h-2 bg-slate-600 rounded-full">
                  <div 
                    className="h-2 bg-green-500 rounded-full" 
                    style={{ width: `${agent.metrics?.successRate || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-slate-400 text-sm mb-2">Average Response Time</h4>
                <div className="text-white text-2xl font-bold">{agent.metrics?.avgResponse || 0}s</div>
                <div className="mt-2 text-xs text-slate-400">Last 7 days</div>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4">
                <h4 className="text-slate-400 text-sm mb-2">Total Interactions</h4>
                <div className="text-white text-2xl font-bold">{agent.metrics?.totalInteractions || 0}</div>
                <div className="mt-2 text-xs text-slate-400">Since creation</div>
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Usage Over Time</h4>
              <div className="h-60 flex items-center justify-center">
                <p className="text-slate-400">Detailed analytics will appear once the agent has more usage data.</p>
              </div>
            </div>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-4">Recent Evaluations</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-slate-300">Last evaluation</div>
                  <div className="text-slate-400">
                    {new Date(agent.metrics?.lastEvaluation || Date.now()).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-slate-300">Next scheduled evaluation</div>
                  <div className="text-slate-400">
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button className="mt-4 text-indigo-400 text-sm hover:text-indigo-300">
                Run Manual Evaluation
              </button>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between pt-6 border-t border-slate-700">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-red-400 hover:text-red-300 flex items-center gap-2"
          >
            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
            Delete Agent
          </button>
          
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <SafeIcon icon={FiSave} className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Delete Agent</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this agent? This action cannot be undone and all associated data will be permanently removed.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Agent
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AgentConfiguration;