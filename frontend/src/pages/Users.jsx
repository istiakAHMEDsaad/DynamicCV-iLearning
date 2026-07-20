import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Users() {
  const { user: currentUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/users");
      return res.data.users;
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }) =>
      await api.put(`/users/${id}/role`, { role }),
    onSuccess: (data, variables) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries({ queryKey: ["users"] });

      if (variables.id === currentUser.id && variables.role !== "ADMIN") {
        toast.error("You have removed your own Admin access. Logging out.");
        logout();
      }
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to update role"),
  });

  const blockMutation = useMutation({
    mutationFn: async (id) => await api.put(`/users/${id}/block`),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSelectedIds([]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to delete user"),
  });

  const handleRoleChange = (newRole) => {
    selectedIds.forEach((id) => roleMutation.mutate({ id, role: newRole }));
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          User Management
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Admin control panel for managing roles and access.
        </p>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm min-h-[70px]">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {selectedIds.length} selected
          </span>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  selectedIds.forEach((id) => deleteMutation.mutate(id))
                }
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  selectedIds.forEach((id) => blockMutation.mutate(id))
                }
              >
                <ShieldAlert className="h-4 w-4 mr-2" /> Toggle Block
              </Button>

              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-zinc-200 dark:border-zinc-800">
                <UserCog className="h-4 w-4 text-zinc-500" />
                <select
                  className="h-8 rounded-md border border-zinc-200 bg-transparent px-2 text-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100"
                  onChange={(e) => {
                    if (e.target.value) handleRoleChange(e.target.value);
                    e.target.value = "";
                  }}
                  defaultValue=""
                >
                  <option value="" disabled className="dark:bg-zinc-900">
                    Change Role...
                  </option>
                  <option value="CANDIDATE" className="dark:bg-zinc-900">
                    Candidate
                  </option>
                  <option value="RECRUITER" className="dark:bg-zinc-900">
                    Recruiter
                  </option>
                  <option value="ADMIN" className="dark:bg-zinc-900">
                    Admin
                  </option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
            <TableRow>
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={
                    users.length > 0 && selectedIds.length === users.length
                  }
                  onCheckedChange={(c) =>
                    setSelectedIds(c ? users.map((u) => u.id) : [])
                  }
                />
              </TableHead>
              <TableHead>User / Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-zinc-500"
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} className="dark:border-zinc-800">
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.includes(u.id)}
                      onCheckedChange={(c) =>
                        setSelectedIds((prev) =>
                          c
                            ? [...prev, u.id]
                            : prev.filter((id) => id !== u.id),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium dark:text-zinc-200">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {u.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                      ${
                        u.role === "ADMIN"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          : u.role === "RECRUITER"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                      }
                    `}
                    >
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {u.isBlocked ? (
                      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 text-sm font-medium">
                        <ShieldAlert className="h-4 w-4" /> Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                        <ShieldCheck className="h-4 w-4" /> Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400 text-sm">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
