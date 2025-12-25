import api from "./api";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  totalScore: number;
  averageAccuracy: number;
  averageClarity: number;
  averageConfidence: number;
  totalInterviews: number;
  badges?: string[];
}

export interface UserPosition {
  rank: number;
  totalScore: number;
  averageAccuracy: number;
  averageClarity: number;
  averageConfidence: number;
  totalInterviews: number;
  badges?: string[];
}

/**
 * Get top leaderboard entries
 * GET /api/leaderboard/top?limit=50
 */
export async function getTopLeaderboard(
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  try {
    const { data } = await api.get("/leaderboard/top", {
      params: { limit },
    });
    return Array.isArray(data.entries) ? data.entries : [];
  } catch (error) {
    console.error("Failed to fetch top leaderboard:", error);
    return [];
  }
}

/**
 * Get current user's leaderboard position
 * GET /api/leaderboard/my-position
 */
export async function getMyLeaderboardPosition(): Promise<UserPosition | null> {
  try {
    const { data } = await api.get("/leaderboard/my-position");
    return data.position || null;
  } catch (error) {
    console.error("Failed to fetch user position:", error);
    return null;
  }
}

/**
 * Get leaderboard filtered by role
 * GET /api/leaderboard/by-role/:role?limit=50
 */
export async function getLeaderboardByRole(
  role: string,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  try {
    const { data } = await api.get(
      `/leaderboard/by-role/${encodeURIComponent(role)}`,
      { params: { limit } }
    );
    return Array.isArray(data.entries) ? data.entries : [];
  } catch (error) {
    console.error("Failed to fetch leaderboard by role:", error);
    return [];
  }
}


