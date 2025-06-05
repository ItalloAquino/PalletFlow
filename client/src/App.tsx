import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/use-auth";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import UsersPage from "./pages/users";
import ProductsPage from "./pages/products";
import InventoryPage from "./pages/inventory";
import NotFound from "@/pages/not-found";
import Sidebar from "./components/sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile menu button - apenas para telas menores que 768px */}
      <button
        className="fixed top-4 right-4 z-50 sm:hidden bg-card p-2 rounded shadow"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu className="h-6 w-6" />
      </button>
      {/* Sidebar: Drawer no mobile, fixo no desktop */}
      <div
        className={
          sidebarOpen
            ? "fixed inset-0 z-40 flex sm:static sm:z-0"
            : "hidden sm:block"
        }
      >
        <div
          className={
            sidebarOpen
              ? "fixed inset-0 bg-black/40 sm:hidden"
              : "hidden"
          }
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed left-0 top-0 h-full w-64 bg-card shadow-lg z-50 border-r sm:static sm:z-0">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        </div>
      </div>
      {/* Conteúdo principal */}
      <div className="flex-1 w-full sm:ml-64">
        <Switch>
          <Route path="/" component={DashboardPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/users" component={UsersPage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/inventory" component={InventoryPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
