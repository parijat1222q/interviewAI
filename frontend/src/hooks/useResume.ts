import { useMutation } from "@tanstack/react-query";
import { analyzeResumeFromText } from "@/api/resume.api";
import { toast } from "sonner";

export function useResume() {
  const analyzeMutation = useMutation({
    mutationFn: (payload: { resumeText: string; jobDesc: string }) =>
      analyzeResumeFromText(payload),
    onError: (error: any) => {
      const message = error?.message || "Failed to analyze resume";
      toast.error(message);
    },
  });

  return {
    mutations: { analyzeMutation },
    isAnalyzing: analyzeMutation.isPending,
  };
} 