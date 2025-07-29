import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAgentStore } from '../../stores/agentStore';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiInfo, FiChevronRight, FiChevronLeft, FiCheck } = FiIcons;

function CreateAgentWizard({ workspaceId, onClose, parentAgentId = null }) {
  const { createAgent, agents } = useAgentStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: parentAgentId ? 'specialized' : 'primary',
    capabilities: '',
    systemPrompt: '',
    parentId: parentAgentId,
    settings: {
      internetAccess: false,
      knowledgeBase: true,
      memoryEnabled: true,
      maxTokens: 2000,
      temperature: 0.7,
      contextWindow: 'medium'
    }
  });

  const primaryAgents = agents.filter(agent => 
    agent.workspaceId === workspaceId && agent.type === 'primary'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const agentData = {
      ...formData,
      workspaceId,
      capabilities: formData.capabilities.split(',').map(cap => cap.trim()).filter(Boolean),
      metrics: {
        successRate: 0,
        avgResponse: 0,
        totalInteractions: 0,
        lastEvaluation: new Date().toISOString()
      }
    };
    createAgent(agentData);
    onClose();
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center space-x-2 mb-6">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-3 h-3 rounded-full ${
              i === step 
                ? 'bg-indigo-500' 
                : i < step 
                  ? 'bg-green-500' 
                  : 'bg-slate-600'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
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
                  disabled={parentAgentId !== null}
                >
                  <option value="specialized">Specialized Agent</option>
                  <option value="primary">Primary Agent</option>
                </select>
                {formData.type === 'specialized' && !parentAgentId && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Parent Agent (Optional)
                    </label>
                    <select
                      value={formData.parentId || ''}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">None (Independent Agent)</option>
                      {primaryAgents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Capabilities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.capabilities}
                  onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Code Generation, Debug Analysis, Architecture Review"
                />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
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
                  rows="10"
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
          </>
        );
      case 3:
        return (
          <>
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
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-white">Create New Agent</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          <div className="flex gap-3 pt-4 border-t border-slate-700">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 px-4 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiChevronLeft} className="w-4 h-4" />
                Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                Next
                <SafeIcon icon={FiChevronRight} className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <SafeIcon icon={FiCheck} className="w-4 h-4" />
                Create Agent
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateAgentWizard;