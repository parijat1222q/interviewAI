import api from "./api";

export interface JobApplicationPayload {
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  location?: string;
  salary?: string;
  notes?: string;
  status?: string;
}

export interface InterviewRoundPayload {
  type?: string;
  scheduledDate?: string;
  feedback?: string;
  result?: "pass" | "fail" | "pending";
}

/**
 * Get full job tracker for current user
 * GET /api/job-tracker
 */
export const getJobTracker = async () => {
  try {
    const res = await api.get("/job-tracker");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch job tracker:", error);
    throw error;
  }
};

/**
 * Add a new job application
 * POST /api/job-tracker/add-application
 */
export const addJobApplication = async (payload: JobApplicationPayload) => {
  try {
    const res = await api.post("/job-tracker/add-application", {
      companyName: payload.companyName,
      jobTitle: payload.jobTitle,
      jobUrl: payload.jobUrl || "",
      location: payload.location || "",
      salary: payload.salary || "",
      notes: payload.notes || "",
      status: payload.status || "applied",
    });
    return res.data;
  } catch (error) {
    console.error("Failed to add job application:", error);
    throw error;
  }
};

/**
 * Update an application's status
 * PATCH /api/job-tracker/update-status/:applicationId
 */
export const updateApplicationStatus = async (
  applicationId: string,
  payload: { status: string; notes?: string }
) => {
  try {
    const res = await api.patch(
      `/job-tracker/update-status/${encodeURIComponent(applicationId)}`,
      {
        status: payload.status,
        notes: payload.notes || "",
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to update application status:", error);
    throw error;
  }
};

/**
 * Add an interview round to an application
 * POST /api/job-tracker/add-interview/:applicationId
 */
export const addInterviewRound = async (
  applicationId: string,
  payload: InterviewRoundPayload
) => {
  try {
    const res = await api.post(
      `/job-tracker/add-interview/${encodeURIComponent(applicationId)}`,
      {
        type: payload.type || "technical",
        scheduledDate: payload.scheduledDate || new Date(),
        feedback: payload.feedback || "",
        result: payload.result || "pending",
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to add interview round:", error);
    throw error;
  }
};

/**
 * Get applications filtered by status
 * GET /api/job-tracker/by-status/:status
 */
export const getApplicationsByStatus = async (status: string) => {
  try {
    const res = await api.get(
      `/job-tracker/by-status/${encodeURIComponent(status)}`
    );
    return res.data;
  } catch (error) {
    console.error("Failed to fetch applications by status:", error);
    throw error;
  }
};

/**
 * Get aggregated job statistics
 * GET /api/job-tracker/stats
 */
export const getJobStats = async () => {
  try {
    const res = await api.get("/job-tracker/stats");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch job stats:", error);
    throw error;
  }
};

/**
 * Delete a job application
 * DELETE /api/job-tracker/:applicationId
 */
export const deleteJobApplication = async (applicationId: string) => {
  try {
    const res = await api.delete(
      `/job-tracker/${encodeURIComponent(applicationId)}`
    );
    return res.data;
  } catch (error) {
    console.error("Failed to delete job application:", error);
    throw error;
  }
};


