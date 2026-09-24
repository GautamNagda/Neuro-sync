const axios = require('axios');

/**
 * Transcribe audio using AssemblyAI
 * @param {Buffer} audioBuffer - Audio file buffer
 * @returns {string} Transcript text
 */
const transcribe = async (audioBuffer) => {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) throw new Error('AssemblyAI API key not configured');

  // Upload audio
  const uploadRes = await axios.post('https://api.assemblyai.com/v2/upload', audioBuffer, {
    headers: {
      authorization: apiKey,
      'content-type': 'application/octet-stream'
    }
  });

  const audioUrl = uploadRes.data.upload_url;

  // Request transcription
  const transcriptRes = await axios.post('https://api.assemblyai.com/v2/transcript', 
    { 
      audio_url: audioUrl,
      speech_models: ["universal-2"]
    },
    { headers: { authorization: apiKey } }
  );

  const transcriptId = transcriptRes.data.id;

  // Poll for completion
  let status = 'queued';
  let result;
  while (status !== 'completed' && status !== 'error') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollRes = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { authorization: apiKey }
    });
    status = pollRes.data.status;
    result = pollRes.data;
  }

  if (status === 'error') {
    throw new Error('Transcription failed: ' + (result.error || 'Unknown error'));
  }

  return result.text;
};

module.exports = { transcribe };
