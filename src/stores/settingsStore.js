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
        try {
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

          console.log('Attempting to fetch Ollama models...');
          
          // Use the fetch API with a timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          // First try the /api/models endpoint (newer Ollama versions)
          try {
            const modelsResponse = await fetch(`${ollama.baseUrl}/api/models`, {
              signal: controller.signal
            }).catch(err => {
              console.log('Error fetching models:', err);
              throw err;
            });
            
            if (modelsResponse?.ok) {
              clearTimeout(timeoutId);
              const data = await modelsResponse.json();
              console.log('Ollama API response from /api/models:', data);
              
              if (data.models && Array.isArray(data.models)) {
                // Extract model names from newer API format
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
              }
            }
            
            // If we get here, the /api/models endpoint didn't work as expected
            console.log('Falling back to /api/tags endpoint...');
            throw new Error('Models endpoint failed, trying fallback');
          } catch (firstError) {
            // Try the older /api/tags endpoint as fallback
            try {
              console.log('Trying fallback to /api/tags endpoint...');
              const tagsResponse = await fetch(`${ollama.baseUrl}/api/tags`, {
                signal: controller.signal
              }).catch(err => {
                console.log('Error fetching tags:', err);
                throw err;
              });
              
              clearTimeout(timeoutId);
              
              if (tagsResponse?.ok) {
                const tagsData = await tagsResponse.json();
                console.log('Ollama API response from /api/tags:', tagsData);
                
                // Check if models array exists and has items
                if (!tagsData.models && !Array.isArray(tagsData.models) && !tagsData.tags) {
                  // Try one more fallback - just list the models from user's models directory
                  console.log('Trying direct model list endpoint...');
                  
                  // Last attempt - try a simple ping to see if Ollama is running
                  try {
                    const pingResponse = await fetch(`${ollama.baseUrl}/api/version`, {
                      signal: AbortSignal.timeout(5000)
                    });
                    
                    if (pingResponse?.ok) {
                      const pingData = await pingResponse.json();
                      console.log('Ollama is running, version:', pingData.version);
                      
                      set(state => ({
                        llmProviders: {
                          ...state.llmProviders,
                          ollama: {
                            ...state.llmProviders.ollama,
                            isAutoDetecting: false,
                            connectionError: 'Connected to Ollama server, but no models found. Please pull models using the Ollama CLI (e.g., `ollama pull llama2`).',
                            models: []
                          }
                        }
                      }));
                      return [];
                    } else {
                      throw new Error('No models found. Please pull models using the Ollama CLI.');
                    }
                  } catch (pingError) {
                    console.log('Ping error:', pingError);
                    throw pingError;
                  }
                }
                
                // Extract model names from older API format
                let models = [];
                if (tagsData.models && Array.isArray(tagsData.models)) {
                  models = tagsData.models;
                } else if (tagsData.tags && Array.isArray(tagsData.tags)) {
                  models = tagsData.tags;
                }
                
                console.log('Found models via fallback:', models);
                
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
              } else {
                throw new Error(`Failed to fetch models: ${tagsResponse?.status || 'Unknown error'}`);
              }
            } catch (tagsError) {
              console.log('Tags error:', tagsError);
              throw tagsError;
            }
          }
        } catch (error) {
          console.error('Ollama detection error:', error);
          
          // Set error state
          set(state => ({
            llmProviders: {
              ...state.llmProviders,
              ollama: {
                ...state.llmProviders.ollama,
                isAutoDetecting: false,
                connectionError: error.message || 'Failed to connect to Ollama server. Please make sure it is running with `ollama serve`.'
              }
            }
          }));
          
          // Return empty array for models
          return [];
        }
      },

      // Auto-connect to available LLM providers
      autoConnectProviders: async () => {
        if (!get().appSettings.autoConnectOnStartup) return;
        
        console.log('Auto-connecting to LLM providers...');
        try {
          // Start with Ollama as it's the preferred local option
          await get().detectOllamaModels(true);
        } catch (err) {
          console.error('Error auto-connecting to Ollama:', err);
        }
        
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
      }),
      // Add error handling for storage issues
      onRehydrateStorage: () => (state) => {
        console.log('Settings store rehydrated');
        if (!state) {
          console.error('Failed to rehydrate settings store');
        }
      }
    }
  )
);