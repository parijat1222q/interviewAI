import api from "./api";

export interface InterviewQuestion {
  id?: string;
  question: string;
  category?: string;
  difficulty?: string;
}

export interface InterviewAnswerPayload {
  answer: string;
  questionId?: string;
  metadata?: Record<string, unknown>;
}

export interface InterviewSession {
  id?: string;
  role?: string;
  mode?: string;
  score?: number;
  date?: string;
}

/**
 * Fetch next interview question
 * POST /api/interview/question
 */
export async function fetchNextQuestion(payload: {
  interviewType?: string;
  industry?: string;
} = {}): Promise<InterviewQuestion> {
  try {
    const { data } = await api.post<InterviewQuestion>(
      "/interview/question",
      payload
    );
    return data;
  } catch (error) {
    console.error("Failed to fetch question:", error);
    // Fallback question
    return {
      question:
        "Tell me about a recent project you worked on and the challenges you faced.",
      category: "Behavioral",
      difficulty: "medium",
    };
  }
}

/**
 * Submit answer to current question
 * POST /api/interview/answer
 */
export async function submitAnswer(
  payload: InterviewAnswerPayload
): Promise<any> {
  try {
    const { data } = await api.post("/interview/answer", payload);
    return data;
  } catch (error) {
    console.error("Failed to submit answer:", error);
    return { feedback: { accuracy: 0, clarity: 0 }, nextQuestion: null };
  }
}

/**
 * Fetch user's interview history
 * GET /api/interview/history
 */
export async function fetchInterviewHistory(): Promise<InterviewSession[]> {
  try {
    const { data } = await api.get("/interview/history");
    return Array.isArray(data.sessions) ? data.sessions : [];
  } catch (error) {
    console.error("Failed to fetch interview history:", error);
    return [];
  }
}

/**
 * End current interview session
 * POST /api/interview/end
 */
export async function endInterviewSession(payload?: {
  sessionId?: string;
}): Promise<any> {
  try {
    const { data } = await api.post("/interview/end", payload ?? {});
    return data;
  } catch (error) {
    console.error("Failed to end interview session:", error);
    return { message: "Session ended", sessionId: null };
  }
}


