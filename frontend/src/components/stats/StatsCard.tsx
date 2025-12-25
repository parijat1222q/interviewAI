import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-foreground">{value}</p>
              {trend && (
                <span
                  className={cn(
                    "text-sm font-medium transition-transform",
                    trend.isPositive ? "text-primary" : "text-destructive"
                  )}
                >
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:rotate-3">
            <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full transition-transform duration-500 group-hover:scale-150" />
      </CardContent>
    </Card>
  );
}
