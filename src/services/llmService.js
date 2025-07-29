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
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callAnthropic(prompt, options, provider) {
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
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async callGemini(prompt, options, provider) {
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
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  async callOllama(prompt, options, provider) {
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
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
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
      const testPrompt = "Hello, this is a connection test. Please respond with 'Connection successful'.";
      const response = await this.generateCompletion(testPrompt, { maxTokens: 50 });
      return { success: true, response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const llmService = new LLMService();