import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChefHat, LogIn, LogOut, User } from "lucide-react";

interface HeaderProps {
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1"
          data-testid="link-home"
        >
          <ChefHat className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg hidden sm:inline">Рецепты</span>
        </button>

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
