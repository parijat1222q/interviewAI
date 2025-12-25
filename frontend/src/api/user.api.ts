import api from "./api";

/**
 * Get API health status
 * GET /api/auth/health
 */
export async function getHealth() {
  try {
    const { data } = await api.get("/health");
    return data;
  } catch (error) {
    console.error("Failed to get health status:", error);
    return {
      status: "offline",
      totalInterviews: 0,
      avgScore: 0,
      streak: 0,
      rank: null,
    };
  }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
export async function getMe() {
  try {
    const { data } = await api.get("/auth/me", {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return { user: null };
  }
}

/**
 * Get user profile by ID (optional)
 * GET /api/user/profile or /api/user/:userId
 */
export async function getProfile(userId?: string) {
  try {
    const endpoint = userId
      ? `/user/${encodeURIComponent(userId)}`
      : `/user/profile`;
    const { data } = await api.get(endpoint);
    return data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return { profile: null };
  }
}


/**
 * Update user profile
 * PUT /api/auth/me
 */
export async function updateProfile(payload: {
  name?: string;
  location?: string;
  role?: string;
  bio?: string;
}) {
  try {
    const { data } = await api.put("/auth/me", payload);
    return data;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
}



