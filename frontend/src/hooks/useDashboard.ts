import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchInterviewHistory } from "@/api/interview.api";
import { getJobTracker } from "@/api/jobs.api";
import { getMyLeaderboardPosition } from "@/api/leaderboard.api";
import { getSentimentTrends } from "@/api/sentiment.api";

// Fallback data
const FALLBACK_PERFORMANCE = [
  { week: "W1", score: 65 },
  { week: "W2", score: 72 },
  { week: "W3", score: 68 },
  { week: "W4", score: 78 },
  { week: "W5", score: 81 },
  { week: "W6", score: 85 },
];

const FALLBACK_SKILLS = [
  { skill: "Communication", score: 75 },
  { skill: "Technical", score: 72 },
  { skill: "Problem Solving", score: 78 },
];

export function useDashboard() {
  // Fetch all dashboard data with proper error handling
  const interviewHistoryQuery = useQuery({
    queryKey: ["interviewHistory"],
    queryFn: fetchInterviewHistory,
    staleTime: 1000 * 60 * 2,
    retry: 2,
    throwOnError: false, // Don't throw on error, handle gracefully
  });

  const jobTrackerQuery = useQuery({
    queryKey: ["jobTracker"],
    queryFn: getJobTracker,
    staleTime: 1000 * 60 * 2,
    retry: 2,
    throwOnError: false,
  });

  const leaderboardPosQuery = useQuery({
    queryKey: ["leaderboardPosition"],
    queryFn: getMyLeaderboardPosition,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    throwOnError: false,
  });

  const sentimentTrendsQuery = useQuery({
    queryKey: ["sentimentTrends"],
    queryFn: getSentimentTrends,
    staleTime: 1000 * 60 * 2,
    retry: 2,
    throwOnError: false,
  });

  // Derived state: performance data
  const performanceData = useMemo(() => {
    if (
      interviewHistoryQuery.isLoading ||
      !interviewHistoryQuery.data ||
      interviewHistoryQuery.data.length === 0
    ) {
      return FALLBACK_PERFORMANCE;
    }

    const history = interviewHistoryQuery.data as any[];
    return history
      .slice(-6)
      .map((h, idx) => ({
        week: `W${idx + 1}`,
        score: h.score ?? 0,
      }));
  }, [interviewHistoryQuery.data, interviewHistoryQuery.isLoading]);

  // Derived state: upcoming interviews
  const upcomingInterviews = useMemo(() => {
    if (jobTrackerQuery.isLoading || !jobTrackerQuery.data) {
      return [];
    }

    const jobs = jobTrackerQuery.data;
    const applications =
      jobs?.tracker?.applications ||
      jobs?.applications ||
      [];

    return (applications || [])
      .filter((a: any) => a.nextInterviewDate)
      .map((a: any) => ({
        company: a.companyName ?? a.company ?? "Unknown",
        role: a.jobTitle ?? a.position ?? "Unknown",
        date: a.nextInterviewDate,
        time: a.nextInterviewTime,
      }))
      .slice(0, 3);
  }, [jobTrackerQuery.data, jobTrackerQuery.isLoading]);

  // Loading state - only true if we have NO data at all
  const isLoading =
    (interviewHistoryQuery.isLoading && !interviewHistoryQuery.data) ||
    (jobTrackerQuery.isLoading && !jobTrackerQuery.data) ||
    (leaderboardPosQuery.isLoading && !leaderboardPosQuery.data);

  // Error state - only show if critical queries fail
  const hasError =
    (interviewHistoryQuery.isError && !interviewHistoryQuery.data) ||
    (jobTrackerQuery.isError && !jobTrackerQuery.data);

  return {
    queries: {
      interviewHistoryQuery,
      jobTrackerQuery,
      leaderboardPosQuery,
      sentimentTrendsQuery,
    },
    derived: {
      performanceData,
      upcomingInterviews,
    },
    loading: isLoading,
    error: hasError,
  };
}