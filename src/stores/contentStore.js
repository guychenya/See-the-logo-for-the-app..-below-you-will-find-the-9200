import { create } from 'zustand';

export const useContentStore = create((set, get) => ({
  chatHistory: {},
  contentGenerated: [],
  
  addChatMessage: (agentId, message) => {
    set(state => ({
      chatHistory: {
        ...state.chatHistory,
        [agentId]: [...(state.chatHistory[agentId] || []), message]
      }
    }));
  },
  
  getChatHistory: (agentId) => {
    return get().chatHistory[agentId] || [];
  },
  
  addGeneratedContent: (content) => {
    set(state => ({
      contentGenerated: [...state.contentGenerated, content]
    }));
  },
  
  getContentHistory: (workspaceId) => {
    return get().contentGenerated.filter(content => content.workspaceId === workspaceId);
  },
  
  clearChatHistory: (agentId) => {
    set(state => ({
      chatHistory: {
        ...state.chatHistory,
        [agentId]: []
      }
    }));
  }
}));