import api from "./api";

export interface ResumeAnalysis {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  strengths?: string[];
}

export interface ResumeCheckResponse {
  analysis: ResumeAnalysis;
  timestamp?: string;
}

/**
 * Analyze resume from text input
 * POST /api/resume/check
 */
export async function analyzeResumeFromText(payload: {
  resumeText: string;
  jobDesc: string;
}): Promise<ResumeCheckResponse> {
  try {
    const { data } = await api.post<ResumeCheckResponse>("/resume/check", {
      resumeText: payload.resumeText,
      jobDescription: payload.jobDesc,
    });
    return data;
  } catch (error) {
    console.error("Failed to analyze resume:", error);
    // Fallback response
    return {
      analysis: {
        score: 0,
        matchedKeywords: [],
        missingKeywords: ["Unable to analyze. Please try again."],
        suggestions: [],
        strengths: [],
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Get resume analysis config (supported formats, limits)
 * GET /api/resume/config
 */
export async function getResumeConfig() {
  try {
    const { data } = await api.get("/resume/config");
    return data;
  } catch (error) {
    console.error("Failed to fetch resume config:", error);
    // Fallback config
    return {
      supportedTypes: ["application/pdf"],
      maxFileSize: 5 * 1024 * 1024,
      maxFiles: 1,
    };
  }
}

/**
 * Analyze resume from PDF file upload
 * POST /api/resume/upload (multipart/form-data)
 */
export async function analyzeResumeFromFile(
  file: File
): Promise<ResumeCheckResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<ResumeCheckResponse>(
      "/resume/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return data;
  } catch (error) {
    console.error("Failed to analyze resume file:", error);
    return {
      analysis: {
        score: 0,
        matchedKeywords: [],
        missingKeywords: ["File upload failed. Please try text analysis."],
        suggestions: [],
        strengths: [],
      },
      timestamp: new Date().toISOString(),
    };
  }
}


