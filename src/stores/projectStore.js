import { create } from 'zustand';

export const useProjectStore = create((set, get) => ({
  projects: [
    {
      id: '1',
      name: 'Content Automation Pipeline',
      description: 'Automated content generation and publishing workflow',
      status: 'active',
      progress: 75,
      members: 3,
      lastActivity: new Date().toISOString(),
      workspaceId: '1',
      createdAt: new Date().toISOString(),
      tasks: [
        { id: '1', title: 'Setup content templates', completed: true },
        { id: '2', title: 'Configure publishing schedule', completed: true },
        { id: '3', title: 'Implement review workflow', completed: false }
      ],
      tags: ['automation', 'content', 'workflow']
    },
    {
      id: '2',
      name: 'Customer Support Bot',
      description: 'AI-powered customer service automation',
      status: 'completed',
      progress: 100,
      members: 2,
      lastActivity: new Date(Date.now() - 86400000).toISOString(),
      workspaceId: '1',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      tasks: [
        { id: '1', title: 'Train support models', completed: true },
        { id: '2', title: 'Deploy to production', completed: true }
      ],
      tags: ['support', 'automation', 'customer-service']
    }
  ],

  // CRUD Operations
  createProject: (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      progress: 0,
      members: 1,
      tasks: [],
      tags: []
    };
    
    set(state => ({
      projects: [...state.projects, newProject]
    }));
    
    return newProject;
  },

  updateProject: (projectId, updates) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId
          ? { ...project, ...updates, lastActivity: new Date().toISOString() }
          : project
      )
    }));
  },

  deleteProject: (projectId) => {
    set(state => ({
      projects: state.projects.filter(project => project.id !== projectId)
    }));
  },

  getProjectsByWorkspace: (workspaceId) => {
    return get().projects.filter(project => project.workspaceId === workspaceId);
  },

  getProjectById: (projectId) => {
    return get().projects.find(project => project.id === projectId);
  },

  // Task Management
  addTask: (projectId, task) => {
    const newTask = {
      id: Date.now().toString(),
      ...task,
      completed: false,
      createdAt: new Date().toISOString()
    };

    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId
          ? { ...project, tasks: [...project.tasks, newTask] }
          : project
      )
    }));
  },

  updateTask: (projectId, taskId, updates) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
              )
            }
          : project
      )
    }));
  },

  deleteTask: (projectId, taskId) => {
    set(state => ({
      projects: state.projects.map(project =>
        project.id === projectId
          ? {
              ...project,
              tasks: project.tasks.filter(task => task.id !== taskId)
            }
          : project
      )
    }));
  }
}));