const OpenAI = require('openai');

let openai = null;

/**
 * Initialize OpenRouter client
 */
const getClient = () => {
  if (!openai && process.env.OPENROUTER_API_KEY) {
    openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'https://mindbridge.ai', // Optional, for OpenRouter tracking
        'X-Title': 'MindBridge AI',
      }
    });
  }
  return openai;
};

/**
 * Send a message via OpenRouter
 * @param {string} systemPrompt - System instruction
 * @param {Array} messages - [{ role, content }]
 * @param {string} model - OpenRouter model ID (e.g., 'google/gemini-2.0-flash-001')
 * @returns {string} Response text
 */
const sendMessage = async (systemPrompt, messages, model = 'google/gemini-2.0-flash-001') => {
  const client = getClient();
  
  if (!client) {
    throw new Error('OpenRouter API Key not configured');
  }

  try {
    const response = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
          role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error:', error.message);
    if (error.status === 401) throw new Error('Invalid OpenRouter API Key');
    if (error.status === 429) throw new Error('AI rate limit exceeded');
    throw new Error('AI service temporarily unavailable');
  }
};

/**
 * Utility to extract JSON from a response string
 */
const extractJSON = (text) => {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : JSON.parse(text);
  } catch (err) {
    console.error('JSON Extraction Error:', err.message, 'Raw text:', text);
    return { error: 'Failed to parse AI response', raw: text };
  }
};

module.exports = {
  sendMessage,
  extractJSON
};
