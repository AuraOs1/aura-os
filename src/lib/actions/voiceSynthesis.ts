"use server";

import fs from "fs";
import path from "path";

export interface VoiceSynthesisResult {
  success: boolean;
  audioUrl?: string;
  transcript: string;
  provider: "ELEVENLABS" | "WEB_SPEECH_SYNTHESIS";
  error?: string;
}

export async function synthesizeAuraVoice(
  text: string,
  voiceId = "21m00Tcm4TlvDq8ikWAM" // ElevenLabs default voice "Rachel"
): Promise<VoiceSynthesisResult> {
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

  if (elevenLabsApiKey) {
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": elevenLabsApiKey,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_monolingual_v1",
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.85,
            },
          }),
        }
      );

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        const dateStr = new Date().toISOString().split("T")[0];
        const folderPath = path.join(process.cwd(), "public", "media", "audio", dateStr);

        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        const fileName = `aura_speech_${Date.now()}.mp3`;
        const filePath = path.join(folderPath, fileName);
        fs.writeFileSync(filePath, Buffer.from(audioBuffer));

        return {
          success: true,
          audioUrl: `/media/audio/${dateStr}/${fileName}`,
          transcript: text,
          provider: "ELEVENLABS",
        };
      }
    } catch (e) {
      console.warn("ElevenLabs TTS fallback active:", e);
    }
  }

  // Native Web Speech Fallback Notice
  return {
    success: true,
    transcript: text,
    provider: "WEB_SPEECH_SYNTHESIS",
  };
}
