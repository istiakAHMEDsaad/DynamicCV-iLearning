import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Loader2, Plus, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Attributes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "STRING",
    options: "",
    version: 1,
  });

  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ["attributes"],
    queryFn: async () => {
      const res = await api.get("/attributes");
      return res.data.attributes;
    },
  });

  const createAttribute = useMutation({
    mutationFn: async (newAttr) => {
      return await api.post("/attributes", newAttr);
    },
    onSuccess: () => {
      toast.success("Attribute created!");
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setIsCreateModalOpen(false);
      setFormData({
        name: "",
        category: "",
        type: "STRING",
        options: "",
        version: 1,
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to create attribute");
    },
  });

  const editAttribute = useMutation({
    mutationFn: async ({ id, payload }) => {
      return await api.put(`/attributes/${id}`, payload);
    },
    onSuccess: () => {
      toast.success("Attribute updated!");
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setIsEditModalOpen(false);
      setEditingId(null);
      setSelectedIds([]);
      setFormData({
        name: "",
        category: "",
        type: "STRING",
        options: "",
        version: 1,
      });
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        toast.error(
          "Conflict: Someone else modified this attribute! Refreshing data...",
        );
        queryClient.invalidateQueries({ queryKey: ["attributes"] });
        setIsEditModalOpen(false);
      } else {
        toast.error(
          error.response?.data?.error || "Failed to update attribute",
        );
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/attributes/${id}`);
    },
    onSuccess: () => {
      toast.success("Attribute deleted!");
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setSelectedIds([]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to delete");
    },
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(attributes.map((attr) => attr.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (checked, id) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleEditClick = () => {
    const attrToEdit = attributes.find((a) => a.id === selectedIds[0]);
    if (attrToEdit) {
      setEditingId(attrToEdit.id);
      setFormData({
        name: attrToEdit.name,
        category: attrToEdit.category,
        type: attrToEdit.type,
        options: attrToEdit.options ? attrToEdit.options.join(", ") : "",
        version: attrToEdit.version,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      options:
        formData.type === "DROPDOWN"
          ? formData.options.split(",").map((opt) => opt.trim())
          : [],
    };
    editAttribute.mutate({ id: editingId, payload });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      options:
        formData.type === "DROPDOWN"
          ? formData.options.split(",").map((opt) => opt.trim())
          : [],
    };
    createAttribute.mutate(payload);
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) => deleteMutation.mutate(id));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Attribute Library
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage reusable data fields for CVs and Positions.
        </p>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {selectedIds.length} selected
          </span>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
              {selectedIds.length === 1 && (
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </Button>
              )}
            </div>
          )}
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              <Plus className="h-4 w-4 mr-2" /> New Attribute
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50">
            <DialogHeader>
              <DialogTitle>Create Attribute</DialogTitle>
              <DialogDescription className="dark:text-zinc-400">
                Define a new field to be reused across positions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. IELTS Score"
                  className="dark:bg-zinc-900 dark:border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g. Languages"
                  className="dark:bg-zinc-900 dark:border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Type</label>
                <select
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="STRING">Short Text</option>
                  <option value="TEXT">Markdown Text</option>
                  <option value="NUMERIC">Numeric</option>
                  <option value="BOOLEAN">Yes/No Checkbox</option>
                  <option value="DROPDOWN">Dropdown Menu</option>
                  <option value="DATE">Date</option>
                </select>
              </div>

              {formData.type === "DROPDOWN" && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-sm font-medium">
                    Options (Comma separated)
                  </label>
                  <Input
                    required
                    value={formData.options}
                    onChange={(e) =>
                      setFormData({ ...formData, options: e.target.value })
                    }
                    placeholder="e.g. Native, Fluent, Intermediate"
                    className="dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-4 dark:bg-zinc-50 dark:text-zinc-900"
                disabled={createAttribute.isPending}
              >
                {createAttribute.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Attribute"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50">
            <DialogHeader>
              <DialogTitle>Edit Attribute</DialogTitle>
              <DialogDescription className="dark:text-zinc-400">
                Update the attribute definitions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="dark:bg-zinc-900 dark:border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  required
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="dark:bg-zinc-900 dark:border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data Type</label>
                <select
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors dark:border-zinc-800 dark:bg-zinc-900"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="STRING">Short Text</option>
                  <option value="TEXT">Markdown Text</option>
                  <option value="NUMERIC">Numeric</option>
                  <option value="BOOLEAN">Yes/No Checkbox</option>
                  <option value="DROPDOWN">Dropdown Menu</option>
                  <option value="DATE">Date</option>
                </select>
              </div>

              {formData.type === "DROPDOWN" && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-sm font-medium">
                    Options (Comma separated)
                  </label>
                  <Input
                    required
                    value={formData.options}
                    onChange={(e) =>
                      setFormData({ ...formData, options: e.target.value })
                    }
                    className="dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-4 dark:bg-zinc-50 dark:text-zinc-900"
                disabled={editAttribute.isPending}
              >
                {editAttribute.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update Attribute"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* table */}
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
            <TableRow className="dark:border-zinc-800">
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={
                    attributes.length > 0 &&
                    selectedIds.length === attributes.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Attribute Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Data Type</TableHead>
              <TableHead>Version</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-zinc-500"
                >
                  No attributes found in the library.
                </TableCell>
              </TableRow>
            ) : (
              attributes.map((attr) => (
                <TableRow
                  key={attr.id}
                  className="dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.includes(attr.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(checked, attr.id)
                      }
                      aria-label={`Select ${attr.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium dark:text-zinc-200">
                    {attr.name}
                  </TableCell>
                  <TableCell className="dark:text-zinc-400">
                    {attr.category}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:text-zinc-300">
                      {attr.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    v{attr.version}
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
