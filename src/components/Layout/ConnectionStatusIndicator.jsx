import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../stores/settingsStore';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBrain, FiCheck, FiX, FiAlertCircle, FiLoader } = FiIcons;

function ConnectionStatusIndicator() {
  const { llmProviders, defaultProvider, detectOllamaModels } = useSettingsStore();
  const [showStatus, setShowStatus] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    isChecking: false,
    isConnected: false,
    provider: null,
    model: null,
    error: null
  });

  useEffect(() => {
    // Check connection on component mount and whenever default provider changes
    checkConnection();
    
    // Set up interval to periodically check connection (every 60 seconds)
    const interval = setInterval(checkConnection, 60000);
    
    return () => clearInterval(interval);
  }, [defaultProvider]);

  const checkConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, isChecking: true }));
    
    const activeProvider = llmProviders[defaultProvider];
    if (!activeProvider || !activeProvider.enabled) {
      setConnectionStatus({
        isChecking: false,
        isConnected: false,
        provider: defaultProvider,
        model: null,
        error: 'No active provider'
      });
      return;
    }

    // For Ollama, try to detect models
    if (defaultProvider === 'ollama') {
      try {
        console.log("ConnectionStatusIndicator: Checking Ollama connection...");
        const models = await detectOllamaModels();
        
        setConnectionStatus({
          isChecking: false,
          isConnected: models.length > 0,
          provider: 'ollama',
          model: activeProvider.selectedModel || (models.length > 0 ? models[0] : null),
          error: models.length === 0 ? 'No models detected' : null
        });
      } catch (error) {
        console.error("ConnectionStatusIndicator: Ollama connection error:", error);
        setConnectionStatus({
          isChecking: false,
          isConnected: false,
          provider: 'ollama',
          model: null,
          error: error.message || 'Connection failed'
        });
      }
    } else {
      // For other providers, just check if they have an API key and selected model
      setConnectionStatus({
        isChecking: false,
        isConnected: !!activeProvider.apiKey && !!activeProvider.selectedModel,
        provider: defaultProvider,
        model: activeProvider.selectedModel,
        error: !activeProvider.apiKey ? 'API key required' : 
               !activeProvider.selectedModel ? 'No model selected' : null
      });
    }
  };

  // Get display name for the current provider
  const getProviderDisplayName = () => {
    const provider = llmProviders[connectionStatus.provider];
    return provider?.name || connectionStatus.provider;
  };

  // Determine icon and colors based on connection status
  const getStatusInfo = () => {
    if (connectionStatus.isChecking) {
      return {
        icon: FiLoader,
        iconClass: 'text-blue-400 animate-spin',
        bgClass: 'bg-blue-500/20 border-blue-500/30',
        textClass: 'text-blue-400'
      };
    }
    
    if (connectionStatus.isConnected) {
      return {
        icon: FiCheck,
        iconClass: 'text-green-400',
        bgClass: 'bg-green-500/20 border-green-500/30',
        textClass: 'text-green-400'
      };
    }
    
    return {
      icon: connectionStatus.error ? FiAlertCircle : FiX,
      iconClass: 'text-red-400',
      bgClass: 'bg-red-500/20 border-red-500/30',
      textClass: 'text-red-400'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="relative">
      <button 
        onClick={() => setShowStatus(!showStatus)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-700/50 transition-colors"
      >
        <SafeIcon 
          icon={FiBrain} 
          className={`w-4 h-4 ${connectionStatus.isConnected ? 'text-green-400' : 'text-red-400'}`} 
        />
        <span className="text-slate-300">LLM</span>
      </button>
      
      {showStatus && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-3 z-50"
        >
          <div className={`p-3 rounded-lg ${statusInfo.bgClass} border mb-2`}>
            <div className="flex items-center gap-2">
              <SafeIcon icon={statusInfo.icon} className={`w-5 h-5 ${statusInfo.iconClass}`} />
              <span className={`font-medium ${statusInfo.textClass}`}>
                {connectionStatus.isChecking ? 'Checking connection...' :
                 connectionStatus.isConnected ? 'Connected' : 'Not connected'}
              </span>
            </div>
            {!connectionStatus.isChecking && (
              <div className="mt-1 text-sm text-slate-300">
                <div>Provider: {getProviderDisplayName()}</div>
                {connectionStatus.model && <div>Model: {connectionStatus.model}</div>}
                {connectionStatus.error && <div className="text-red-400 text-xs mt-1">{connectionStatus.error}</div>}
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={() => {
                checkConnection();
                setShowStatus(false);
              }}
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Refresh
            </button>
            <button 
              onClick={() => window.location.href = '#/settings'}
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Go to Settings
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default ConnectionStatusIndicator;