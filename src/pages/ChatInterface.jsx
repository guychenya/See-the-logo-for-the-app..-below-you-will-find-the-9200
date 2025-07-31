import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAgentStore } from '../stores/agentStore';
import { useContentStore } from '../stores/contentStore';
import { useSettingsStore } from '../stores/settingsStore';
import { llmService } from '../services/llmService';
import { formatDistanceToNow } from 'date-fns';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSend, FiDownload, FiCopy, FiSave, FiX, FiInfo, FiArrowLeft, FiAlertTriangle } = FiIcons;

function ChatInterface() {
  const { workspaceId, agentId } = useParams();
  const navigate = useNavigate();
  const { agents } = useAgentStore();
  const { addChatMessage, getChatHistory } = useContentStore();
  const { getActiveProvider } = useSettingsStore();
  
  const [agent, setAgent] = useState(null);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [mounted, setMounted] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Safely find agent
  useEffect(() => {
    try {
      if (agentId && agents && Array.isArray(agents)) {
        const foundAgent = agents.find(a => a && a.id === agentId);
        setAgent(foundAgent || null);
      }
    } catch (error) {
      console.error('Error finding agent:', error);
      setAgent(null);
    }
  }, [agentId, agents]);

  // Load chat history
  useEffect(() => {
    try {
      if (agentId && getChatHistory && mounted) {
        const history = getChatHistory(agentId);
        if (Array.isArray(history)) {
          setChatHistory(history);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatHistory([]);
    }
  }, [agentId, getChatHistory, mounted]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, scrollToBottom]);

  // Check LLM provider configuration
  useEffect(() => {
    try {
      if (getActiveProvider && mounted) {
        const provider = getActiveProvider();
        if (!provider) {
          setConnectionError('No LLM provider configured. Please configure Ollama or another provider in Settings.');
        } else {
          setConnectionError(null);
        }
      }
    } catch (error) {
      console.error('Error checking provider:', error);
      setConnectionError('Error checking provider configuration.');
    }
  }, [getActiveProvider, mounted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setMounted(false);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading || !mounted) return;

    try {
      const provider = getActiveProvider();
      if (!provider) {
        setConnectionError('No LLM provider configured. Please configure Ollama or another provider in Settings.');
        return;
      }

      if (!agent) {
        console.error('No agent available');
        return;
      }

      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, userMessage]);
      if (addChatMessage) {
        addChatMessage(agentId, userMessage);
      }

      const currentInput = input;
      setInput('');
      setIsLoading(true);
      setConnectionError(null);

      // Generate agent response using the LLM service
      const agentResponse = await llmService.generateAgentResponse(
        agent,
        currentInput,
        chatHistory
      );

      if (!mounted) return; // Check if component is still mounted

      const agentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: agentResponse,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, agentMessage]);
      if (addChatMessage) {
        addChatMessage(agentId, agentMessage);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      
      if (!mounted) return;
      
      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `I apologize, but I'm having trouble connecting to the language model. Error: ${error.message}. Please check your LLM provider configuration in Settings.`,
        timestamp: new Date().toISOString(),
        isError: true
      };

      setChatHistory(prev => [...prev, errorMessage]);
      if (addChatMessage) {
        addChatMessage(agentId, errorMessage);
      }
      setConnectionError(error.message);
    } finally {
      if (mounted) {
        setIsLoading(false);
      }
    }
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleNavigateBack = () => {
    try {
      navigate(`/workspace/${workspaceId}/agents`);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleNavigateSettings = () => {
    try {
      navigate('/settings');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  if (!agent) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Agent not found</h2>
          <p className="text-slate-400 mb-4">The agent you're looking for doesn't exist.</p>
          <button
            onClick={handleNavigateBack}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Agents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Chat Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleNavigateBack}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-xl">
            {agent.type === 'primary' ? '🎯' : '🤖'}
          </div>
          <div>
            <h2 className="text-white font-semibold">{agent.name || 'Unknown Agent'}</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${connectionError ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span className="text-slate-400 text-xs">
                {connectionError ? 'Disconnected' : 'Online'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className={`p-2 rounded-lg transition-colors ${
            showInfo 
              ? 'bg-indigo-600 text-white' 
              : 'text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
        >
          <SafeIcon icon={FiInfo} className="w-5 h-5" />
        </button>
      </div>

      {/* Connection Error Banner */}
      {connectionError && (
        <div className="bg-red-600/20 border-b border-red-600/30 p-3">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <SafeIcon icon={FiAlertTriangle} className="w-4 h-4" />
            <span>{connectionError}</span>
            <button
              onClick={handleNavigateSettings}
              className="ml-auto text-red-300 hover:text-red-200 underline"
            >
              Configure Settings
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Welcome Message */}
              {chatHistory.length === 0 && (
                <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                  <h3 className="text-white font-medium mb-2">Welcome to Chat with {agent.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    This agent can help you with: {agent.capabilities?.join(', ') || 'various tasks'}
                  </p>
                  {!connectionError && agent.capabilities && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                      {agent.capabilities.slice(0, 4).map((capability, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(`Help me with ${capability.toLowerCase()}`)}
                          className="bg-slate-700 hover:bg-slate-600 text-white text-sm py-2 px-3 rounded-lg transition-colors"
                        >
                          {capability}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Chat Messages */}
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : message.isError
                        ? 'bg-red-600/20 border border-red-600/30 text-red-200'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    <div className="mt-2 text-xs opacity-70 flex justify-between items-center">
                      <span>
                        {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                      </span>
                      {message.role === 'agent' && !message.isError && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="hover:text-white transition-colors"
                            title="Copy"
                          >
                            <SafeIcon icon={FiCopy} className="w-3 h-3" />
                          </button>
                          <button
                            className="hover:text-white transition-colors"
                            title="Save"
                          >
                            <SafeIcon icon={FiSave} className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-lg p-4 max-w-[80%]">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Input */}
          <div className="bg-slate-800 border-t border-slate-700 p-4 shrink-0">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder={connectionError ? "Configure LLM provider to start chatting..." : "Type your message..."}
                  rows="2"
                  disabled={!!connectionError}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  disabled={isLoading || !input.trim() || !!connectionError}
                >
                  <SafeIcon icon={FiSend} className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Agent Info Panel */}
        {showInfo && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '320px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-80 bg-slate-800 border-l border-slate-700 overflow-y-auto shrink-0"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-white font-medium">Agent Information</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-slate-400 hover:text-white"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-6">
                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Details</h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-slate-400 text-xs">Name</div>
                    <div className="text-white">{agent.name || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Type</div>
                    <div className="text-white capitalize">{agent.type || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Description</div>
                    <div className="text-slate-300 text-sm">{agent.description || 'No description available'}</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities && agent.capabilities.length > 0 ? (
                    agent.capabilities.map((capability, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md"
                      >
                        {capability}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-xs">No capabilities defined</span>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Stats</h4>
                <div className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-slate-400 text-xs">Success Rate</div>
                    <div className="text-white text-sm">{agent.metrics?.successRate || 0}%</div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-slate-400 text-xs">Avg. Response</div>
                    <div className="text-white text-sm">{agent.metrics?.avgResponse || 0}s</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-slate-400 text-xs">Total Interactions</div>
                    <div className="text-white text-sm">{agent.metrics?.totalInteractions || 0}</div>
                  </div>
                </div>
              </div>

              <div>
                <button className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <SafeIcon icon={FiDownload} className="w-4 h-4" />
                  Export Chat History
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ChatInterface;