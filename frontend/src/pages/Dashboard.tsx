import { useAnalytics } from "@/hooks/useAnalytics";
import { PerformanceChart } from "@/components/analytics/PerformanceChart";
import { SkillHeatmap } from "@/components/analytics/SkillHeatmap";
import { TrendGraph } from "@/components/analytics/TrendGraph";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function Dashboard() {
  const { dashboard: analytics, trends, skillGaps, insights, isLoading } = useAnalytics();

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Your Analytics</h1>
        <p className="mt-2 text-muted-foreground">
          Track your interview progress and identify improvement areas
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Interviews</p>
              <p className="text-3xl font-bold text-primary">
                {analytics?.totalInterviews || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-3xl font-bold text-chart-2">
                {analytics?.averageScore || 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Best Score</p>
              <p className="text-3xl font-bold text-chart-1">
                {analytics?.bestScore || 0}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Current Streak</p>
              <p className="text-3xl font-bold text-chart-3">
                {analytics?.currentStreak || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <PerformanceChart data={trends} isLoading={isLoading} />
        <TrendGraph data={analytics?.skillBreakdown || []} />
      </div>

      {/* Skill Gaps & Insights */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <SkillHeatmap skillGaps={skillGaps} />

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights?.recommendations?.map(
              (rec: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-primary/10 rounded-lg text-sm"
                >
                  {rec}
                </div>
              )
            ) || (
                <p className="text-muted-foreground text-sm">
                  Complete more interviews to get personalized recommendations
                </p>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Badges Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {myBadges.length > 0 ? (
              myBadges.map((badge: any, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col items-center gap-2 p-4 bg-secondary/30 rounded-lg"
                >
                  <div className="text-4xl">
                    {badge.badgeDefinition?.icon || "⭐"}
                  </div>
                  <p className="text-xs font-medium text-center">
                    {badge.name}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                Complete interviews to earn badges
              </p>
            )}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
