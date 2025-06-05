import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Printer, Edit, Trash2, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface StockItem {
  id: string;
  code: string;
  name: string;
  category: "alta_rotacao" | "baixa_rotacao";
  quantity: number;
  updatedAt: string;
}

interface EntryItem {
  id: string;
  code: string;
  name: string;
  category: "alta_rotacao" | "baixa_rotacao";
  quantity: number;
  createdAt: string;
  user: string;
}

interface ExitItem {
  id: string;
  code: string;
  name: string;
  category: "alta_rotacao" | "baixa_rotacao";
  quantity: number;
  createdAt: string;
  user: string;
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: stock, isLoading: stockLoading } = useQuery<StockItem[]>({
    queryKey: ["stock"],
    queryFn: async () => {
      const response = await fetch("/api/stock");
      if (!response.ok) throw new Error("Failed to fetch stock");
      return response.json();
    },
  });

  const { data: entries, isLoading: entriesLoading } = useQuery<EntryItem[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      const response = await fetch("/api/entries");
      if (!response.ok) throw new Error("Failed to fetch entries");
      return response.json();
    },
  });

  const { data: exits, isLoading: exitsLoading } = useQuery<ExitItem[]>({
    queryKey: ["exits"],
    queryFn: async () => {
      const response = await fetch("/api/exits");
      if (!response.ok) throw new Error("Failed to fetch exits");
      return response.json();
    },
  });

  const filteredStock = useMemo(() => {
    if (!stock) return [];
    return stock.filter((item) => {
      const matchesSearch = item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [stock, searchQuery, categoryFilter]);

  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    return entries.filter((entry) => {
      const matchesSearch = entry.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [entries, searchQuery, categoryFilter]);

  const filteredExits = useMemo(() => {
    if (!exits) return [];
    return exits.filter((exit) => {
      const matchesSearch = exit.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exit.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || exit.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [exits, searchQuery, categoryFilter]);

  const handleStockAction = (item: StockItem) => {
    // Implementar lógica de ação no estoque
    console.log("Stock action:", item);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Inventário</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerenciamento de estoque e movimentações
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <Tabs defaultValue="stock" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="stock" className="flex-1 sm:flex-none">
              Estoque
            </TabsTrigger>
            <TabsTrigger value="entries" className="flex-1 sm:flex-none">
              Entradas
            </TabsTrigger>
            <TabsTrigger value="exits" className="flex-1 sm:flex-none">
              Saídas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Estoque Atual</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Buscar produto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64"
                    />
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filtrar por categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        <SelectItem value="alta_rotacao">Alta Rotação</SelectItem>
                        <SelectItem value="baixa_rotacao">Baixa Rotação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Código</TableHead>
                        <TableHead className="whitespace-nowrap">Produto</TableHead>
                        <TableHead className="whitespace-nowrap">Categoria</TableHead>
                        <TableHead className="whitespace-nowrap">Quantidade</TableHead>
                        <TableHead className="whitespace-nowrap">Última Atualização</TableHead>
                        <TableHead className="whitespace-nowrap">Ações</TableHead>
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
                                variant={
                                  item.category === "alta_rotacao" ? "default" : "secondary"
                                }
                              >
                                {item.category === "alta_rotacao" ? "Alta" : "Baixa"}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{item.quantity}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(item.updatedAt), "dd/MM/yyyy HH:mm", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStockAction(item)}
                              >
                                <ArrowUpDown className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {searchQuery
                              ? "Nenhum produto encontrado"
                              : "Nenhum produto em estoque"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entries" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Entradas</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Buscar produto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64"
                    />
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filtrar por categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        <SelectItem value="alta_rotacao">Alta Rotação</SelectItem>
                        <SelectItem value="baixa_rotacao">Baixa Rotação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Código</TableHead>
                        <TableHead className="whitespace-nowrap">Produto</TableHead>
                        <TableHead className="whitespace-nowrap">Categoria</TableHead>
                        <TableHead className="whitespace-nowrap">Quantidade</TableHead>
                        <TableHead className="whitespace-nowrap">Data</TableHead>
                        <TableHead className="whitespace-nowrap">Responsável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {entriesLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : filteredEntries.length > 0 ? (
                        filteredEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="whitespace-nowrap">{entry.code}</TableCell>
                            <TableCell className="whitespace-nowrap">{entry.name}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge
                                variant={
                                  entry.category === "alta_rotacao" ? "default" : "secondary"
                                }
                              >
                                {entry.category === "alta_rotacao" ? "Alta" : "Baixa"}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{entry.quantity}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{entry.user}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {searchQuery
                              ? "Nenhuma entrada encontrada"
                              : "Nenhuma entrada registrada"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exits" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle>Saídas</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Buscar produto..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64"
                    />
                    <Select
                      value={categoryFilter}
                      onValueChange={setCategoryFilter}
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filtrar por categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        <SelectItem value="alta_rotacao">Alta Rotação</SelectItem>
                        <SelectItem value="baixa_rotacao">Baixa Rotação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Código</TableHead>
                        <TableHead className="whitespace-nowrap">Produto</TableHead>
                        <TableHead className="whitespace-nowrap">Categoria</TableHead>
                        <TableHead className="whitespace-nowrap">Quantidade</TableHead>
                        <TableHead className="whitespace-nowrap">Data</TableHead>
                        <TableHead className="whitespace-nowrap">Responsável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exitsLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            Carregando...
                          </TableCell>
                        </TableRow>
                      ) : filteredExits.length > 0 ? (
                        filteredExits.map((exit) => (
                          <TableRow key={exit.id}>
                            <TableCell className="whitespace-nowrap">{exit.code}</TableCell>
                            <TableCell className="whitespace-nowrap">{exit.name}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              <Badge
                                variant={
                                  exit.category === "alta_rotacao" ? "default" : "secondary"
                                }
                              >
                                {exit.category === "alta_rotacao" ? "Alta" : "Baixa"}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{exit.quantity}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(exit.createdAt), "dd/MM/yyyy HH:mm", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{exit.user}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {searchQuery
                              ? "Nenhuma saída encontrada"
                              : "Nenhuma saída registrada"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
