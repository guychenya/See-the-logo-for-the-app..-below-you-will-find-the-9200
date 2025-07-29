import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import { llmService } from '../../services/llmService';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiX, FiRefreshCw, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle, FiSettings, FiExternalLink } = FiIcons;

function LLMSettings() {
  const { 
    llmProviders, 
    defaultProvider, 
    updateProvider, 
    setDefaultProvider, 
    detectOllamaModels,
    updateAppSettings,
    appSettings 
  } = useSettingsStore();
  
  const [testResults, setTestResults] = useState({});
  const [showApiKeys, setShowApiKeys] = useState({});
  const [debugInfo, setDebugInfo] = useState("");
  const [ollamaModelPath, setOllamaModelPath] = useState("");

  useEffect(() => {
    // Auto-detect Ollama models on component mount
    console.log("LLMSettings mounted, detecting Ollama models...");
    handleDetectOllama();
    
    // Suggest potential Ollama model path based on OS
    const isWindows = navigator.platform.indexOf('Win') > -1;
    const isMac = navigator.platform.indexOf('Mac') > -1;
    
    if (isMac) {
      setOllamaModelPath("~/.ollama/models");
    } else if (isWindows) {
      setOllamaModelPath("%USERPROFILE%\\.ollama\\models");
    } else {
      setOllamaModelPath("~/.ollama/models");
    }
  }, []);

  const handleDetectOllama = async () => {
    const ollama = llmProviders.ollama;
    setDebugInfo("");
    
    if (ollama.isAutoDetecting) {
      console.log("Already detecting Ollama models, skipping...");
      setDebugInfo("Already detecting models...");
      return;
    }
    
    console.log("Starting Ollama model detection...");
    setDebugInfo("Starting model detection...");
    
    setTestResults(prev => ({
      ...prev,
      ollama: { testing: true, message: 'Detecting models...' }
    }));
    
    try {
      const models = await detectOllamaModels(true);
      console.log("Detection complete, models:", models);
      
      if (models.length > 0) {
        setDebugInfo(`Detection complete. Found: ${models.join(', ')}`);
        setTestResults(prev => ({
          ...prev,
          ollama: { success: true, message: `Found ${models.length} models` }
        }));
      } else {
        setTestResults(prev => ({
          ...prev,
          ollama: { 
            success: false, 
            message: ollama.connectionError || 'No models found. Make sure Ollama is running and you have pulled at least one model.'
          }
        }));
        setDebugInfo(`Error: ${ollama.connectionError || 'No models found'}`);
      }
    } catch (error) {
      console.error("Error detecting Ollama models:", error);
      setTestResults(prev => ({
        ...prev,
        ollama: { success: false, message: error.message || 'Failed to connect to Ollama' }
      }));
      setDebugInfo(`Error: ${error.message}`);
    }
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
      // For Ollama, use a direct fetch instead of the service to ensure immediate feedback
      if (provider === 'ollama') {
        const providerData = llmProviders[provider];
        if (!providerData.selectedModel) {
          throw new Error('Please select a model first');
        }
        
        console.log(`Testing connection to Ollama with model: ${providerData.selectedModel}`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        
        const response = await fetch(`${providerData.baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: providerData.selectedModel,
            prompt: "Say hello",
            options: { temperature: 0.7, num_predict: 10 },
            stream: false
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Ollama test response:", data);
        
        setTestResults(prev => ({
          ...prev,
          [provider]: {
            success: true,
            message: 'Connection successful',
            response: data.response
          }
        }));
      } else {
        // For other providers, use the service
        const result = await llmService.testConnection(provider);
        setTestResults(prev => ({
          ...prev,
          [provider]: {
            success: result.success,
            message: result.success ? 'Connection successful' : result.error
          }
        }));
      }
    } catch (error) {
      console.error(`Error testing connection to ${provider}:`, error);
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          success: false,
          message: error.message || 'Connection failed'
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
                    disabled={provider.isAutoDetecting}
                    className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                  >
                    <SafeIcon 
                      icon={FiRefreshCw} 
                      className={`w-4 h-4 ${provider.isAutoDetecting ? 'animate-spin' : ''}`} 
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

      {/* Auto-connect setting */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SafeIcon icon={FiSettings} className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-medium">Auto-Connect on Startup</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={appSettings.autoConnectOnStartup}
              onChange={(e) => updateAppSettings({ autoConnectOnStartup: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
        <p className="text-slate-400 text-sm mt-2">
          Automatically detect and connect to available LLM providers when the application starts
        </p>
      </div>

      {/* Troubleshooting tips */}
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

      {/* Debug Info */}
      {debugInfo && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Debug Info</h3>
          <pre className="text-slate-300 text-sm whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}

      {/* Ollama Troubleshooting */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2">Ollama Setup Guide</h3>
        <div className="text-slate-300 text-sm space-y-2">
          <p>1. Install Ollama: <code className="bg-slate-700 px-2 py-1 rounded">curl -fsSL https://ollama.ai/install.sh | sh</code></p>
          <p>2. Make sure the Ollama service is running: <code className="bg-slate-700 px-2 py-1 rounded">ollama serve</code></p>
          <p>3. Pull a model: <code className="bg-slate-700 px-2 py-1 rounded">ollama pull llama2</code></p>
          <p>4. Click "Detect Models" above to auto-configure</p>
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
              <SafeIcon icon={FiAlertCircle} className="w-4 h-4" />
              CORS Troubleshooting
            </h4>
            <p className="text-slate-300">If you're having issues with CORS when connecting to Ollama, try one of these solutions:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li>Run Ollama with CORS enabled: <code className="bg-slate-700 px-2 py-1 rounded">OLLAMA_ORIGINS=* ollama serve</code></li>
              <li>Use a browser extension that disables CORS for local development</li>
              <li>Run your application and Ollama on the same domain/port using a proxy</li>
            </ol>
          </div>
          
          <p className="mt-4">Your Ollama models are likely located at: <code className="bg-slate-700 px-2 py-1 rounded">{ollamaModelPath}</code></p>
          
          <div className="flex items-center gap-2 mt-3">
            <p>Check Ollama API directly:</p>
            <a 
              href="http://localhost:11434/api/tags" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              /api/tags
              <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
            </a>
            <span className="text-slate-500">or</span>
            <a 
              href="http://localhost:11434/api/models" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              /api/models
              <SafeIcon icon={FiExternalLink} className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LLMSettings;