import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, FileText, ExternalLink, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

type ResourceType = "article" | "video" | "course";

interface ResourceCardProps {
  title: string;
  description: string;
  type: ResourceType;
  category: string;
  duration?: string;
  rating?: number;
  url: string;
  className?: string;
}

const typeConfig = {
  article: { icon: FileText, color: "bg-chart-3/10 text-chart-3" },
  video: { icon: Video, color: "bg-chart-1/10 text-chart-1" },
  course: { icon: BookOpen, color: "bg-chart-2/10 text-chart-2" },
};

export function ResourceCard({
  title,
  description,
  type,
  category,
  duration,
  rating,
  url,
  className,
}: ResourceCardProps) {
  const TypeIcon = typeConfig[type].icon;

  return (
    <Card className={cn("transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className={cn("p-2 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6", typeConfig[type].color)}>
            <TypeIcon className="h-5 w-5" />
          </div>
          <Badge variant="outline" className="text-xs transition-transform group-hover:scale-105">
            {category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {description}
          </p>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {duration}
              </div>
            )}
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-chart-4 text-chart-4 transition-transform group-hover:scale-125 group-hover:rotate-12" />
                {rating.toFixed(1)}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild className="transition-transform group-hover:translate-x-1">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" />
              View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
