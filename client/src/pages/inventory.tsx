import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Printer, Edit, Trash2, ArrowUpDown, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";

interface StockItem {
  id: number;
  code: string;
  name: string;
  category: "alta_rotacao" | "baixa_rotacao";
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

interface EntryItem {
  id: number;
  product: {
    id: number;
    name: string;
  };
  quantity: number;
  createdAt: Date;
  user: {
    id: number;
    name: string;
  };
}

interface ExitItem {
  id: number;
  product: {
    id: number;
    name: string;
  };
  quantity: number;
  createdAt: Date;
  user: {
    id: number;
    name: string;
  };
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);
  const [actionType, setActionType] = useState<"entry" | "exit">("entry");
  const queryClient = useQueryClient();

  const { data: stock = [], isLoading: stockLoading } = useQuery<StockItem[]>({
    queryKey: ["stock"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/stock");
      return response.json();
    },
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery<EntryItem[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/entries");
      return response.json();
    },
  });

  const { data: exits = [], isLoading: exitsLoading } = useQuery<ExitItem[]>({
    queryKey: ["exits"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/exits");
      return response.json();
    },
  });

  const filteredStock = stock.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredExits = exits.filter((exit) => {
    const matchesSearch = exit.product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleStockAction = (id: number, type: "entry" | "exit") => {
    const item = stock.find((i) => i.id === id);
    if (item) {
      setSelectedItem(item);
      setActionType(type);
      setIsStockModalOpen(true);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4 lg:mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold">Estoque</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stock" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stock">Estoque</TabsTrigger>
              <TabsTrigger value="entries">Entradas</TabsTrigger>
              <TabsTrigger value="exits">Saídas</TabsTrigger>
            </TabsList>

            <TabsContent value="stock">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-10 w-full lg:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Todas as categorias</option>
                  <option value="alta_rotacao">Alta Rotação</option>
                  <option value="baixa_rotacao">Baixa Rotação</option>
                </select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Código</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Nome</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Categoria</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Quantidade</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Última Atualização</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Ações</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : filteredStock.length > 0 ? (
                      filteredStock.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="whitespace-nowrap">{item.code}</TableCell>
                          <TableCell className="whitespace-nowrap">{item.name}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <Badge
                              variant={item.category === "alta_rotacao" ? "default" : "secondary"}
                            >
                              {item.category === "alta_rotacao" ? "Alta Rotação" : "Baixa Rotação"}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{item.quantity}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStockAction(item.id, "entry")}
                              >
                                <ArrowDownToLine className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStockAction(item.id, "exit")}
                              >
                                <ArrowUpFromLine className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {searchQuery
                            ? "Nenhum produto encontrado"
                            : "Nenhum produto cadastrado"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="entries">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar entradas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-10 w-full lg:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Todas as categorias</option>
                  <option value="alta_rotacao">Alta Rotação</option>
                  <option value="baixa_rotacao">Baixa Rotação</option>
                </select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Produto</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Quantidade</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Data</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Usuário</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entriesLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : filteredEntries.length > 0 ? (
                      filteredEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="whitespace-nowrap">{entry.product.name}</TableCell>
                          <TableCell className="whitespace-nowrap">{entry.quantity}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{entry.user.name}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          {searchQuery
                            ? "Nenhuma entrada encontrada"
                            : "Nenhuma entrada registrada"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="exits">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar saídas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="flex h-10 w-full lg:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Todas as categorias</option>
                  <option value="alta_rotacao">Alta Rotação</option>
                  <option value="baixa_rotacao">Baixa Rotação</option>
                </select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Produto</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Quantidade</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Data</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Usuário</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exitsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : filteredExits.length > 0 ? (
                      filteredExits.map((exit) => (
                        <TableRow key={exit.id}>
                          <TableCell className="whitespace-nowrap">{exit.product.name}</TableCell>
                          <TableCell className="whitespace-nowrap">{exit.quantity}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(exit.createdAt), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{exit.user.name}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          {searchQuery
                            ? "Nenhuma saída encontrada"
                            : "Nenhuma saída registrada"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
