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
          models: [],
          selectedModel: '',
          isLocal: true,
          isAutoDetecting: false,
          lastDetectionAttempt: null,
          connectionError: null
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
        enableDebugMode: false,
        autoConnectOnStartup: true
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
      detectOllamaModels: async (forceRefresh = false) => {
        const state = get();
        const ollama = state.llmProviders.ollama;

        // Skip if we've attempted detection recently (within 30 seconds) unless forced
        const now = Date.now();
        if (
          !forceRefresh && 
          ollama.lastDetectionAttempt && 
          (now - ollama.lastDetectionAttempt < 30000) &&
          ollama.isAutoDetecting
        ) {
          return ollama.models;
        }

        // Mark as detecting
        set(state => ({
          llmProviders: {
            ...state.llmProviders,
            ollama: {
              ...state.llmProviders.ollama,
              isAutoDetecting: true,
              lastDetectionAttempt: now,
              connectionError: null
            }
          }
        }));

        try {
          console.log('Attempting to fetch Ollama models...');
          
          // Use the fetch API with a timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          // IMPORTANT: Changed from /api/tags to /api/models which is the correct endpoint
          const response = await fetch(`${ollama.baseUrl}/api/models`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Ollama API response:', data);
          
          // Check if models array exists and has items
          if (!data.models || !Array.isArray(data.models)) {
            set(state => ({
              llmProviders: {
                ...state.llmProviders,
                ollama: {
                  ...state.llmProviders.ollama,
                  isAutoDetecting: false,
                  connectionError: 'No models found. Please pull models using the Ollama CLI.',
                  models: []
                }
              }
            }));
            return [];
          }
          
          // Extract model names
          const models = data.models.map(model => typeof model === 'string' ? model : model.name);
          
          console.log('Found models:', models);
          
          set(state => ({
            llmProviders: {
              ...state.llmProviders,
              ollama: {
                ...state.llmProviders.ollama,
                models,
                selectedModel: models[0] || '',
                enabled: models.length > 0,
                isAutoDetecting: false,
                connectionError: null
              }
            }
          }));
          
          return models;
        } catch (error) {
          console.error('Ollama detection error:', error);
          
          set(state => ({
            llmProviders: {
              ...state.llmProviders,
              ollama: {
                ...state.llmProviders.ollama,
                isAutoDetecting: false,
                connectionError: error.message || 'Failed to connect to Ollama'
              }
            }
          }));
          
          return [];
        }
      },

      // Auto-connect to available LLM providers
      autoConnectProviders: async () => {
        if (!get().appSettings.autoConnectOnStartup) return;
        
        console.log('Auto-connecting to LLM providers...');
        // Start with Ollama as it's the preferred local option
        await get().detectOllamaModels(true);
        
        // Future: Add auto-connection logic for other providers if API keys are stored
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
        return provider?.enabled ? provider : null;
      },

      // Test connection with current active provider
      testActiveConnection: async () => {
        const provider = get().getActiveProvider();
        if (!provider) return { success: false, error: "No active provider configured" };
        
        try {
          // Simple test query to verify connection works
          const response = await fetch(`${provider.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: provider.selectedModel,
              prompt: "Say 'Connection successful'",
              options: { temperature: 0.7, num_predict: 20 },
              stream: false
            }),
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          
          const data = await response.json();
          return { success: true, message: "Connection successful" };
        } catch (error) {
          return { success: false, error: error.message };
        }
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