import { create } from 'zustand';

export const useAgentStore = create((set, get) => ({
  agents: [
    {
      id: '1',
      name: 'Orchestrator',
      type: 'primary',
      description: 'Main coordination agent for task delegation and workflow management',
      status: 'active',
      connections: 6,
      capabilities: ['Task Delegation', 'Workflow Management', 'Resource Allocation'],
      workspaceId: '1',
      parentId: null,
      lastActivity: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Code Assistant',
      type: 'specialized',
      description: 'Advanced coding and development support agent',
      status: 'active',
      connections: 3,
      capabilities: ['Code Generation', 'Debug Analysis', 'Architecture Review'],
      workspaceId: '1',
      parentId: '1',
      lastActivity: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Content Creator',
      type: 'specialized',
      description: 'Content generation and creative writing assistant',
      status: 'active',
      connections: 2,
      capabilities: ['Content Writing', 'SEO Optimization', 'Creative Ideation'],
      workspaceId: '1',
      parentId: '1',
      lastActivity: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Data Analyst',
      type: 'specialized',
      description: 'Data analysis and visualization specialist',
      status: 'idle',
      connections: 1,
      capabilities: ['Data Processing', 'Statistical Analysis', 'Report Generation'],
      workspaceId: '1',
      parentId: '1',
      lastActivity: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  
  createAgent: (agentData) => {
    const newAgent = {
      id: Date.now().toString(),
      ...agentData,
      status: 'active',
      connections: 0,
      lastActivity: new Date().toISOString()
    };
    set(state => ({
      agents: [...state.agents, newAgent]
    }));
  },
  
  updateAgent: (agentId, updates) => {
    set(state => ({
      agents: state.agents.map(agent =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      )
    }));
  },
  
  getAgentsByWorkspace: (workspaceId) => {
    return get().agents.filter(agent => agent.workspaceId === workspaceId);
  }
}));