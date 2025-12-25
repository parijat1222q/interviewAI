import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  className?: string;
}

const difficultyColors = {
  easy: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  medium: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  hard: "bg-destructive/20 text-destructive border-destructive/30",
};

export function QuestionCard({
  questionNumber,
  totalQuestions,
  category,
  difficulty,
  question,
  className,
}: QuestionCardProps) {
  return (
    <Card className={cn("border-2 border-primary/20 animate-scale-in", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in-left animate-delay-200">
            <span className="text-sm font-medium text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </span>
            <Badge variant="outline" className="font-normal transition-transform hover:scale-105">
              {category}
            </Badge>
          </div>
          <Badge className={cn("border animate-fade-in-right animate-delay-200 transition-all hover:scale-105", difficultyColors[difficulty])}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-medium text-foreground leading-relaxed animate-fade-in-up animate-delay-300">
          {question}
        </p>
      </CardContent>
    </Card>
  );
}
