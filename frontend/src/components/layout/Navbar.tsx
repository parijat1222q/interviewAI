import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Menu, 
  X,
  LayoutDashboard,
  Mic,
  FileText,
  Briefcase,
  Trophy,
  BookOpen,
  User
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Interview", href: "/interview", icon: Mic },
  { name: "Resume", href: "/resume", icon: FileText },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Learning", href: "/learning", icon: BookOpen },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in-down">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-primary/30">
            <Brain className="h-5 w-5 text-primary-foreground transition-transform group-hover:scale-110" />
          </div>
          <span className="text-xl font-bold text-foreground">InterviewAI</span>
        </Link>

        {/* Desktop Navigation */}
        {!isLandingPage && (
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 opacity-0 animate-fade-in",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:scale-105"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className={cn("h-4 w-4 transition-transform", isActive && "animate-pulse")} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3">
          {isLandingPage ? (
            <>
              <Link to="/login" className="opacity-0 animate-fade-in animate-delay-200">
                <Button variant="ghost" size="sm" className="transition-transform active:scale-95">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="opacity-0 animate-fade-in animate-delay-300">
                <Button size="sm" className="transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25 active:scale-95">Get Started</Button>
              </Link>
            </>
          ) : (
            <Link to="/profile">
              <Button variant="ghost" size="icon" className="rounded-full transition-transform hover:scale-110 hover:rotate-12">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* Mobile menu button */}
          {!isLandingPage && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden transition-transform active:scale-90"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && !isLandingPage && (
        <div className="md:hidden border-t border-border bg-background animate-slide-in-bottom">
          <div className="container py-4 space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-300 opacity-0 animate-fade-in-left",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
