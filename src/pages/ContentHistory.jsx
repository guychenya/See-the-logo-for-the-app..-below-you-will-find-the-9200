import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useContentStore } from '../stores/contentStore';
import { useAgentStore } from '../stores/agentStore';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiFilter, FiCalendar, FiDownload, FiMessageCircle, FiUser, FiBot, FiFileText, FiImage, FiCode } = FiIcons;

function ContentHistory() {
  const { workspaceId } = useParams();
  const { getContentHistory } = useContentStore();
  const { getAgentsByWorkspace } = useAgentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAgent, setFilterAgent] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const agents = getAgentsByWorkspace(workspaceId);
  
  // Mock content history data
  const contentHistory = [
    {
      id: '1',
      type: 'chat',
      title: 'Code Review Discussion',
      content: 'Discussed best practices for React component architecture and state management patterns.',
      agentId: '2',
      agentName: 'Code Assistant',
      timestamp: new Date().toISOString(),
      wordCount: 156,
      tags: ['React', 'Architecture', 'Best Practices']
    },
    {
      id: '2',
      type: 'generation',
      title: 'Blog Post: AI in Modern Development',
      content: 'Generated comprehensive blog post about the integration of AI tools in modern software development workflows.',
      agentId: '3',
      agentName: 'Content Creator',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      wordCount: 1200,
      tags: ['AI', 'Development', 'Blog']
    },
    {
      id: '3',
      type: 'analysis',
      title: 'User Engagement Report',
      content: 'Analyzed user engagement metrics and provided insights on improving conversion rates.',
      agentId: '4',
      agentName: 'Data Analyst',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      wordCount: 890,
      tags: ['Analytics', 'Engagement', 'Conversion']
    },
    {
      id: '4',
      type: 'chat',
      title: 'Marketing Strategy Session',
      content: 'Brainstormed marketing strategies for Q1 launch including social media campaigns and content calendar.',
      agentId: '3',
      agentName: 'Content Creator',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      wordCount: 245,
      tags: ['Marketing', 'Strategy', 'Social Media']
    },
    {
      id: '5',
      type: 'code',
      title: 'API Integration Helper',
      content: 'Generated code snippets for integrating third-party APIs with error handling and authentication.',
      agentId: '2',
      agentName: 'Code Assistant',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      wordCount: 67,
      tags: ['API', 'Integration', 'Code']
    }
  ];

  const filteredContent = contentHistory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesAgent = filterAgent === 'all' || item.agentId === filterAgent;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const itemDate = new Date(item.timestamp);
      const now = new Date();
      const daysDiff = (now - itemDate) / (1000 * 60 * 60 * 24);
      
      switch (dateRange) {
        case 'today':
          matchesDate = daysDiff < 1;
          break;
        case 'week':
          matchesDate = daysDiff < 7;
          break;
        case 'month':
          matchesDate = daysDiff < 30;
          break;
        default:
          matchesDate = true;
      }
    }
    
    return matchesSearch && matchesType && matchesAgent && matchesDate;
  });

  const getContentIcon = (type) => {
    switch (type) {
      case 'chat': return FiMessageCircle;
      case 'generation': return FiFileText;
      case 'analysis': return FiFileText;
      case 'code': return FiCode;
      case 'image': return FiImage;
      default: return FiFileText;
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case 'chat': return 'text-blue-400';
      case 'generation': return 'text-green-400';
      case 'analysis': return 'text-purple-400';
      case 'code': return 'text-orange-400';
      case 'image': return 'text-pink-400';
      default: return 'text-slate-400';
    }
  };

  const getContentTypeBadge = (type) => {
    switch (type) {
      case 'chat': return 'bg-blue-500/20 text-blue-400';
      case 'generation': return 'bg-green-500/20 text-green-400';
      case 'analysis': return 'bg-purple-500/20 text-purple-400';
      case 'code': return 'bg-orange-500/20 text-orange-400';
      case 'image': return 'bg-pink-500/20 text-pink-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Content History</h1>
          <p className="text-slate-400">View and manage all generated content and conversations</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 lg:mt-0 bg-slate-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-600 transition-colors"
        >
          <SafeIcon icon={FiDownload} className="w-5 h-5" />
          Export All
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm mb-2">Total Items</h3>
          <p className="text-2xl font-bold text-white">{contentHistory.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm mb-2">This Week</h3>
          <p className="text-2xl font-bold text-white">
            {contentHistory.filter(item => {
              const daysDiff = (new Date() - new Date(item.timestamp)) / (1000 * 60 * 60 * 24);
              return daysDiff < 7;
            }).length}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm mb-2">Total Words</h3>
          <p className="text-2xl font-bold text-white">
            {contentHistory.reduce((sum, item) => sum + item.wordCount, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-slate-400 text-sm mb-2">Active Agents</h3>
          <p className="text-2xl font-bold text-white">
            {new Set(contentHistory.map(item => item.agentId)).size}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <SafeIcon 
            icon={FiSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5"
          />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          <option value="chat">Conversations</option>
          <option value="generation">Generated Content</option>
          <option value="analysis">Analysis</option>
          <option value="code">Code</option>
        </select>
        
        <select
          value={filterAgent}
          onChange={(e) => setFilterAgent(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Agents</option>
          {agents.map(agent => (
            <option key={agent.id} value={agent.id}>{agent.name}</option>
          ))}
        </select>
        
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Content List */}
      <div className="space-y-4">
        {filteredContent.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-lg bg-slate-700 ${getContentTypeColor(item.type)}`}>
                  <SafeIcon icon={getContentIcon(item.type)} className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getContentTypeBadge(item.type)}`}>
                      {item.type}
                    </span>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                    {item.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <SafeIcon icon={FiBot} className="w-3 h-3" />
                      {item.agentName}
                    </div>
                    <div className="flex items-center gap-1">
                      <SafeIcon icon={FiCalendar} className="w-3 h-3" />
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </div>
                    <div>{item.wordCount} words</div>
                  </div>
                  
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.tags.map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700">
                  <SafeIcon icon={FiDownload} className="w-4 h-4" />
                </button>
                {item.type === 'chat' && (
                  <Link
                    to={`/workspace/${workspaceId}/chat/${item.agentId}`}
                    className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                  >
                    <SafeIcon icon={FiMessageCircle} className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            {searchTerm ? 'No content found matching your search.' : 'No content history yet.'}
          </div>
          <p className="text-slate-500 text-sm">
            Start chatting with your agents or generating content to see history here.
          </p>
        </div>
      )}
    </div>
  );
}

export default ContentHistory;