import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target } from "lucide-react";
import { toast } from "sonner";
import { getHealth, getMe } from "@/api/user.api";
import { getSentimentTrends } from "@/api/sentiment.api";
import { useQuery } from "@tanstack/react-query";

export default function Profile() {
  const { data: healthData, isLoading: isHealthLoading } = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    staleTime: 1000 * 60 * 5,
  });

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });

  const { data: trends } = useQuery({
    queryKey: ["sentimentTrends"],
    queryFn: getSentimentTrends,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!meData?.user) {
      // no-op
    }
  }, [meData]);

  if (isHealthLoading) {
    return <div className="container py-8">Loading profile…</div>;
  }

  const user = meData?.user ?? {
    name: "User",
    email: "user@example.com",
    location: "",
    role: "",
    bio: "",
  };

  const skills = trends?.skills ?? [
    { name: "Communication", level: 0 },
    { name: "Technical Knowledge", level: 0 },
  ];

  return (
    <div className="container py-8 max-w-4xl">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback>{user.name?.charAt(0) ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
            <div className="w-full space-y-2">
              <Button className="w-full" variant="outline">
                Update Avatar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Input
                placeholder="Location"
                defaultValue={user.location ?? ""}
              />
              <Input
                placeholder="Role"
                defaultValue={user.role ?? ""}
              />
              <Textarea
                placeholder="Bio"
                defaultValue={user.bio ?? ""}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost">Cancel</Button>
                <Button>Save</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                label: "Total Interviews",
                value: healthData?.totalInterviews ?? "—",
              },
              {
                label: "Average Score",
                value: healthData?.avgScore ? `${healthData.avgScore}%` : "—",
              },
              {
                label: "Current Streak",
                value: healthData?.streak ?? "—",
              },
              {
                label: "Leaderboard Rank",
                value: healthData?.rank ? `#${healthData.rank}` : "—",
              },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="text-sm">{stat.label}</div>
                <div className="font-medium">{stat.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.map((skill: any) => (
              <div key={skill.name}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">
                    {skill.name}
                  </span>
                  <span className="text-muted-foreground">
                    {skill.level}%
                  </span>
                </div>
                <Progress value={skill.level} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
