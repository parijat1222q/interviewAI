import { useQuery } from "@tanstack/react-query";
import {
  getTopLeaderboard,
  getMyLeaderboardPosition,
} from "@/api/leaderboard.api";

export function useLeaderboard() {
  const topQuery = useQuery({
    queryKey: ["leaderboard", "top"],
    queryFn: () => getTopLeaderboard(50),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const meQuery = useQuery({
    queryKey: ["leaderboard", "me"],
    queryFn: getMyLeaderboardPosition,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const isLoading = topQuery.isLoading || meQuery.isLoading;
  const isError = topQuery.isError || meQuery.isError;

  return {
    queries: { topQuery, meQuery },
    isLoading,
    isError,
    data: {
      topList: topQuery.data || [],
      userPosition: meQuery.data || null,
    },
  };
}