import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import UsersPage from "./pages/users";
import ProductsPage from "./pages/products";
import InventoryPage from "./pages/inventory";
import NotFound from "@/pages/not-found";
import Sidebar from "./components/sidebar";
import { useState } from "react";
import { Box, LayoutDashboard, LogOut, Menu, Package, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink, Outlet } from "react-router-dom";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex h-screen bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 lg:hidden bg-card p-2 rounded shadow"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:static`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold">PalletFlow</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <NavLink to="/" end>
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </NavLink>
            <NavLink to="/inventory">
              <Package className="h-5 w-5" />
              Estoque
            </NavLink>
            <NavLink to="/products">
              <Box className="h-5 w-5" />
              Produtos
            </NavLink>
            <NavLink to="/users">
              <Users className="h-5 w-5" />
              Usuários
            </NavLink>
          </nav>
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto lg:ml-64">
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>
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
