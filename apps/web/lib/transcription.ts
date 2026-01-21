/**
 * Transcribes audio buffer using Groq's Whisper API
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string = "audio.ogg",
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const formData = new FormData();
  // Create a Blob from the buffer
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = new Blob([audioBuffer as any]);
  formData.append("file", blob, filename);
  formData.append("model", "whisper-large-v3-turbo");
  formData.append("response_format", "json");

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Transcription] Groq API Error: ${response.status}`,
        errorText,
      );
      throw new Error(`Groq API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.text || "";
  } catch (error) {
    console.error("[Transcription] Failed to transcribe audio:", error);
    throw error;
  }
}
