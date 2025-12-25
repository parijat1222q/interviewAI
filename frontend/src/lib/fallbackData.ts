/**
 * Fallback data definitions for offline/error scenarios
 */

export const FALLBACK_INTERVIEW_HISTORY = [
  {
    id: "1",
    title: "Technical Interview",
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    score: 75,
    duration: 45,
  },
  {
    id: "2",
    title: "Behavioral Interview",
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    score: 82,
    duration: 50,
  },
];

export const FALLBACK_JOB_TRACKER = {
  tracker: {
    applications: [
      {
        applicationId: "1",
        companyName: "Tech Corp",
        jobTitle: "Senior Developer",
        status: "interviewing",
        appliedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        salary: "$120K - $150K",
      },
      {
        applicationId: "2",
        companyName: "Startup Inc",
        jobTitle: "Full Stack Engineer",
        status: "applied",
        appliedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  },
};

export const FALLBACK_LEADERBOARD = [
  {
    rank: 1,
    name: "Alice Johnson",
    totalScore: 950,
    interviews: 12,
    badges: ["Master", "100 Streak"],
  },
  {
    rank: 2,
    name: "Bob Smith",
    totalScore: 920,
    interviews: 10,
    badges: ["Expert"],
  },
  {
    rank: 3,
    name: "Carol Davis",
    totalScore: 890,
    interviews: 9,
    badges: [],
  },
];

export const FALLBACK_SKILLS = [
  { skill: "Communication", score: 75 },
  { skill: "Technical Knowledge", score: 82 },
  { skill: "Problem Solving", score: 78 },
  { skill: "Leadership", score: 70 },
];

export const FALLBACK_PERFORMANCE_DATA = [
  { week: "W1", score: 65 },
  { week: "W2", score: 72 },
  { week: "W3", score: 68 },
  { week: "W4", score: 78 },
  { week: "W5", score: 81 },
  { week: "W6", score: 85 },
];

export const FALLBACK_LEARNING_HUB = {
  resources: [
    {
      id: "1",
      title: "Mock Interview Basics",
      category: "Interview Prep",
      difficulty: "Beginner",
    },
    {
      id: "2",
      title: "System Design Patterns",
      category: "Technical Skills",
      difficulty: "Advanced",
    },
  ],
  recommendations: [
    { title: "Recommended for You", items: ["Communication Skills", "SQL Basics"] },
  ],
};

export const FALLBACK_USER_PROFILE = {
  user: {
    id: "1",
    name: "User",
    email: "user@example.com",
    role: "Software Engineer",
    location: "",
    bio: "",
  },
};

export const FALLBACK_HEALTH = {
  status: "offline",
  totalInterviews: 0,
  avgScore: 0,
  streak: 0,
  rank: null,
};