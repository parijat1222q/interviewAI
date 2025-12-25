import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar?: string;
  totalScore: number;
  totalInterviews: number;
}

interface LeaderboardTableProps {
  users: LeaderboardUser[];
  currentUserId?: string;
  className?: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-chart-4 animate-bounce" />;
    case 2:
      return <Medal className="h-5 w-5 text-muted-foreground" />;
    case 3:
      return <Award className="h-5 w-5 text-chart-1" />;
    default:
      return <span className="text-sm font-medium text-muted-foreground">{rank}</span>;
  }
};

const getRankBackground = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-chart-4/10";
    case 2:
      return "bg-muted/30";
    case 3:
      return "bg-chart-1/10";
    default:
      return "";
  }
};

export function LeaderboardTable({ users, currentUserId, className }: LeaderboardTableProps) {
  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Interviews</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow
              key={user.rank}
              className={cn(
                getRankBackground(user.rank),
                "transition-all duration-300 hover:bg-muted/20 opacity-0 animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell>
                <div className="flex items-center justify-center w-8 h-8 transition-transform hover:scale-125">
                  {getRankIcon(user.rank)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 transition-transform hover:scale-110">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold text-primary">
                {user.totalScore.toLocaleString()}
              </TableCell>
              <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                {user.totalInterviews}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
