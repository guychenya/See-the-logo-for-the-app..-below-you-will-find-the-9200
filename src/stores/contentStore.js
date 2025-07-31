import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useContentStore = create(
  persist(
    (set, get) => ({
      chatHistory: {},
      contentGenerated: [],

      addChatMessage: (agentId, message) => {
        try {
          if (!agentId || !message) {
            console.error('Invalid parameters for addChatMessage');
            return;
          }

          set(state => {
            const currentHistory = state.chatHistory || {};
            const agentHistory = currentHistory[agentId] || [];
            
            return {
              chatHistory: {
                ...currentHistory,
                [agentId]: [...agentHistory, message]
              }
            };
          });
        } catch (error) {
          console.error('Error adding chat message:', error);
        }
      },

      getChatHistory: (agentId) => {
        try {
          if (!agentId) {
            return [];
          }

          const state = get();
          return (state.chatHistory && state.chatHistory[agentId]) || [];
        } catch (error) {
          console.error('Error getting chat history:', error);
          return [];
        }
      },

      addGeneratedContent: (content) => {
        try {
          if (!content) {
            console.error('Invalid content for addGeneratedContent');
            return;
          }

          set(state => ({
            contentGenerated: [...(state.contentGenerated || []), content]
          }));
        } catch (error) {
          console.error('Error adding generated content:', error);
        }
      },

      getContentHistory: (workspaceId) => {
        try {
          if (!workspaceId) {
            return [];
          }

          const state = get();
          return (state.contentGenerated || []).filter(content => 
            content && content.workspaceId === workspaceId
          );
        } catch (error) {
          console.error('Error getting content history:', error);
          return [];
        }
      },

      clearChatHistory: (agentId) => {
        try {
          if (!agentId) {
            console.error('Agent ID required for clearChatHistory');
            return;
          }

          set(state => {
            const currentHistory = state.chatHistory || {};
            return {
              chatHistory: {
                ...currentHistory,
                [agentId]: []
              }
            };
          });
        } catch (error) {
          console.error('Error clearing chat history:', error);
        }
      },

      clearAllData: () => {
        try {
          set({
            chatHistory: {},
            contentGenerated: []
          });
        } catch (error) {
          console.error('Error clearing all data:', error);
        }
      }
    }),
    {
      name: 'apexsprite-content',
      partialize: (state) => ({
        chatHistory: state.chatHistory,
        contentGenerated: state.contentGenerated
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Content store rehydrated');
      }
    }
  )
);