import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ResourceCard } from "@/components/learning/ResourceCard";
import { Search, Sparkles, BookOpen } from "lucide-react";
import {
  getDailyChallenge,
  getLearningHub,
  completeTopicLearning,
  updateRecommendations,
} from "@/api/learning.api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const categories = [
  "All",
  "Interview Prep",
  "Technical Skills",
  "Soft Skills",
  "Resume Building",
  "Negotiation",
];

export default function Learning() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const queryClient = useQueryClient();

  const hubQuery = useQuery({
    queryKey: ["learningHub"],
    queryFn: getLearningHub,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const dailyQuery = useQuery({
    queryKey: ["dailyChallenge"],
    queryFn: getDailyChallenge,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeTopicLearning(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningHub"] });
      toast.success("Topic marked complete!");
    },
  });

  const updateRecsMutation = useMutation({
    mutationFn: (payload: any) => updateRecommendations(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learningHub"] });
      toast.success("Recommendations updated!");
    },
  });

  const resources = hubQuery.data?.resources ?? [];
  const recommendations = hubQuery.data?.recommendations ?? [];

  const filteredResources = resources.filter((resource: any) => {
    const matchesSearch =
      (resource.title ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (resource.description ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Learning Hub</h1>
        <p className="mt-2 text-muted-foreground">
          Curated resources to help you ace your interviews and advance your
          career
        </p>
      </div>

      {/* AI Recommendations */}
      <Card className="mb-8 bg-gradient-to-r from-primary/5 via-transparent to-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {(recommendations || []).map((rec: any) => (
              <div key={rec.title} className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {rec.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(rec.items || []).map((item: string) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() =>
              updateRecsMutation.mutate({ skillGaps: [] })
            }
            disabled={updateRecsMutation.isPending}
          >
            {updateRecsMutation.isPending ? "Updating..." : "Refresh"}
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4">
          {categories.map((category) => (
            <Button
              key={category}
              variant={
                selectedCategory === category ? "default" : "outline"
              }
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div>
        {hubQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Card key={idx} className="p-6 opacity-50 animate-pulse" />
            ))}
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredResources.map((resource: any, index: number) => (
              <ResourceCard
                key={index}
                {...resource}
                onComplete={() =>
                  completeMutation.mutate(resource.id)
                }
              />
            ))}
          </div>
        ) : (
          <Card className="py-16">
            <CardContent className="text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                No resources found
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Try a different search or refresh recommendations
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
