import { create } from 'zustand';

export const useWorkspaceStore = create((set, get) => ({
  workspaces: [
    {
      id: '1',
      name: 'AI Development Hub',
      description: 'Primary workspace for AI agent development and testing',
      role: 'owner',
      members: 5,
      projects: 3,
      agents: 8,
      lastActivity: new Date().toISOString(),
      color: 'blue'
    },
    {
      id: '2',
      name: 'Marketing Automation',
      description: 'Content generation and marketing campaign management',
      role: 'admin',
      members: 3,
      projects: 2,
      agents: 5,
      lastActivity: new Date(Date.now() - 86400000).toISOString(),
      color: 'green'
    },
    {
      id: '3',
      name: 'Research & Analysis',
      description: 'Data analysis and research automation workspace',
      role: 'member',
      members: 7,
      projects: 4,
      agents: 12,
      lastActivity: new Date(Date.now() - 172800000).toISOString(),
      color: 'purple'
    }
  ],
  
  currentWorkspace: null,

  setCurrentWorkspace: (workspaceId) => {
    const workspace = get().workspaces.find(w => w.id === workspaceId);
    set({ currentWorkspace: workspace });
  },

  createWorkspace: (workspaceData) => {
    const newWorkspace = {
      id: Date.now().toString(),
      ...workspaceData,
      role: 'owner',
      members: 1,
      projects: 0,
      agents: 0,
      lastActivity: new Date().toISOString()
    };
    
    set(state => ({
      workspaces: [...state.workspaces, newWorkspace]
    }));
    
    return newWorkspace;
  },

  updateWorkspace: (workspaceId, updates) => {
    set(state => ({
      workspaces: state.workspaces.map(workspace =>
        workspace.id === workspaceId
          ? { ...workspace, ...updates, lastActivity: new Date().toISOString() }
          : workspace
      )
    }));
    
    // Update current workspace if it's the one being updated
    const currentWorkspace = get().currentWorkspace;
    if (currentWorkspace && currentWorkspace.id === workspaceId) {
      set({ currentWorkspace: { ...currentWorkspace, ...updates } });
    }
  },

  deleteWorkspace: (workspaceId) => {
    set(state => ({
      workspaces: state.workspaces.filter(workspace => workspace.id !== workspaceId)
    }));
    
    // Clear current workspace if it's the one being deleted
    const currentWorkspace = get().currentWorkspace;
    if (currentWorkspace && currentWorkspace.id === workspaceId) {
      set({ currentWorkspace: null });
    }
  }
}));