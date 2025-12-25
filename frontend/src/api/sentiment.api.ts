import api from "./api";

export interface SentimentTrends {
  skills?: Array<{ name: string; level: number }>;
  communicationMetrics?: Record<string, unknown>;
  sentimentScores?: Record<string, unknown>;
}

/**
 * Get user's sentiment and communication trends
 * GET /api/sentiment/trends
 */
export async function getSentimentTrends(): Promise<SentimentTrends> {
  try {
    const { data } = await api.get("/sentiment/trends");
    return data;
  } catch (error) {
    console.error("Failed to fetch sentiment trends:", error);
    // Fallback data
    return {
      skills: [
        { name: "Communication", level: 0 },
        { name: "Technical Knowledge", level: 0 },
        { name: "Problem Solving", level: 0 },
      ],
      communicationMetrics: {},
      sentimentScores: {},
    };
  }
}

/**
 * Get latest sentiment analysis
 * GET /api/sentiment/latest
 */
export async function getLatestSentiment(): Promise<any> {
  try {
    const { data } = await api.get("/sentiment/latest");
    return data;
  } catch (error) {
    console.error("Failed to fetch latest sentiment:", error);
    return { sentiment: "neutral", confidence: 0 };
  }
}

export async function analyzeAnswer(payload: { answer: string }) {
  const { data } = await api.post("/sentiment/analyze", payload);
  return data;
}

export async function getSentimentHistory() {
  const { data } = await api.get("/sentiment/history");
  return data;
}


