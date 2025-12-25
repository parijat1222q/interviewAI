import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Fetch dashboard analytics
 */
async function fetchDashboardAnalytics() {
  const { data } = await axios.get(`${API_BASE}/api/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return data.analytics;
}

/**
 * Fetch performance trends
 */
async function fetchPerformanceTrends(days: number = 30) {
  const { data } = await axios.get(
    `${API_BASE}/api/analytics/trends?days=${days}`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return data.trends;
}

/**
 * Fetch skill gaps
 */
async function fetchSkillGaps() {
  const { data } = await axios.get(`${API_BASE}/api/analytics/skill-gaps`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return data.skillGaps;
}

/**
 * Fetch insights
 */
async function fetchInsights() {
  const { data } = await axios.get(`${API_BASE}/api/analytics/insights`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
  return data.insights;
}

/**
 * Fetch performance comparison
 */
async function fetchPerformanceComparison() {
  const { data } = await axios.get(
    `${API_BASE}/api/analytics/comparison`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
  return data.comparison;
}

export function useAnalytics() {
  const dashboardQuery = useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: fetchDashboardAnalytics,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const trendsQuery = useQuery({
    queryKey: ["analytics", "trends"],
    queryFn: () => fetchPerformanceTrends(30),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const skillGapsQuery = useQuery({
    queryKey: ["analytics", "skillGaps"],
    queryFn: fetchSkillGaps,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const insightsQuery = useQuery({
    queryKey: ["analytics", "insights"],
    queryFn: fetchInsights,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });

  const comparisonQuery = useQuery({
    queryKey: ["analytics", "comparison"],
    queryFn: fetchPerformanceComparison,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    dashboard: dashboardQuery.data,
    trends: trendsQuery.data || [],
    skillGaps: skillGapsQuery.data || [],
    insights: insightsQuery.data || {},
    comparison: comparisonQuery.data || {},
    isLoading:
      dashboardQuery.isLoading ||
      trendsQuery.isLoading ||
      skillGapsQuery.isLoading,
    isError:
      dashboardQuery.isError ||
      trendsQuery.isError ||
      skillGapsQuery.isError,
  };
}