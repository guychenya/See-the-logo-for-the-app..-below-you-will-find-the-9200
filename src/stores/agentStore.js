import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAgentStore = create(
  persist(
    (set, get) => ({
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
          lastActivity: new Date().toISOString(),
          systemPrompt: 'You are an orchestrator agent responsible for coordinating tasks and managing workflows.',
          settings: {
            temperature: 0.7,
            maxTokens: 2000,
            internetAccess: false,
            knowledgeBase: true,
            memoryEnabled: true
          },
          metrics: {
            successRate: 94,
            avgResponse: 2.1,
            totalInteractions: 156,
            lastEvaluation: new Date().toISOString()
          }
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
          lastActivity: new Date().toISOString(),
          systemPrompt: 'You are a code assistant specialized in software development and programming.',
          settings: {
            temperature: 0.3,
            maxTokens: 3000,
            internetAccess: true,
            knowledgeBase: true,
            memoryEnabled: true
          },
          metrics: {
            successRate: 96,
            avgResponse: 1.8,
            totalInteractions: 89,
            lastEvaluation: new Date().toISOString()
          }
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
          lastActivity: new Date().toISOString(),
          systemPrompt: 'You are a content creator specializing in writing and creative tasks.',
          settings: {
            temperature: 0.8,
            maxTokens: 2500,
            internetAccess: false,
            knowledgeBase: true,
            memoryEnabled: true
          },
          metrics: {
            successRate: 92,
            avgResponse: 2.3,
            totalInteractions: 134,
            lastEvaluation: new Date().toISOString()
          }
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
          lastActivity: new Date(Date.now() - 3600000).toISOString(),
          systemPrompt: 'You are a data analyst specialized in data processing and statistical analysis.',
          settings: {
            temperature: 0.2,
            maxTokens: 2000,
            internetAccess: false,
            knowledgeBase: true,
            memoryEnabled: true
          },
          metrics: {
            successRate: 89,
            avgResponse: 3.2,
            totalInteractions: 67,
            lastEvaluation: new Date().toISOString()
          }
        }
      ],

      createAgent: (agentData) => {
        try {
          if (!agentData || typeof agentData !== 'object') {
            throw new Error('Invalid agent data');
          }

          const newAgent = {
            id: Date.now().toString(),
            status: 'active',
            connections: 0,
            lastActivity: new Date().toISOString(),
            capabilities: [],
            systemPrompt: '',
            settings: {
              temperature: 0.7,
              maxTokens: 2000,
              internetAccess: false,
              knowledgeBase: true,
              memoryEnabled: true
            },
            metrics: {
              successRate: 0,
              avgResponse: 0,
              totalInteractions: 0,
              lastEvaluation: new Date().toISOString()
            },
            ...agentData
          };

          set(state => ({
            agents: [...(state.agents || []), newAgent]
          }));

          return newAgent;
        } catch (error) {
          console.error('Error creating agent:', error);
          throw error;
        }
      },

      updateAgent: (agentId, updates) => {
        try {
          if (!agentId || !updates) {
            throw new Error('Invalid parameters for updateAgent');
          }

          set(state => ({
            agents: (state.agents || []).map(agent =>
              agent && agent.id === agentId 
                ? { ...agent, ...updates, lastActivity: new Date().toISOString() }
                : agent
            )
          }));
        } catch (error) {
          console.error('Error updating agent:', error);
          throw error;
        }
      },

      deleteAgent: (agentId) => {
        try {
          if (!agentId) {
            throw new Error('Agent ID is required');
          }

          set(state => ({
            agents: (state.agents || []).filter(agent => agent && agent.id !== agentId)
          }));
        } catch (error) {
          console.error('Error deleting agent:', error);
          throw error;
        }
      },

      getAgentsByWorkspace: (workspaceId) => {
        try {
          if (!workspaceId) {
            return [];
          }

          const state = get();
          return (state.agents || []).filter(agent => 
            agent && agent.workspaceId === workspaceId
          );
        } catch (error) {
          console.error('Error getting agents by workspace:', error);
          return [];
        }
      },

      getAgentById: (agentId) => {
        try {
          if (!agentId) {
            return null;
          }

          const state = get();
          return (state.agents || []).find(agent => 
            agent && agent.id === agentId
          ) || null;
        } catch (error) {
          console.error('Error getting agent by ID:', error);
          return null;
        }
      }
    }),
    {
      name: 'apexsprite-agents',
      partialize: (state) => ({ agents: state.agents }),
      onRehydrateStorage: () => (state) => {
        console.log('Agent store rehydrated');
      }
    }
  )
);