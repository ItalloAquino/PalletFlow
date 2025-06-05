import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardStats {
  totalPicos: number;
  totalPaletizados: number;
  altaRotacao: number;
  baixaRotacao: number;
  recentEntries: Array<{
    id: number;
    type: string;
    productCode: string;
    productDescription: string;
    quantity: number;
    category: string;
    createdAt: string;
  }>;
  recentExits: Array<{
    id: number;
    type: string;
    productCode: string;
    productDescription: string;
    quantity: number;
    category: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPicos || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPaletizados || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Hoje</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentEntries?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas Hoje</CardTitle>
            <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentExits?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Entradas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentEntries?.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{entry.productCode}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {entry.quantity}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saídas Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentExits?.map((exit) => (
                <div
                  key={exit.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{exit.productCode}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantidade: {exit.quantity}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(exit.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
