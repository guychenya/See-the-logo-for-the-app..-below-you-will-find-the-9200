import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import { llmService } from '../../services/llmService';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDownload, FiPlay, FiRefreshCw, FiCheckCircle, FiAlertCircle, FiTerminal, FiExternalLink } = FiIcons;

function OllamaSetup() {
  const { llmProviders, updateProvider, detectOllamaModels } = useSettingsStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    checkOllamaConnection();
  }, []);

  const checkOllamaConnection = async () => {
    setConnectionStatus('checking');
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        const data = await response.json();
        const models = data.models?.map(model => model.name) || [];
        setAvailableModels(models);
        setConnectionStatus(models.length > 0 ? 'connected' : 'no-models');
        
        if (models.length > 0) {
          updateProvider('ollama', {
            enabled: true,
            models,
            selectedModel: models[0]
          });
        }
      } else {
        setConnectionStatus('not-running');
      }
    } catch (error) {
      setConnectionStatus('not-installed');
    }
  };

  const handleDetectModels = async () => {
    setIsDetecting(true);
    try {
      const models = await detectOllamaModels();
      setAvailableModels(models);
      if (models.length > 0) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('no-models');
      }
    } catch (error) {
      console.error('Error detecting models:', error);
      setConnectionStatus('error');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      const result = await llmService.testConnection('ollama');
      if (result.success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <SafeIcon icon={FiCheckCircle} className="w-5 h-5 text-green-400" />;
      case 'checking':
        return <SafeIcon icon={FiRefreshCw} className="w-5 h-5 text-blue-400 animate-spin" />;
      default:
        return <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connected':
        return `Connected successfully! Found ${availableModels.length} models.`;
      case 'checking':
        return 'Checking Ollama connection...';
      case 'not-installed':
        return 'Ollama is not installed on your system.';
      case 'not-running':
        return 'Ollama is installed but not running.';
      case 'no-models':
        return 'Ollama is running but no models are installed.';
      case 'error':
        return 'Error connecting to Ollama.';
      default:
        return 'Unknown status';
    }
  };

  const renderInstallationGuide = () => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-white font-medium mb-4 flex items-center gap-2">
        <SafeIcon icon={FiDownload} className="w-5 h-5" />
        Install Ollama
      </h3>
      <div className="space-y-4">
        <div>
          <h4 className="text-slate-300 font-medium mb-2">Step 1: Download Ollama</h4>
          <p className="text-slate-400 text-sm mb-2">
            Visit the official Ollama website to download the installer for your operating system.
          </p>
          <a
            href="https://ollama.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
            Download Ollama
          </a>
        </div>
        
        <div>
          <h4 className="text-slate-300 font-medium mb-2">Step 2: Install a Model</h4>
          <p className="text-slate-400 text-sm mb-2">
            After installation, open your terminal and install a model:
          </p>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <code className="text-green-400 text-sm">ollama pull llama2</code>
          </div>
        </div>

        <div>
          <h4 className="text-slate-300 font-medium mb-2">Popular Models</h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              { name: 'llama2', description: 'Meta\'s Llama 2 - Good general purpose model' },
              { name: 'codellama', description: 'Code-focused version of Llama 2' },
              { name: 'mistral', description: 'Mistral 7B - Fast and efficient' },
              { name: 'neural-chat', description: 'Intel\'s fine-tuned model for conversations' }
            ].map((model) => (
              <div key={model.name} className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{model.name}</div>
                    <div className="text-slate-400 text-xs">{model.description}</div>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(`ollama pull ${model.name}`)}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Copy Command
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderModelManagement = () => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Installed Models</h3>
        <button
          onClick={handleDetectModels}
          disabled={isDetecting}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <SafeIcon icon={FiRefreshCw} className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
          {isDetecting ? 'Detecting...' : 'Refresh Models'}
        </button>
      </div>

      {availableModels.length > 0 ? (
        <div className="space-y-2">
          {availableModels.map((model) => (
            <div
              key={model}
              className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3"
            >
              <div>
                <div className="text-white font-medium">{model}</div>
                <div className="text-slate-400 text-xs">Available for use</div>
              </div>
              <div className="flex items-center gap-2">
                {llmProviders.ollama.selectedModel === model && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Selected
                  </span>
                )}
                <button
                  onClick={() => updateProvider('ollama', { selectedModel: model })}
                  className="text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Use Model
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-slate-400 mb-4">No models found. Install a model to get started.</p>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3">
            <code className="text-green-400 text-sm">ollama pull llama2</code>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Ollama Setup</h2>
        <p className="text-slate-400">Configure your local Ollama installation for private AI conversations</p>
      </div>

      {/* Connection Status */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Connection Status</h3>
          <button
            onClick={checkOllamaConnection}
            className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
          >
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
            Check Connection
          </button>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          {getStatusIcon()}
          <span className="text-slate-300">{getStatusMessage()}</span>
        </div>

        {connectionStatus === 'connected' && (
          <div className="flex gap-3">
            <button
              onClick={handleTestConnection}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Chat
            </button>
            <button
              onClick={() => updateProvider('ollama', { enabled: true })}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Enable Ollama
            </button>
          </div>
        )}
      </div>

      {/* Installation Guide or Model Management */}
      {connectionStatus === 'not-installed' || connectionStatus === 'not-running' 
        ? renderInstallationGuide()
        : renderModelManagement()
      }

      {/* Quick Commands */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <SafeIcon icon={FiTerminal} className="w-5 h-5" />
          Quick Commands
        </h3>
        <div className="space-y-3">
          <div>
            <div className="text-slate-300 text-sm mb-1">Start Ollama service:</div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2">
              <code className="text-green-400 text-sm">ollama serve</code>
            </div>
          </div>
          <div>
            <div className="text-slate-300 text-sm mb-1">List installed models:</div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2">
              <code className="text-green-400 text-sm">ollama list</code>
            </div>
          </div>
          <div>
            <div className="text-slate-300 text-sm mb-1">Remove a model:</div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-2">
              <code className="text-green-400 text-sm">ollama rm model-name</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OllamaSetup;