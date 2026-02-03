import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, User, Sparkles, BookOpen, Heart } from "lucide-react";

interface HeaderProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const [location, setLocation] = useLocation();

  const isAiRecipes = location === "/app" || location === "/recipes";
  const isReadyRecipes = location === "/ready-recipes";
  const isSavedRecipes = location === "/saved";

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
      <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <button
            onClick={() => setLocation("/app")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            data-testid="link-home"
          >
            <span className="text-2xl">🍳</span>
            <span className="font-serif font-semibold text-xl text-foreground hidden sm:inline">
              Fridgely
            </span>
          </button>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 bg-muted/60 rounded-full p-1">
            <button
              onClick={() => setLocation("/app")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isAiRecipes
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-ai-recipes"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Recipes</span>
            </button>
            <button
              onClick={() => setLocation("/ready-recipes")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isReadyRecipes
                  ? "bg-white text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-ready-recipes"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Recipes</span>
            </button>
            {user && (
              <button
                onClick={() => setLocation("/saved")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSavedRecipes
                    ? "bg-white text-red-500 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-saved-recipes"
              >
                <Heart className={`h-4 w-4 ${isSavedRecipes ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">Saved</span>
              </button>
            )}
          </nav>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/profile")}
                className="gap-2 rounded-full hover:bg-secondary"
                data-testid="button-profile"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="hidden sm:inline font-medium">{user.name}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="gap-2 text-muted-foreground hover:text-foreground rounded-full"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setLocation("/login")}
              className="gap-2 rounded-full shadow-sm"
              data-testid="button-login"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
