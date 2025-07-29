import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAgentStore } from '../../stores/agentStore';
import { llmService } from '../../services/llmService';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiZap, FiRefreshCw, FiCheck, FiPlus, FiMinus } = FiIcons;

function IntelligentAgentCreator({ workspaceId, onClose, parentAgentId = null }) {
  const { createAgent } = useAgentStore();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState('');
  const [generatedConfig, setGeneratedConfig] = useState(null);
  const [selectedSubAgents, setSelectedSubAgents] = useState([]);

  const handleGenerateConfig = async () => {
    if (!description.trim()) return;

    setIsGenerating(true);
    try {
      const config = await llmService.generateAgentConfig(description);
      setGeneratedConfig(config);
      setStep(2);
    } catch (error) {
      console.error('Error generating agent config:', error);
      // Fallback to manual creation
      alert('AI generation failed. Please try again or create manually.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateAgent = () => {
    if (!generatedConfig) return;

    // Create main agent
    const mainAgent = {
      ...generatedConfig,
      workspaceId,
      parentId: parentAgentId,
      capabilities: generatedConfig.capabilities || [],
      metrics: {
        successRate: 0,
        avgResponse: 0,
        totalInteractions: 0,
        lastEvaluation: new Date().toISOString()
      }
    };

    const createdAgent = createAgent(mainAgent);

    // Create selected sub-agents
    selectedSubAgents.forEach(subAgent => {
      const subAgentData = {
        name: subAgent.name,
        description: subAgent.description,
        type: 'specialized',
        capabilities: subAgent.capabilities || [],
        systemPrompt: `You are ${subAgent.name}, a specialized agent that ${subAgent.description}. You work under the ${generatedConfig.name} agent.`,
        workspaceId,
        parentId: createdAgent.id,
        settings: generatedConfig.settings || {}
      };
      
      createAgent(subAgentData);
    });

    onClose();
  };

  const toggleSubAgent = (subAgent) => {
    setSelectedSubAgents(prev => {
      const exists = prev.find(sa => sa.name === subAgent.name);
      if (exists) {
        return prev.filter(sa => sa.name !== subAgent.name);
      } else {
        return [...prev, subAgent];
      }
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Describe Your Agent</h3>
        <p className="text-slate-400 text-sm mb-4">
          Tell me what you want your agent to do. I'll generate a complete configuration for you.
        </p>
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows="6"
          placeholder="Example: I need an agent that can help with customer support. It should be able to answer questions about our products, handle complaints, escalate issues to human agents when needed, and maintain a friendly, professional tone. It should also be able to access our knowledge base and create support tickets."
        />
      </div>

      <div className="bg-slate-700/50 rounded-lg p-4">
        <h4 className="text-white font-medium mb-2">Tips for Better Results</h4>
        <ul className="text-slate-300 text-sm space-y-1 list-disc pl-4">
          <li>Be specific about the agent's primary purpose</li>
          <li>Mention any tools or integrations needed</li>
          <li>Describe the desired personality or tone</li>
          <li>Include any specific capabilities or limitations</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleGenerateConfig}
          disabled={!description.trim() || isGenerating}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <SafeIcon icon={FiRefreshCw} className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <SafeIcon icon={FiZap} className="w-5 h-5" />
              Generate Agent
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Review Generated Configuration</h3>
        <p className="text-slate-400 text-sm mb-4">
          I've generated a complete agent configuration based on your description. Review and customize as needed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Agent Config */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Main Agent</h4>
          
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={generatedConfig?.name || ''}
                  onChange={(e) => setGeneratedConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={generatedConfig?.description || ''}
                  onChange={(e) => setGeneratedConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={generatedConfig?.type || 'specialized'}
                  onChange={(e) => setGeneratedConfig(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="primary">Primary Agent</option>
                  <option value="specialized">Specialized Agent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Capabilities</label>
                <div className="flex flex-wrap gap-2">
                  {generatedConfig?.capabilities?.map((capability, index) => (
                    <span key={index} className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <h5 className="text-white font-medium mb-2">System Prompt</h5>
            <textarea
              value={generatedConfig?.systemPrompt || ''}
              onChange={(e) => setGeneratedConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows="6"
            />
          </div>
        </div>

        {/* Sub-Agents */}
        <div className="space-y-4">
          <h4 className="text-white font-medium">Suggested Sub-Agents</h4>
          
          {generatedConfig?.suggestedSubAgents?.length > 0 ? (
            <div className="space-y-3">
              {generatedConfig.suggestedSubAgents.map((subAgent, index) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="text-white font-medium">{subAgent.name}</h5>
                      <p className="text-slate-400 text-sm mt-1">{subAgent.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {subAgent.capabilities?.map((capability, capIndex) => (
                          <span key={capIndex} className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSubAgent(subAgent)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedSubAgents.find(sa => sa.name === subAgent.name)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                      }`}
                    >
                      <SafeIcon 
                        icon={selectedSubAgents.find(sa => sa.name === subAgent.name) ? FiCheck : FiPlus} 
                        className="w-4 h-4" 
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
              <p className="text-slate-400 text-sm">No sub-agents suggested for this configuration.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t border-slate-700">
        <button
          onClick={() => setStep(1)}
          className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleCreateAgent}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <SafeIcon icon={FiCheck} className="w-5 h-5" />
          Create Agent{selectedSubAgents.length > 0 && ` + ${selectedSubAgents.length} Sub-Agents`}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Intelligent Agent Creator</h2>
            <p className="text-slate-400 text-sm">Describe your needs and I'll create the perfect agent for you</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i === step ? 'bg-indigo-500' : i < step ? 'bg-green-500' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
      </motion.div>
    </div>
  );
}

export default IntelligentAgentCreator;