import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNextQuestion,
  submitAnswer,
  fetchInterviewHistory,
  endInterviewSession,
} from "@/api/interview.api";
import { toast } from "sonner";

export function useInterviewSession() {
  const queryClient = useQueryClient();

  // Query: fetch interview history
  const historyQuery = useQuery({
    queryKey: ["interviewHistory"],
    queryFn: fetchInterviewHistory,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  // Mutation: fetch next question
  const nextQuestionMutation = useMutation({
    mutationFn: (payload: { interviewType?: string; industry?: string }) =>
      fetchNextQuestion(payload),
    onError: (error: any) => {
      const message = error?.message || "Failed to fetch question";
      toast.error(message);
    },
  });

  // Mutation: submit answer
  const submitAnswerMutation = useMutation({
    mutationFn: (payload: {
      answer: string;
      questionId?: string;
      metadata?: Record<string, unknown>;
    }) => submitAnswer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviewHistory"] });
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to submit answer";
      toast.error(message);
    },
  });

  // Mutation: end session
  const endSessionMutation = useMutation({
    mutationFn: (payload?: { sessionId?: string }) =>
      endInterviewSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviewHistory"] });
      toast.success("Interview ended!");
    },
    onError: (error: any) => {
      const message = error?.message || "Failed to end session";
      toast.error(message);
    },
  });

  return {
    queries: { historyQuery },
    mutations: {
      nextQuestionMutation,
      submitAnswerMutation,
      endSessionMutation,
    },
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
  };
}