import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import UserFormModal from "@/components/user-form-modal";

interface User {
  id: number;
  name: string;
  nickname: string;
  username: string;
  password: string;
  role: "administrador" | "armazenista";
  isFirstLogin: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Usuários</h1>
        <Button onClick={() => setIsUserModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="flex h-10 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Todas as funções</option>
              <option value="administrador">Administrador</option>
              <option value="armazenista">Armazenista</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Nome</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Apelido</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Usuário</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Função</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">Ações</th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="whitespace-nowrap">{user.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{user.nickname}</TableCell>
                      <TableCell className="whitespace-nowrap">{user.username}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant={user.role === "administrador" ? "default" : "secondary"}
                        >
                          {user.role === "administrador" ? "Administrador" : "Armazenista"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge
                          variant={user.isFirstLogin ? "destructive" : "default"}
                        >
                          {user.isFirstLogin ? "Primeiro Acesso" : "Ativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setIsUserModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(user.id)}
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
                      {searchQuery
                        ? "Nenhum usuário encontrado"
                        : "Nenhum usuário cadastrado"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setEditingUser(null);
          setIsUserModalOpen(false);
        }}
        user={editingUser}
      />
    </div>
  );
}
