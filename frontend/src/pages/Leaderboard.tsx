import { useMemo } from "react";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Card } from "@/components/ui/card";

export default function Leaderboard() {
  const { queries, isLoading } = useLeaderboard();
  const { topQuery, meQuery } = queries;

  const topList = useMemo(
    () => (Array.isArray(topQuery.data) ? topQuery.data : []),
    [topQuery.data]
  );

  return (
    <div className="container py-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          See how you rank against other InterviewAI users.
        </p>
      </div>

      {isLoading ? (
        <Card className="opacity-50 animate-pulse p-8">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </Card>
      ) : (
        <LeaderboardTable users={topList} />
      )}
    </div>
  );
}
