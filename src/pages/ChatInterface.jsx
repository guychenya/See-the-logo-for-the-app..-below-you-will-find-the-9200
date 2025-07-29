import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAgentStore } from '../stores/agentStore';
import { useContentStore } from '../stores/contentStore';
import { formatDistanceToNow } from 'date-fns';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSend, FiDownload, FiCopy, FiSave, FiX, FiInfo } = FiIcons;

function ChatInterface() {
  const { workspaceId, agentId } = useParams();
  const { agents } = useAgentStore();
  const { addChatMessage, getChatHistory } = useContentStore();
  const agent = agents.find(a => a.id === agentId);
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    if (agentId) {
      const history = getChatHistory(agentId);
      setChatHistory(history);
    }
  }, [agentId, getChatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory([...chatHistory, userMessage]);
    addChatMessage(agentId, userMessage);
    setInput('');
    setIsLoading(true);

    // Simulate agent response after a delay
    setTimeout(() => {
      const agentMessage = {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: `This is a simulated response from ${agent?.name}. In a real implementation, this would be the actual response from the AI agent.`,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prevHistory => [...prevHistory, agentMessage]);
      addChatMessage(agentId, agentMessage);
      setIsLoading(false);
    }, 1500);
  };

  if (!agent) {
    return <div className="p-6 text-white">Agent not found</div>;
  }

  return (
    <div className="flex h-full">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-xl">
              {agent.type === 'primary' ? '🎯' : '🤖'}
            </div>
            <div>
              <h2 className="text-white font-semibold">{agent.name}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-slate-400 text-xs">Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
          >
            <SafeIcon icon={FiInfo} className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Welcome Message */}
            {chatHistory.length === 0 && (
              <div className="bg-slate-800/50 rounded-lg p-6 text-center">
                <h3 className="text-white font-medium mb-2">Welcome to Chat with {agent.name}</h3>
                <p className="text-slate-400 text-sm mb-4">
                  This agent can help you with: {agent.capabilities.join(', ')}
                </p>
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
              </div>
            )}

            {/* Chat Messages */}
            {chatHistory.map((message, index) => (
              <div 
                key={message.id} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="mt-1 text-xs opacity-70 flex justify-between items-center">
                    <span>
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                    </span>
                    {message.role === 'agent' && (
                      <div className="flex gap-2">
                        <button className="hover:text-white" title="Copy">
                          <SafeIcon icon={FiCopy} className="w-3 h-3" />
                        </button>
                        <button className="hover:text-white" title="Save">
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
        <div className="bg-slate-800 border-t border-slate-700 p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full pl-4 pr-12 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Type your message..."
                rows="2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              ></textarea>
              <button
                type="submit"
                className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                disabled={isLoading || !input.trim()}
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
          animate={{ width: '300px', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="w-[300px] bg-slate-800 border-l border-slate-700 overflow-y-auto"
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
              <div className="space-y-2">
                <div>
                  <div className="text-slate-400 text-xs">Name</div>
                  <div className="text-white">{agent.name}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">Type</div>
                  <div className="text-white capitalize">{agent.type}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-xs">Description</div>
                  <div className="text-slate-300 text-sm">{agent.description}</div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-slate-400 text-xs uppercase tracking-wider mb-2">Capabilities</h4>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((capability, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md"
                  >
                    {capability}
                  </span>
                ))}
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
  );
}

export default ChatInterface;