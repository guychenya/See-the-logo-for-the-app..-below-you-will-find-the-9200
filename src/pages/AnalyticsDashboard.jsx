import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAgentStore } from '../stores/agentStore';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiUsers, FiMessageCircle, FiClock, FiBarChart2, FiActivity, FiZap, FiTarget } = FiIcons;

function AnalyticsDashboard() {
  const { workspaceId } = useParams();
  const { getAgentsByWorkspace } = useAgentStore();
  const [timeRange, setTimeRange] = useState('7d');
  
  const agents = getAgentsByWorkspace(workspaceId);

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalInteractions: 1247,
      activeAgents: agents.length,
      avgResponseTime: 2.3,
      successRate: 94.2,
      trendsData: {
        interactions: [120, 145, 167, 134, 189, 201, 176],
        responseTime: [2.1, 2.4, 2.2, 2.5, 2.3, 2.1, 2.3],
        successRate: [92, 94, 93, 95, 94, 96, 94]
      }
    },
    agentPerformance: agents.map((agent, index) => ({
      ...agent,
      interactions: Math.floor(Math.random() * 200) + 50,
      avgResponseTime: (Math.random() * 2 + 1).toFixed(1),
      successRate: Math.floor(Math.random() * 10) + 90,
      uptime: Math.floor(Math.random() * 5) + 95
    })),
    usage: {
      peakHours: [
        { hour: '9 AM', value: 45 },
        { hour: '10 AM', value: 62 },
        { hour: '11 AM', value: 78 },
        { hour: '2 PM', value: 89 },
        { hour: '3 PM', value: 95 },
        { hour: '4 PM', value: 71 }
      ],
      topCapabilities: [
        { name: 'Code Generation', usage: 78 },
        { name: 'Content Writing', usage: 65 },
        { name: 'Data Analysis', usage: 52 },
        { name: 'Debug Analysis', usage: 41 },
        { name: 'SEO Optimization', usage: 38 }
      ]
    }
  };

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-slate-400">Monitor workspace performance and agent metrics</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="mt-4 lg:mt-0 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {timeRangeOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Total Interactions</p>
              <p className="text-2xl font-bold text-white">{analyticsData.overview.totalInteractions.toLocaleString()}</p>
            </div>
            <SafeIcon icon={FiMessageCircle} className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex items-center text-sm">
            <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">+12.5%</span>
            <span className="text-slate-400 ml-1">vs last period</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Active Agents</p>
              <p className="text-2xl font-bold text-white">{analyticsData.overview.activeAgents}</p>
            </div>
            <SafeIcon icon={FiUsers} className="w-8 h-8 text-green-400" />
          </div>
          <div className="flex items-center text-sm">
            <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">+2</span>
            <span className="text-slate-400 ml-1">new this week</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Avg Response Time</p>
              <p className="text-2xl font-bold text-white">{analyticsData.overview.avgResponseTime}s</p>
            </div>
            <SafeIcon icon={FiClock} className="w-8 h-8 text-orange-400" />
          </div>
          <div className="flex items-center text-sm">
            <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">-0.2s</span>
            <span className="text-slate-400 ml-1">improvement</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-slate-400 text-sm">Success Rate</p>
              <p className="text-2xl font-bold text-white">{analyticsData.overview.successRate}%</p>
            </div>
            <SafeIcon icon={FiTarget} className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex items-center text-sm">
            <SafeIcon icon={FiTrendingUp} className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">+1.2%</span>
            <span className="text-slate-400 ml-1">vs last period</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Usage Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Usage Trends</h3>
            <SafeIcon icon={FiBarChart2} className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-2">
            {analyticsData.overview.trendsData.interactions.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-indigo-500 rounded-t-sm transition-all duration-300 hover:bg-indigo-400"
                  style={{ height: `${(value / Math.max(...analyticsData.overview.trendsData.interactions)) * 200}px` }}
                />
                <span className="text-xs text-slate-400 mt-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Peak Hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-800 border border-slate-700 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Peak Usage Hours</h3>
            <SafeIcon icon={FiActivity} className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="space-y-4">
            {analyticsData.usage.peakHours.map((hour, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">{hour.hour}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(hour.value / 100) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-slate-400 text-sm">{hour.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Agent Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold">Agent Performance</h3>
          <SafeIcon icon={FiZap} className="w-5 h-5 text-slate-400" />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-slate-700">
                <th className="pb-3 text-slate-400 font-medium">Agent</th>
                <th className="pb-3 text-slate-400 font-medium">Interactions</th>
                <th className="pb-3 text-slate-400 font-medium">Avg Response</th>
                <th className="pb-3 text-slate-400 font-medium">Success Rate</th>
                <th className="pb-3 text-slate-400 font-medium">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.agentPerformance.map((agent, index) => (
                <tr key={agent.id} className="border-b border-slate-700/50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-lg">
                        {agent.type === 'primary' ? '🎯' : '🤖'}
                      </div>
                      <div>
                        <div className="text-white font-medium">{agent.name}</div>
                        <div className="text-slate-400 text-xs capitalize">{agent.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-white">{agent.interactions}</td>
                  <td className="py-4 text-white">{agent.avgResponseTime}s</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agent.successRate >= 95 ? 'bg-green-500/20 text-green-400' :
                      agent.successRate >= 90 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {agent.successRate}%
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="text-white">{agent.uptime}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Top Capabilities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-slate-800 border border-slate-700 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold">Most Used Capabilities</h3>
          <SafeIcon icon={FiBarChart2} className="w-5 h-5 text-slate-400" />
        </div>
        
        <div className="space-y-4">
          {analyticsData.usage.topCapabilities.map((capability, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-slate-300">{capability.name}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${capability.usage}%` }}
                  />
                </div>
                <span className="text-slate-400 text-sm w-12 text-right">{capability.usage}%</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default AnalyticsDashboard;