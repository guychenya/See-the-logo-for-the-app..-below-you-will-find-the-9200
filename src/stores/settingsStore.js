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
        try {
          if (!provider || typeof provider !== 'string') {
            console.error('Invalid provider name');
            return;
          }

          set(state => {
            const currentProviders = state.llmProviders || {};
            const currentProvider = currentProviders[provider] || {};
            
            return {
              llmProviders: {
                ...currentProviders,
                [provider]: {
                  ...currentProvider,
                  ...config
                }
              }
            };
          });
        } catch (error) {
          console.error('Error updating provider:', error);
        }
      },

      // Set Default Provider
      setDefaultProvider: (provider) => {
        try {
          if (!provider || typeof provider !== 'string') {
            console.error('Invalid provider name');
            return;
          }

          const state = get();
          if (!state.llmProviders?.[provider]) {
            console.error('Provider does not exist');
            return;
          }

          set({ defaultProvider: provider });
        } catch (error) {
          console.error('Error setting default provider:', error);
        }
      },

      // Detect Ollama Models
      detectOllamaModels: async () => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch('http://localhost:11434/api/tags', {
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const models = data.models?.map(model => model.name) || [];
            
            set(state => {
              const currentProviders = state.llmProviders || {};
              const ollamaProvider = currentProviders.ollama || {};
              
              return {
                llmProviders: {
                  ...currentProviders,
                  ollama: {
                    ...ollamaProvider,
                    models,
                    selectedModel: models[0] || '',
                    enabled: models.length > 0
                  }
                }
              };
            });
            
            return models;
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Ollama detection timeout');
          } else {
            console.log('Ollama not available:', error);
          }
          
          // Set default models if Ollama is not running
          set(state => {
            const currentProviders = state.llmProviders || {};
            const ollamaProvider = currentProviders.ollama || {};
            
            return {
              llmProviders: {
                ...currentProviders,
                ollama: {
                  ...ollamaProvider,
                  models: ['llama2', 'codellama', 'mistral', 'neural-chat'],
                  selectedModel: 'llama2',
                  enabled: false
                }
              }
            };
          });
        }
        return [];
      },

      // Update App Settings
      updateAppSettings: (settings) => {
        try {
          if (!settings || typeof settings !== 'object') {
            console.error('Invalid settings object');
            return;
          }

          set(state => ({
            appSettings: {
              ...state.appSettings,
              ...settings
            }
          }));
        } catch (error) {
          console.error('Error updating app settings:', error);
        }
      },

      // Get Active Provider
      getActiveProvider: () => {
        try {
          const state = get();
          if (!state || !state.llmProviders || !state.defaultProvider) {
            return null;
          }

          const provider = state.llmProviders[state.defaultProvider];
          return provider?.enabled && provider?.selectedModel ? provider : null;
        } catch (error) {
          console.error('Error getting active provider:', error);
          return null;
        }
      }
    }),
    {
      name: 'apexsprite-settings',
      partialize: (state) => ({
        llmProviders: state.llmProviders,
        defaultProvider: state.defaultProvider,
        appSettings: state.appSettings
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Settings store rehydrated');
      }
    }
  )
);