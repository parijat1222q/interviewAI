import api from "./api";

export interface VoiceSession {
  sessionId: string;
  wsUrl: string;
  token: string;
  expiresIn: number;
}

export interface TranscriptionResponse {
  transcription: string;
  duration: number;
  userId?: string;
  confidence?: number;
}

export interface TTSResponse {
  audioUrl: string;
  duration: number;
  text: string;
}

/**
 * Start a voice interview session and get WebSocket token
 * POST /api/voice/start
 */
export async function startVoiceSession(): Promise<VoiceSession> {
  try {
    const { data } = await api.post<VoiceSession>("/voice/start", {});
    return data;
  } catch (error) {
    console.error("Failed to start voice session:", error);
    throw error;
  }
}

/**
 * Upload audio blob and get transcription
 * POST /api/voice/upload
 * Body: FormData with "audio" field
 */
export async function uploadAudio(
  formData: FormData
): Promise<TranscriptionResponse> {
  try {
    const { data } = await api.post<TranscriptionResponse>(
      "/voice/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data;
  } catch (error) {
    console.error("Failed to upload audio:", error);
    throw error;
  }
}

/**
 * Convert text to speech (AI recruiter voice)
 * POST /api/voice/tts
 * Body: { text: string }
 */
export async function generateTTS(text: string): Promise<TTSResponse> {
  try {
    const { data } = await api.post<TTSResponse>("/voice/tts", { text });
    return data;
  } catch (error) {
    console.error("Failed to generate TTS:", error);
    throw error;
  }
}

/**
 * Get WebSocket token for voice signaling
 * GET /api/voice/token
 */
export async function getVoiceToken(): Promise<{ token: string; expiresIn: number }> {
  try {
    const { data } = await api.get("/voice/token");
    return data;
  } catch (error) {
    console.error("Failed to get voice token:", error);
    throw error;
  }
}

/**
 * End voice session
 * POST /api/voice/end
 * Body: { sessionId: string }
 */
export async function endVoiceSession(sessionId: string): Promise<any> {
  try {
    const { data } = await api.post("/voice/end", { sessionId });
    return data;
  } catch (error) {
    console.error("Failed to end voice session:", error);
    return { message: "Session ended" };
  }
}

