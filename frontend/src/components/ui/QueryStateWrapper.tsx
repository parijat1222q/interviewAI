import React, { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, AlertTriangle } from "lucide-react";

interface QueryStateWrapperProps {
  isLoading: boolean;
  isError: boolean;
  isEmpty?: boolean;
  error?: Error | null;
  children: ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyComponent?: ReactNode;
}

/**
 * Reusable wrapper to handle loading, error, and empty states
 */
export function QueryStateWrapper({
  isLoading,
  isError,
  isEmpty,
  error,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
}: QueryStateWrapperProps) {
  if (isLoading && !children) {
    return (
      loadingComponent || (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )
    );
  }

  if (isError) {
    return (
      errorComponent || (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-foreground">Error loading data</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || "Please try again later"}
              </p>
            </div>
          </CardContent>
        </Card>
      )
    );
  }

  if (isEmpty) {
    return (
      emptyComponent || (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
      )
    );
  }

  return <>{children}</>;
}