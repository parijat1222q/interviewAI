import api from "./api";

export interface SelectOption {
  value: string;
  label: string;
}

const DEFAULT_INTERVIEW_TYPES: SelectOption[] = [
  { value: "behavioral", label: "Behavioral" },
  { value: "technical", label: "Technical" },
  { value: "system-design", label: "System Design" },
  { value: "case-study", label: "Case Study" },
];

const DEFAULT_INDUSTRIES: SelectOption[] = [
  { value: "tech", label: "Technology" },
  { value: "finance", label: "Finance" },
  { value: "consulting", label: "Consulting" },
  { value: "healthcare", label: "Healthcare" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
];

/**
 * Get available interview types
 * GET /api/meta/interview-types
 */
export async function getInterviewTypes(): Promise<SelectOption[]> {
  try {
    const { data } = await api.get("/meta/interview-types");
    return Array.isArray(data) ? data : DEFAULT_INTERVIEW_TYPES;
  } catch (error) {
    console.error("Failed to fetch interview types:", error);
    return DEFAULT_INTERVIEW_TYPES;
  }
}

/**
 * Get available industries
 * GET /api/meta/industries
 */
export async function getIndustries(): Promise<SelectOption[]> {
  try {
    const { data } = await api.get("/meta/industries");
    return Array.isArray(data) ? data : DEFAULT_INDUSTRIES;
  } catch (error) {
    console.error("Failed to fetch industries:", error);
    return DEFAULT_INDUSTRIES;
  }
}

/**
 * Get job roles/positions
 * GET /api/meta/roles
 */
export async function getRoles(): Promise<SelectOption[]> {
  try {
    const { data } = await api.get("/meta/roles");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    return [];
  }
}

/**
 * Get difficulty levels
 * GET /api/meta/difficulties
 */
export async function getDifficulties(): Promise<SelectOption[]> {
  try {
    const { data } = await api.get("/meta/difficulties");
    return Array.isArray(data)
      ? data
      : [
          { value: "easy", label: "Easy" },
          { value: "medium", label: "Medium" },
          { value: "hard", label: "Hard" },
        ];
  } catch (error) {
    console.error("Failed to fetch difficulties:", error);
    return [
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
    ];
  }
}
