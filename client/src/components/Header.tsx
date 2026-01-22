import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChefHat, LogIn, LogOut, User, Sparkles, BookOpen } from "lucide-react";

interface HeaderProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const [location, setLocation] = useLocation();

  const isAiRecipes = location === "/" || location === "/recipes";
  const isReadyRecipes = location === "/ready-recipes";

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1"
            data-testid="link-home"
          >
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg hidden sm:inline">Рецепты</span>
          </button>
          
          <nav className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setLocation("/")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isAiRecipes 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-ai-recipes"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI рецепты</span>
            </button>
            <button
              onClick={() => setLocation("/ready-recipes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isReadyRecipes 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-ready-recipes"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Готовые</span>
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/profile")}
                className="gap-2"
                data-testid="button-profile"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="gap-2"
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => setLocation("/login")}
              className="gap-2"
              data-testid="button-login"
            >
              <LogIn className="h-4 w-4" />
              Вход
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
