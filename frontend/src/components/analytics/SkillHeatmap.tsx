import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SkillGap {
  skill: string;
  frequency: number;
  priority: "high" | "medium" | "low";
}

interface SkillHeatmapProps {
  skillGaps: SkillGap[];
  className?: string;
}

export function SkillHeatmap({ skillGaps, className }: SkillHeatmapProps) {
  const getColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/80 text-white";
      case "medium":
        return "bg-chart-1/60 text-foreground";
      case "low":
        return "bg-chart-2/40 text-foreground";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Skill Gaps (Top 10)</CardTitle>
      </CardHeader>
      <CardContent>
        {skillGaps && skillGaps.length > 0 ? (
          <div className="grid gap-3">
            {skillGaps.map((gap, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
              >
                <span className="text-sm font-medium">{gap.skill}</span>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn("capitalize", getColor(gap.priority))}
                  >
                    {gap.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {gap.frequency}x mentioned
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No skill gaps detected
          </div>
        )}
      </CardContent>
    </Card>
  );
}