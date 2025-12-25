import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface InterviewTimerProps {
  duration: number; // in seconds
  onTimeUp?: () => void;
  isRunning?: boolean;
  className?: string;
}

export function InterviewTimer({ duration, onTimeUp, isRunning = true, className }: InterviewTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft <= 60;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg",
        isLowTime ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
        className
      )}
    >
      <Clock className={cn("h-5 w-5", isLowTime && "animate-pulse")} />
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
