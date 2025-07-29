import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import { llmService } from '../../services/llmService';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiRefreshCw, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } = FiIcons;

function LLMSettings() {
  const { llmProviders, defaultProvider, updateProvider, setDefaultProvider, detectOllamaModels } = useSettingsStore();
  const [testResults, setTestResults] = useState({});
  const [isDetecting, setIsDetecting] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({});

  useEffect(() => {
    // Auto-detect Ollama models on component mount
    handleDetectOllama();
  }, []);

  const handleDetectOllama = async () => {
    setIsDetecting(true);
    try {
      const models = await detectOllamaModels();
      if (models.length > 0) {
        setTestResults(prev => ({
          ...prev,
          ollama: { success: true, message: `Found ${models.length} models` }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          ollama: { success: false, message: 'No models found. Make sure Ollama is running.' }
        }));
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        ollama: { success: false, message: 'Ollama not available' }
      }));
    }
    setIsDetecting(false);
  };

  const handleProviderUpdate = (provider, field, value) => {
    updateProvider(provider, { [field]: value });
  };

  const handleTestConnection = async (provider) => {
    setTestResults(prev => ({
      ...prev,
      [provider]: { testing: true }
    }));

    try {
      const result = await llmService.testConnection(provider);
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          success: result.success,
          message: result.success ? 'Connection successful' : result.error
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          success: false,
          message: error.message
        }
      }));
    }
  };

  const toggleApiKeyVisibility = (provider) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const renderProviderCard = (providerId, provider) => {
    const testResult = testResults[providerId];
    const isApiKeyVisible = showApiKeys[providerId];

    return (
      <div key={providerId} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-white font-semibold">{provider.name}</h3>
            {provider.isLocal && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Local
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={provider.enabled}
                onChange={(e) => handleProviderUpdate(providerId, 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
            
            {defaultProvider === providerId && (
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                Default
              </span>
            )}
          </div>
        </div>

        {provider.enabled && (
          <div className="space-y-4">
            {/* API Key */}
            {!provider.isLocal && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={isApiKeyVisible ? 'text' : 'password'}
                    value={provider.apiKey}
                    onChange={(e) => handleProviderUpdate(providerId, 'apiKey', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your API key"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility(providerId)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <SafeIcon icon={isApiKeyVisible ? FiEyeOff : FiEye} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Base URL */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Base URL
              </label>
              <input
                type="text"
                value={provider.baseUrl}
                onChange={(e) => handleProviderUpdate(providerId, 'baseUrl', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="API base URL"
              />
            </div>

            {/* Model Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">
                  Model
                </label>
                {providerId === 'ollama' && (
                  <button
                    onClick={handleDetectOllama}
                    disabled={isDetecting}
                    className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                  >
                    <SafeIcon 
                      icon={FiRefreshCw} 
                      className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} 
                    />
                    Detect Models
                  </button>
                )}
              </div>
              
              <select
                value={provider.selectedModel}
                onChange={(e) => handleProviderUpdate(providerId, 'selectedModel', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a model</option>
                {provider.models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* Test Connection */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleTestConnection(providerId)}
                disabled={testResult?.testing || !provider.selectedModel}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {testResult?.testing ? (
                  <>
                    <SafeIcon icon={FiRefreshCw} className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>

              {testResult && !testResult.testing && (
                <div className={`flex items-center gap-2 text-sm ${
                  testResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  <SafeIcon 
                    icon={testResult.success ? FiCheckCircle : FiAlertCircle} 
                    className="w-4 h-4" 
                  />
                  {testResult.message}
                </div>
              )}
            </div>

            {/* Set as Default */}
            {provider.enabled && provider.selectedModel && (
              <button
                onClick={() => setDefaultProvider(providerId)}
                disabled={defaultProvider === providerId}
                className="text-indigo-400 hover:text-indigo-300 text-sm disabled:opacity-50"
              >
                {defaultProvider === providerId ? 'Default Provider' : 'Set as Default'}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">LLM Provider Settings</h2>
        <p className="text-slate-400">Configure your language model providers and connections</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-medium">Getting Started</h3>
        </div>
        <div className="text-slate-300 text-sm space-y-2">
          <p>• <strong>Ollama (Recommended):</strong> Run models locally for privacy and no API costs</p>
          <p>• <strong>Cloud Providers:</strong> Use OpenAI, Anthropic, or Gemini for advanced capabilities</p>
          <p>• <strong>Default Provider:</strong> The selected provider will be used for all new agents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(llmProviders).map(([providerId, provider]) =>
          renderProviderCard(providerId, provider)
        )}
      </div>

      {/* Quick Setup for Ollama */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2">Quick Ollama Setup</h3>
        <div className="text-slate-300 text-sm space-y-2">
          <p>1. Install Ollama: <code className="bg-slate-700 px-2 py-1 rounded">curl -fsSL https://ollama.ai/install.sh | sh</code></p>
          <p>2. Pull a model: <code className="bg-slate-700 px-2 py-1 rounded">ollama pull llama2</code></p>
          <p>3. Click "Detect Models" above to auto-configure</p>
        </div>
      </div>
    </div>
  );
}

export default LLMSettings;