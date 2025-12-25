import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, MapPin, Calendar, ExternalLink, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type JobStatus = "applied" | "interviewing" | "offered" | "rejected" | "saved";

interface JobCardProps {
  id: string;
  company: string;
  position: string;
  location: string;
  appliedDate: string;
  status: JobStatus;
  salary?: string;
  url?: string;
  onStatusChange: (id: string, status: JobStatus) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const statusConfig = {
  applied: { label: "Applied", color: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
  interviewing: { label: "Interviewing", color: "bg-chart-1/20 text-chart-1 border-chart-1/30" },
  offered: { label: "Offered", color: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  rejected: { label: "Rejected", color: "bg-destructive/20 text-destructive border-destructive/30" },
  saved: { label: "Saved", color: "bg-muted text-muted-foreground border-muted" },
};

export function JobCard({
  id,
  company,
  position,
  location,
  appliedDate,
  status,
  salary,
  url,
  onStatusChange,
  onDelete,
  className,
}: JobCardProps) {
  return (
    <Card className={cn("transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">{position}</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span className="text-sm">{company}</span>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("border transition-all duration-300 group-hover:scale-105", statusConfig[status].color)}
          >
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {location}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {appliedDate}
          </div>
          {salary && (
            <span className="font-medium text-foreground">{salary}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <Select
            value={status}
            onValueChange={(value) => onStatusChange(id, value as JobStatus)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="saved">Saved</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="offered">Offered</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            {url && (
              <Button variant="ghost" size="icon" asChild className="transition-transform hover:scale-110">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive transition-transform hover:scale-110 hover:rotate-12"
              onClick={() => onDelete(id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
