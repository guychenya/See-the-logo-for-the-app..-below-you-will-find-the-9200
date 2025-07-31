import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // LLM Provider Settings
      llmProviders: {
        openai: {
          name: 'OpenAI',
          enabled: false,
          apiKey: '',
          baseUrl: 'https://api.openai.com/v1',
          models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
          selectedModel: 'gpt-4'
        },
        anthropic: {
          name: 'Anthropic',
          enabled: false,
          apiKey: '',
          baseUrl: 'https://api.anthropic.com',
          models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
          selectedModel: 'claude-3-sonnet'
        },
        gemini: {
          name: 'Google Gemini',
          enabled: false,
          apiKey: '',
          baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
          models: ['gemini-pro', 'gemini-pro-vision'],
          selectedModel: 'gemini-pro'
        },
        ollama: {
          name: 'Ollama (Local)',
          enabled: true,
          apiKey: '',
          baseUrl: 'http://localhost:11434',
          models: ['llama2', 'codellama', 'mistral', 'neural-chat'],
          selectedModel: 'llama2',
          isLocal: true
        }
      },

      // Default LLM Provider
      defaultProvider: 'ollama',

      // App Settings
      appSettings: {
        theme: 'dark',
        autoSave: true,
        enableNotifications: true,
        maxChatHistory: 100,
        enableDebugMode: false
      },

      // Update LLM Provider
      updateProvider: (provider, config) => {
        set(state => ({
          llmProviders: {
            ...state.llmProviders,
            [provider]: {
              ...state.llmProviders[provider],
              ...config
            }
          }
        }));
      },

      // Set Default Provider
      setDefaultProvider: (provider) => {
        set({ defaultProvider: provider });
      },

      // Detect Ollama Models
      detectOllamaModels: async () => {
        try {
          const response = await fetch('http://localhost:11434/api/tags');
          if (response.ok) {
            const data = await response.json();
            const models = data.models?.map(model => model.name) || [];
            
            set(state => ({
              llmProviders: {
                ...state.llmProviders,
                ollama: {
                  ...state.llmProviders.ollama,
                  models,
                  selectedModel: models[0] || '',
                  enabled: models.length > 0
                }
              }
            }));
            
            return models;
          }
        } catch (error) {
          console.log('Ollama not available:', error);
          
          // Set default models if Ollama is not running
          set(state => ({
            llmProviders: {
              ...state.llmProviders,
              ollama: {
                ...state.llmProviders.ollama,
                models: ['llama2', 'codellama', 'mistral', 'neural-chat'],
                selectedModel: 'llama2',
                enabled: false
              }
            }
          }));
        }
        return [];
      },

      // Update App Settings
      updateAppSettings: (settings) => {
        set(state => ({
          appSettings: {
            ...state.appSettings,
            ...settings
          }
        }));
      },

      // Get Active Provider
      getActiveProvider: () => {
        const state = get();
        const provider = state.llmProviders[state.defaultProvider];
        return provider?.enabled && provider?.selectedModel ? provider : null;
      }
    }),
    {
      name: 'apexsprite-settings',
      partialize: (state) => ({
        llmProviders: state.llmProviders,
        defaultProvider: state.defaultProvider,
        appSettings: state.appSettings
      })
    }
  )
);