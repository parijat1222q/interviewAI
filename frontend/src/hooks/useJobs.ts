import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getJobTracker,
  addJobApplication,
  updateApplicationStatus,
  deleteJobApplication,
} from "@/api/jobs.api";
import { toast } from "sonner";

export function useJobs() {
  const queryClient = useQueryClient();

  // Query: fetch job tracker
  const jobTrackerQuery = useQuery({
    queryKey: ["jobTracker"],
    queryFn: getJobTracker,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  // Mutation: add job application
  const addJobMutation = useMutation({
    mutationFn: (payload: any) => addJobApplication(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobTracker"] });
      toast.success("Job application added!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add job";
      toast.error(message);
    },
  });

  // Mutation: update application status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateApplicationStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobTracker"] });
      toast.success("Status updated!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update status";
      toast.error(message);
    },
  });

  // Mutation: delete job application
  const deleteJobMutation = useMutation({
    mutationFn: (id: string) => deleteJobApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobTracker"] });
      toast.success("Job application deleted!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete job";
      toast.error(message);
    },
  });

  return {
    queries: { jobTrackerQuery },
    mutations: { addJobMutation, updateStatusMutation, deleteJobMutation },
    isLoading: jobTrackerQuery.isLoading,
    isError: jobTrackerQuery.isError,
  };
}