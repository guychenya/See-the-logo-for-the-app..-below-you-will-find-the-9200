import { useSettingsStore } from '../stores/settingsStore';

class LLMService {
  constructor() {
    this.settingsStore = useSettingsStore;
    this.isInitialized = false;
    this.initializationPromise = null;
  }

  async initialize() {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this._performInitialization();
    await this.initializationPromise;
    this.isInitialized = true;
  }

  async _performInitialization() {
    try {
      // Initialize any required connections or configurations
      console.log('LLM Service initialized');
    } catch (error) {
      console.error('Failed to initialize LLM Service:', error);
      throw error;
    }
  }

  async generateCompletion(prompt, options = {}) {
    try {
      await this.initialize();
      
      const state = this.settingsStore.getState();
      if (!state) {
        throw new Error('Settings store not available');
      }

      const provider = state.getActiveProvider();
      if (!provider) {
        throw new Error('No active LLM provider configured');
      }

      const { temperature = 0.7, maxTokens = 2000, stream = false } = options;

      switch (state.defaultProvider) {
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
    } catch (error) {
      console.error('Error in generateCompletion:', error);
      throw error;
    }
  }

  async callOpenAI(prompt, options, provider) {
    try {
      if (!provider.apiKey) {
        throw new Error('OpenAI API key not configured');
      }

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
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response generated';
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  async callAnthropic(prompt, options, provider) {
    try {
      if (!provider.apiKey) {
        throw new Error('Anthropic API key not configured');
      }

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
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return data.content?.[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Anthropic API call failed:', error);
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  async callGemini(prompt, options, provider) {
    try {
      if (!provider.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const response = await fetch(`${provider.baseUrl}/models/${provider.selectedModel}:generateContent?key=${provider.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: options.temperature,
            maxOutputTokens: options.maxTokens
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async callOllama(prompt, options, provider) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${provider.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: provider.selectedModel,
          prompt: prompt,
          options: {
            temperature: options.temperature,
            num_predict: options.maxTokens
          },
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      return data.response || 'No response generated';
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - Ollama took too long to respond');
      }
      console.error('Ollama connection error:', error);
      throw new Error(`Failed to connect to Ollama: ${error.message}`);
    }
  }

  async generateAgentResponse(agentConfig, userMessage, conversationHistory = []) {
    try {
      if (!agentConfig) {
        throw new Error('Agent configuration is required');
      }

      const { systemPrompt = '', capabilities = [], settings = {} } = agentConfig;
      
      // Build context from conversation history safely
      const contextMessages = Array.isArray(conversationHistory) 
        ? conversationHistory.slice(-10) 
        : [];
      
      const historyContext = contextMessages
        .filter(msg => msg && msg.role && msg.content)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      // Create a comprehensive prompt
      const prompt = `${systemPrompt}

You are an AI agent with the following capabilities: ${capabilities.join(', ')}

Previous conversation context:
${historyContext}

Current user message: ${userMessage}

Please respond as this agent, staying in character and using your specified capabilities. Be helpful, accurate, and maintain the personality defined in your system prompt.`;

      const response = await this.generateCompletion(prompt, {
        temperature: settings?.temperature || 0.7,
        maxTokens: settings?.maxTokens || 2000
      });

      return response;
    } catch (error) {
      console.error('Error generating agent response:', error);
      throw error;
    }
  }

  async generateAgentConfig(description) {
    try {
      if (!description || typeof description !== 'string') {
        throw new Error('Valid description is required');
      }

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

      const response = await this.generateCompletion(prompt, { temperature: 0.3 });
      
      try {
        return JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse agent config JSON:', parseError);
        // Return a fallback configuration
        return {
          name: "Custom Agent",
          description: description,
          type: "specialized",
          capabilities: ["General Assistance"],
          systemPrompt: `You are a helpful AI assistant. ${description}`,
          tools: [],
          settings: {
            temperature: 0.7,
            maxTokens: 2000,
            internetAccess: false,
            knowledgeBase: true,
            memoryEnabled: true
          },
          suggestedSubAgents: []
        };
      }
    } catch (error) {
      console.error('Error generating agent config:', error);
      throw error;
    }
  }

  async testConnection(provider) {
    try {
      const testPrompt = "Hello, this is a connection test. Please respond with 'Connection successful'.";
      const response = await this.generateCompletion(testPrompt, { maxTokens: 50 });
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async detectOllamaModels() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('http://localhost:11434/api/tags', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data.models?.map(model => model.name) || [];
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Ollama detection timeout');
      } else {
        console.log('Ollama not available:', error);
      }
    }
    return [];
  }
}

export const llmService = new LLMService();