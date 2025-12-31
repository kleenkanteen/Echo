// Simple ElevenLabs TTS function for browser use
export async function speakTextWithElevenLabs(text: string, apiKey: string, voiceId = 'JBFqnCBsd6RMkjVDRZzb') {
  if (!apiKey) {
    console.warn('ElevenLabs API key not provided - using browser speech synthesis fallback');
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_flash_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.5,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.volume = 0.8;
    await audio.play();
    return audio;

  } catch (error) {
    console.error('ElevenLabs generation error:', error);
  }
}