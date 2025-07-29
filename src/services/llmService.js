import { useSettingsStore } from '../stores/settingsStore';

class LLMService {
  constructor() {
    this.settingsStore = useSettingsStore;
  }

  async generateCompletion(prompt, options = {}) {
    const provider = this.settingsStore.getState().getActiveProvider();
    
    if (!provider) {
      throw new Error('No active LLM provider configured');
    }

    const { temperature = 0.7, maxTokens = 2000, stream = false } = options;

    switch (this.settingsStore.getState().defaultProvider) {
      case 'openai':
        return this.callOpenAI(prompt, { temperature, maxTokens, stream }, provider);
      case 'anthropic':
        return this.callAnthropic(prompt, { temperature, maxTokens, stream }, provider);
      case 'gemini':
        return this.callGemini(prompt, { temperature, maxTokens, stream }, provider);
      case 'ollama':
        return this.callOllama(prompt, { temperature, maxTokens, stream }, provider);
      default:
        throw new Error('Unsupported LLM provider');
    }
  }

  async callOpenAI(prompt, options, provider) {
    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`
        },
        body: JSON.stringify({
          model: provider.selectedModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          stream: options.stream
        }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  }

  async callAnthropic(prompt, options, provider) {
    try {
      const response = await fetch(`${provider.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': provider.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: provider.selectedModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature,
          max_tokens: options.maxTokens
        }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error("Anthropic API error:", error);
      throw error;
    }
  }

  async callGemini(prompt, options, provider) {
    try {
      const response = await fetch(`${provider.baseUrl}/models/${provider.selectedModel}:generateContent?key=${provider.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens
          }
        }),
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }

  async callOllama(prompt, options, provider) {
    try {
      console.log(`Calling Ollama API with model: ${provider.selectedModel}`);
      
      // Try to add CORS headers to avoid issues
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      
      const response = await fetch(`${provider.baseUrl}/api/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: provider.selectedModel,
          prompt: prompt,
          options: {
            temperature: options.temperature,
            num_predict: options.maxTokens
          },
          stream: false
        }),
        signal: AbortSignal.timeout(30000) // 30 second timeout for local models which can be slower
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Ollama API error:", error);
      
      // Provide more helpful error message for CORS issues
      if (error.message.includes('CORS') || error.name === 'TypeError') {
        throw new Error('CORS error: Unable to access Ollama API. Try running Ollama with CORS enabled: "OLLAMA_ORIGINS=* ollama serve"');
      }
      
      throw error;
    }
  }

  async generateAgentConfig(description) {
    const prompt = `You are an AI agent configuration generator. Based on the following description, generate a comprehensive agent configuration in JSON format.

Description: "${description}"

Generate a JSON configuration with the following structure:
{
  "name": "Agent Name",
  "description": "Detailed description of the agent's purpose",
  "type": "primary" or "specialized",
  "capabilities": ["capability1", "capability2", ...],
  "systemPrompt": "Detailed system prompt defining behavior and personality",
  "tools": ["tool1", "tool2", ...],
  "settings": {
    "temperature": 0.7,
    "maxTokens": 2000,
    "internetAccess": true/false,
    "knowledgeBase": true/false,
    "memoryEnabled": true/false
  },
  "suggestedSubAgents": [
    {
      "name": "Sub-agent name",
      "description": "Sub-agent description",
      "capabilities": ["capability1", "capability2"]
    }
  ]
}

Make the configuration detailed, practical, and tailored to the specific use case described.`;

    try {
      const response = await this.generateCompletion(prompt, { temperature: 0.3 });
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating agent config:', error);
      throw error;
    }
  }

  async testConnection(provider) {
    try {
      console.log(`Testing connection to ${provider}...`);
      const providerData = this.settingsStore.getState().llmProviders[provider];
      if (!providerData || !providerData.selectedModel) {
        return { success: false, error: 'Invalid provider or no model selected' };
      }

      let testPrompt = "Hello, this is a connection test. Please respond with 'Connection successful'.";

      // Different testing methods for different providers
      switch (provider) {
        case 'ollama':
          console.log(`Testing Ollama with model: ${providerData.selectedModel}`);
          try {
            // First check if the server is accessible with a simple version check
            const versionController = new AbortController();
            const versionTimeoutId = setTimeout(() => versionController.abort(), 5000);
            
            try {
              const versionResponse = await fetch(`${providerData.baseUrl}/api/version`, {
                signal: versionController.signal
              });
              
              clearTimeout(versionTimeoutId);
              
              if (versionResponse.ok) {
                const versionData = await versionResponse.json();
                console.log("Ollama version:", versionData.version);
              } else {
                console.log("Version check failed, but continuing with model test");
              }
            } catch (versionError) {
              console.log("Version check failed:", versionError);
              // Continue with the generation test anyway
            }
            
            // Now test actual generation
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch(`${providerData.baseUrl}/api/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: providerData.selectedModel,
                prompt: testPrompt,
                options: { temperature: 0.7, num_predict: 20 },
                stream: false
              }),
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`API error: ${response.status} - ${errorText}`);
            }
            
            const data = await response.json();
            console.log("Ollama test response:", data);
            return { 
              success: true, 
              message: "Connection successful",
              response: data.response
            };
          } catch (err) {
            console.error("Ollama test error:", err);
            
            // Check if it's a CORS error
            if (err.message.includes('CORS') || err.name === 'TypeError') {
              return { 
                success: false, 
                error: 'CORS error: Unable to access Ollama API. Try running Ollama with CORS enabled: "OLLAMA_ORIGINS=* ollama serve"'
              };
            }
            
            return { success: false, error: err.message };
          }
          
        case 'openai':
          const response = await fetch(`${providerData.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${providerData.apiKey}`
            },
            body: JSON.stringify({
              model: providerData.selectedModel,
              messages: [{ role: 'user', content: testPrompt }],
              max_tokens: 20
            }),
            signal: AbortSignal.timeout(10000)
          });
          
          if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
          }
          
          return { success: true, message: "Connection successful" };
          
        // Add other provider test methods as needed
        
        default:
          // For other providers, use the generateCompletion method
          const result = await this.generateCompletion(testPrompt, { maxTokens: 50 });
          return { success: true, response: result };
      }
    } catch (error) {
      console.error("Connection test error:", error);
      return { 
        success: false, 
        error: error.message || "Connection failed"
      };
    }
  }
}

export const llmService = new LLMService();