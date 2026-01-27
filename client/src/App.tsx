import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Recipes from "@/pages/Recipes";
import ReadyRecipes from "@/pages/ReadyRecipes";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import Profile from "@/pages/Profile";
import Landing from "@/pages/Landing";

function AppContent() {
  const { user, logout } = useAuth();

  return (
    <Switch>
      {/* Landing page without header */}
      <Route path="/landing" component={Landing} />

      {/* Main app with header */}
      <Route>
        <div className="min-h-screen flex flex-col">
          <Header user={user} onLogout={logout} />
          <main className="flex-1">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/recipes" component={Recipes} />
              <Route path="/ready-recipes" component={ReadyRecipes} />
              <Route path="/login" component={Login} />
              <Route path="/register" component={Onboarding} />
              <Route path="/profile" component={Profile} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
