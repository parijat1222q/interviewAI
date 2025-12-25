import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { JobCard } from "@/components/jobs/JobCard";
import { useJobs } from "@/hooks/useJobs";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    company: "",
    position: "",
    location: "",
    salary: "",
    url: "",
  });

  const { queries, mutations } = useJobs();
  const { jobTrackerQuery } = queries;
  const { addJobMutation, updateStatusMutation, deleteJobMutation } = mutations;

  const applications =
    jobTrackerQuery.data?.tracker?.applications ||
    jobTrackerQuery.data?.applications ||
    [];

  const filtered = (applications || []).filter((app: any) => {
    const matchesSearch =
      (app.companyName ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (app.jobTitle ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddJob = () => {
    if (!newJob.company || !newJob.position) {
      toast.error("Please fill required fields");
      return;
    }
    addJobMutation.mutate(
      {
        companyName: newJob.company,
        jobTitle: newJob.position,
        location: newJob.location,
        salary: newJob.salary,
        jobUrl: newJob.url,
      },
      {
        onSuccess: () => {
          setNewJob({ company: "", position: "", location: "", salary: "", url: "" });
          setIsDialogOpen(false);
          toast.success("Job added!");
        },
      }
    );
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-1 mr-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jobs..."
            className="w-full"
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>

      <div className="grid gap-4">
        {jobTrackerQuery.isLoading ? (
          <Card className="py-12 text-center opacity-50 animate-pulse">
            Loading jobs...
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <h3 className="text-lg font-medium text-foreground">
                No Jobs Found
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first job application to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((app: any) => (
            <JobCard
              key={app.applicationId ?? app._id}
              application={app}
              onUpdate={(payload) =>
                updateStatusMutation.mutate({
                  id: payload.id,
                  status: payload.status,
                })
              }
              onDelete={() =>
                deleteJobMutation.mutate(app.applicationId ?? app._id)
              }
            />
          ))
        )}
      </div>

      {/* Add Job Dialog (inline) */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Company"
                value={newJob.company}
                onChange={(e) =>
                  setNewJob((s) => ({ ...s, company: e.target.value }))
                }
              />
              <Input
                placeholder="Position"
                value={newJob.position}
                onChange={(e) =>
                  setNewJob((s) => ({ ...s, position: e.target.value }))
                }
              />
              <Input
                placeholder="Location"
                value={newJob.location}
                onChange={(e) =>
                  setNewJob((s) => ({ ...s, location: e.target.value }))
                }
              />
              <Input
                placeholder="Salary"
                value={newJob.salary}
                onChange={(e) =>
                  setNewJob((s) => ({ ...s, salary: e.target.value }))
                }
              />
              <Input
                placeholder="URL"
                value={newJob.url}
                onChange={(e) => setNewJob((s) => ({ ...s, url: e.target.value }))}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddJob} disabled={addJobMutation.isPending}>
                  {addJobMutation.isPending ? "Adding..." : "Add"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
