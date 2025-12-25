import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ATSScoreCardProps {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  className?: string;
}

export function ATSScoreCard({
  score,
  matchedKeywords,
  missingKeywords,
  suggestions,
  className,
}: ATSScoreCardProps) {
  const getScoreColor = () => {
    if (score >= 80) return "text-chart-2";
    if (score >= 60) return "text-chart-1";
    return "text-destructive";
  };

  const getProgressColor = () => {
    if (score >= 80) return "bg-chart-2";
    if (score >= 60) return "bg-chart-1";
    return "bg-destructive";
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">ATS Compatibility Score</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={cn("text-5xl font-bold", getScoreColor())}>
              {score}%
            </span>
            <div className="text-right text-sm text-muted-foreground">
              {score >= 80 && "Excellent match!"}
              {score >= 60 && score < 80 && "Good, but can improve"}
              {score < 60 && "Needs improvement"}
            </div>
          </div>
          <Progress value={score} className={cn("h-3", getProgressColor())} />
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-chart-2" />
              Matched Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {matchedKeywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="outline"
                  className="bg-chart-2/10 text-chart-2 border-chart-2/30"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Missing Keywords
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="outline"
                  className="bg-destructive/10 text-destructive border-destructive/30"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-chart-1" />
            Improvement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-chart-1 flex-shrink-0" />
                {suggestion}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
