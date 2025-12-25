import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Mic,
  FileText,
  Briefcase,
  Trophy,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Target,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "AI Mock Interviews",
    description: "Practice with our AI interviewer that adapts to your responses and provides real-time feedback.",
  },
  {
    icon: FileText,
    title: "Resume ATS Analyzer",
    description: "Optimize your resume with our ATS compatibility checker and get keyword suggestions.",
  },
  {
    icon: Briefcase,
    title: "Job Tracker",
    description: "Keep track of all your applications, interviews, and follow-ups in one place.",
  },
  {
    icon: Trophy,
    title: "Leaderboard",
    description: "Compete with others and earn badges as you improve your interview skills.",
  },
  {
    icon: Target,
    title: "Performance Analytics",
    description: "Track your progress with detailed analytics on communication, confidence, and technical skills.",
  },
  {
    icon: BookOpen,
    title: "Learning Hub",
    description: "Access curated resources and personalized recommendations to boost your career.",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "1M+", label: "Interviews Completed" },
  { value: "89%", label: "Success Rate" },
  { value: "4.9", label: "User Rating" },
];

const testimonials = [
  {
    quote: "InterviewAI helped me land my dream job at a top tech company. The AI feedback was incredibly accurate.",
    name: "Pallav Jha",
    role: "Software Engineer at Google",
  },
  {
    quote: "The mock interviews felt so real! I went into my actual interview feeling confident and prepared.",
    name: "Shibam Saha",
    role: "Product Manager at Meta",
  },
  {
    quote: "The ATS analyzer helped me understand why my resume wasn't getting callbacks. Game changer!",
    name: "Aman Sarkar",
    role: "Data Scientist at Netflix",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/30" />
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float animate-delay-500" />
        
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary opacity-0 animate-fade-in-down">
              <Sparkles className="h-4 w-4 animate-pulse" />
              AI-Powered Interview Preparation
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl opacity-0 animate-fade-in-up animate-delay-100">
              Ace Your Next Interview with{" "}
              <span className="text-primary relative">
                AI Coaching
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" className="opacity-0 animate-fade-in animate-delay-500" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground opacity-0 animate-fade-in-up animate-delay-200">
              Practice unlimited mock interviews with our AI interviewer, get instant feedback,
              optimize your resume, and track your progress—all in one platform.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap opacity-0 animate-fade-in-up animate-delay-300">
              <Link to="/signup">
                <Button size="lg" className="gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="transition-all duration-300 hover:scale-105 active:scale-95">
                  Sign In
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground opacity-0 animate-fade-in animate-delay-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                5 free interviews
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center opacity-0 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl opacity-0 animate-fade-in-up">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground opacity-0 animate-fade-in-up animate-delay-100">
              From mock interviews to job tracking, we've got every step of your job search covered.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title} 
                  className="group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary/30 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${200 + index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-card py-20 sm:py-32 overflow-hidden">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl opacity-0 animate-fade-in-up">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground opacity-0 animate-fade-in-up animate-delay-100">
              Get started in three simple steps
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            
            {[
              {
                step: "01",
                title: "Create Your Profile",
                description: "Sign up and tell us about your career goals and target roles.",
              },
              {
                step: "02",
                title: "Practice Interviews",
                description: "Take AI-powered mock interviews tailored to your industry.",
              },
              {
                step: "03",
                title: "Track & Improve",
                description: "Review feedback, track progress, and land your dream job.",
              },
            ].map((item, index) => (
              <div 
                key={item.step} 
                className="relative text-center opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${200 + index * 150}ms` }}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground animate-pulse-glow transition-transform hover:scale-110">
                  {item.step}
                </div>
                <h3 className="mt-6 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl opacity-0 animate-fade-in-up">
              Loved by Job Seekers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground opacity-0 animate-fade-in-up animate-delay-100">
              See what our users are saying about InterviewAI
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.name} 
                className="bg-card transition-all duration-300 hover:-translate-y-2 hover:shadow-xl opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <p className="text-muted-foreground italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-b from-card to-accent/20 py-20 sm:py-32">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl opacity-0 animate-fade-in-up">
              Ready to Land Your Dream Job?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground opacity-0 animate-fade-in-up animate-delay-100">
              Join thousands of successful job seekers who've transformed their
              interview skills with InterviewAI.
            </p>
            <div className="mt-10 opacity-0 animate-fade-in-up animate-delay-200">
              <Link to="/signup">
                <Button size="lg" className="gap-2 animate-pulse-glow transition-all duration-300 hover:scale-105 active:scale-95">
                  Get Started for Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-primary/30">
                <Brain className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">InterviewAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 InterviewAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
