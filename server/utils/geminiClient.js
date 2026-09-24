const { sendMessage, extractJSON } = require('./openrouterClient');

/**
 * Send a message via OpenRouter (using Gemini 2.0 Flash)
 */
const sendGeminiMessage = async (systemPrompt, messages) => {
  return await sendMessage(systemPrompt, messages, 'google/gemini-2.0-flash-001');
};

/**
 * Analyze screening results
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

  const responseText = await sendGeminiMessage(systemPrompt, [{ role: 'user', content: userMessage }]);
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

  return await sendGeminiMessage(systemPrompt, messages);
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

  const responseText = await sendGeminiMessage(systemPrompt, [{ role: 'user', content: userMessage }]);
  return extractJSON(responseText);
};

/**
 * Analyze voice transcript
 */
const analyzeVoiceTranscript = async (transcript) => {
  const systemPrompt = `You are a mental health analysis AI. Analyze this voice journal transcript for:
- Emotional tone (single word like hopeful, distressed, flat, agitated, happy, sad)
- Detailed description of how the user is feeling and the underlying themes
- Actionable improvement suggestions or coping strategies
- Recommended therapeutic tools to use (choose from: "Reflect Your Day", "Muscle Relaxation", "CBT Builder", "Worry Tree", "Day Organiser")
- Key phrases indicating risk (hopelessness, isolation, fatigue)
Return JSON: { 
  "emotionalTone": "string",
  "detailedDescription": "string",
  "improvementSuggestions": ["string"],
  "recommendedTools": ["string"],
  "riskFlags": ["string"],
  "notes": "string",
  "riskLevel": "low"|"moderate"|"high" 
}
Never diagnose. Only flag observations and provide compassionate analysis.`;

  const responseText = await sendGeminiMessage(systemPrompt, [{ role: 'user', content: transcript }]);
  return extractJSON(responseText);
};

/**
 * Analyze CBT Cycle
 */
const analyzeCBT = async (situation, thought, feeling, behavior) => {
  const systemPrompt = `You are a CBT-trained mental health support assistant on a government health platform.
Given a user's situation, automatic thought, feelings, and behavior:
1. Validate their emotional experience in 1-2 warm sentences
2. Identify the cognitive distortion present (if any) by name
3. Offer ONE gently reframed alternative thought
4. Suggest ONE small behavioural experiment for the next 24 hours
Format as JSON: { "validation": string, "distortion": string, "reframe": string, "experiment": string }
Never diagnose. Use warm, non-clinical language. Max 80 words per field.`;

  const userMessage = `Situation: ${situation}\nThought: ${thought}\nFeelings: ${feeling}\nBehavior: ${behavior}`;
  const responseText = await sendGeminiMessage(systemPrompt, [{ role: 'user', content: userMessage }]);
  return extractJSON(responseText);
};

/**
 * Categorize Worry
 */
const categorizeWorry = async (worry) => {
  const systemPrompt = `You are a mental health support tool on a government platform.
Given a user's worry, respond with JSON only:
{ 
  "category": "controllable" | "uncontrollable",
  "suggestion": "one sentence — action step if controllable, letting-go phrase if not"
}
Be warm, concise, and non-clinical. Never diagnose. Max 20 words for suggestion.`;

  const responseText = await sendGeminiMessage(systemPrompt, [{ role: 'user', content: worry }]);
  return extractJSON(responseText);
};

module.exports = {
  sendMessage: sendGeminiMessage,
  analyzeScreening,
  chatWithMindBot,
  analyzeGameResponse,
  analyzeVoiceTranscript,
  analyzeCBT,
  categorizeWorry
};
