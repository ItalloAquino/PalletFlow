import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import ProductFormModal from "@/components/product-form-modal";
import type { Product } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Produto excluído",
        description: "O produto foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Tem certeza que deseja excluir o produto ${product.code}?`)) {
      deleteMutation.mutate(product.id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // Filter products based on search term and category
  const filteredProducts = products?.filter((product) => {
    const matchesSearch = 
      product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === "all" || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Produtos</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Gerenciamento de produtos e categorias
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>Lista de Produtos</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="Buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Código</TableHead>
                    <TableHead className="whitespace-nowrap">Nome</TableHead>
                    <TableHead className="whitespace-nowrap">Categoria</TableHead>
                    <TableHead className="whitespace-nowrap">Descrição</TableHead>
                    <TableHead className="whitespace-nowrap">Última Atualização</TableHead>
                    <TableHead className="whitespace-nowrap">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="whitespace-nowrap">{product.code}</TableCell>
                        <TableCell className="whitespace-nowrap">{product.name}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant={
                              product.category === "alta_rotacao" ? "default" : "secondary"
                            }
                          >
                            {product.category === "alta_rotacao" ? "Alta" : "Baixa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{product.description}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(product.updatedAt), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product);
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm
                          ? "Nenhum produto encontrado"
                          : "Nenhum produto cadastrado"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
      />
    </div>
  );
}
