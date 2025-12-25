import api from "./api";

export interface LearningResource {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  url?: string;
  type?: string;
}

export interface LearningHub {
  resources: LearningResource[];
  recommendations?: Array<{ title: string; items: string[] }>;
}

export interface DailyChallenge {
  id?: string;
  question: string;
  category?: string;
}

export interface RecommendationPayload {
  skillGaps?: string[];
  preferences?: string[];
  [key: string]: unknown;
}

/**
 * Get learning hub with resources and recommendations
 * GET /api/learning-hub
 */
export async function getLearningHub(): Promise<LearningHub> {
  try {
    const { data } = await api.get("/learning-hub");
    return {
      resources: Array.isArray(data.resources) ? data.resources : [],
      recommendations: Array.isArray(data.recommendations)
        ? data.recommendations
        : [],
    };
  } catch (error) {
    console.error("Failed to fetch learning hub:", error);
    return {
      resources: [],
      recommendations: [
        { title: "Recommended Topics", items: ["Coming soon..."] },
      ],
    };
  }
}

/**
 * Mark a topic as completed
 * POST /api/learning-hub/complete-topic
 */
export async function completeTopicLearning(topicId: string): Promise<any> {
  try {
    const { data } = await api.post("/learning-hub/complete-topic", {
      topicId,
    });
    return data;
  } catch (error) {
    console.error("Failed to complete topic:", error);
    return { success: false };
  }
}

/**
 * Get daily challenge
 * GET /api/learning-hub/daily-challenge
 */
export async function getDailyChallenge(): Promise<DailyChallenge> {
  try {
    const { data } = await api.get("/learning-hub/daily-challenge");
    return data;
  } catch (error) {
    console.error("Failed to fetch daily challenge:", error);
    return {
      question: "Challenge unavailable. Try again later.",
      category: "General",
    };
  }
}

/**
 * Update learning recommendations
 * POST /api/learning-hub/update-recommendations
 */
export async function updateRecommendations(
  payload: RecommendationPayload
): Promise<any> {
  try {
    const { data } = await api.post(
      "/learning-hub/update-recommendations",
      payload
    );
    return data;
  } catch (error) {
    console.error("Failed to update recommendations:", error);
    return { success: false };
  }
}


