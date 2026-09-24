const { sendMessage, extractJSON } = require('./openrouterClient');

/**
 * Send a message via OpenRouter (using Claude 3.5 Sonnet)
 */
const sendClaudeMessage = async (systemPrompt, messages) => {
  return await sendMessage(systemPrompt, messages, 'anthropic/claude-3-5-sonnet:beta');
};

/**
 * Analyze screening results with Claude via OpenRouter
 */
const analyzeScreening = async (type, responses, totalScore, severity) => {
  const systemPrompt = `You are a clinical-grade mental health screening analysis AI for Neuro Sync AI.
Analyze the following ${type} screening responses. Provide a compassionate, professional summary.
Never diagnose. Only identify risk patterns based on DSM-5 and ICD-11 criteria.
Return a JSON object: { "summary": string, "keyFindings": string[], "recommendations": string[], "riskLevel": "low"|"moderate"|"high" }`;

  const userMessage = `Screening Type: ${type}
Total Score: ${totalScore}/27
Severity: ${severity}
Responses: ${JSON.stringify(responses)}`;

  const responseText = await sendClaudeMessage(systemPrompt, [{ role: 'user', content: userMessage }]);
  return extractJSON(responseText);
};

/**
 * Chat with MindBot
 */
const chatWithMindBot = async (messages, language = 'en') => {
  const systemPrompt = `You are NeuroBot, a compassionate virtual mental health assistant developed for 
Neuro Sync AI, a government-grade public health platform. You are NOT a therapist and you make this clear. 
You follow WHO mental health communication guidelines. You:
- Speak warmly, without clinical jargon
- Ask one question at a time
- Never diagnose
- Always recommend professional help for high-risk responses
- Detect crisis language (suicide, self-harm) and immediately flag it
- Analyze conversation for PHQ-9/GAD-7 equivalent signals
- After 10+ messages, offer to generate a preliminary screening report
- Support multilingual responses (current language: ${language})
- Reference WHO data when providing psychoeducation
- Keep responses concise (2-3 paragraphs max)

If you detect crisis language, include [CRISIS_DETECTED] at the start of your response.`;

  return await sendClaudeMessage(systemPrompt, messages);
};

/**
 * Analyze game responses
 */
const analyzeGameResponse = async (gameType, scenario, userResponse) => {
  const systemPrompt = `You are a clinical-grade mental health screening AI. 
Analyze the user's response to this scenario for signs of: depression, anxiety, 
social withdrawal, catastrophizing, hopelessness. 
Return JSON: { "riskIndicators": [], "severity": "low"|"moderate"|"high", "notes": string }
Base analysis on DSM-5 and ICD-11 criteria. Never diagnose. Only flag risk patterns.`;

  const userMessage = `Game: ${gameType}
Scenario: ${scenario}
User Response: ${userResponse}`;

  const responseText = await sendClaudeMessage(systemPrompt, [{ role: 'user', content: userMessage }]);
  return extractJSON(responseText);
};

/**
 * Analyze voice transcript
 */
const analyzeVoiceTranscript = async (transcript) => {
  const systemPrompt = `You are a mental health analysis AI. Analyze this voice journal transcript for:
- Emotional tone (hopeful, distressed, flat, agitated)
- Key phrases indicating risk (hopelessness, isolation, fatigue)
- Speech patterns
Return JSON: { "emotionalTone": string, "riskFlags": string[], "notes": string, "riskLevel": "low"|"moderate"|"high" }
Never diagnose. Only flag observations.`;

  const responseText = await sendClaudeMessage(systemPrompt, [{ role: 'user', content: transcript }]);
  return extractJSON(responseText);
};

module.exports = {
  sendMessage: sendClaudeMessage,
  analyzeScreening,
  chatWithMindBot,
  analyzeGameResponse,
  analyzeVoiceTranscript
};
