import { AttributeModals } from "@/components/AttributeModals";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit2, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Attributes() {
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

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
    queryKey: ["attributes", debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      const res = await api.get(`/attributes?${params.toString()}`);
      return res.data.attributes;
    },
    placeholderData: (prevData) => prevData,
  });

  const createAttribute = useMutation({
    mutationFn: async (newAttr) => await api.post("/attributes", newAttr),
    onSuccess: () => {
      toast.success("Attribute created!");
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error) =>
      toast.error(error.response?.data?.error || "Failed to create attribute"),
  });

  const editAttribute = useMutation({
    mutationFn: async ({ id, payload }) =>
      await api.put(`/attributes/${id}`, payload),
    onSuccess: () => {
      toast.success("Attribute updated!");
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setIsEditModalOpen(false);
      setEditingId(null);
      setSelectedIds([]);
      resetForm();
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
    mutationFn: async (id) => await api.delete(`/attributes/${id}`),
    onSuccess: () => {
      toast.success("Attribute deleted!");
      queryClient.invalidateQueries({ queryKey: ["attributes"] });
      setSelectedIds([]);
    },
    onError: (error) =>
      toast.error(error.response?.data?.error || "Failed to delete"),
  });

  const resetForm = () =>
    setFormData({
      name: "",
      category: "",
      type: "STRING",
      options: "",
      version: 1,
    });

  const handleSelectAll = (checked) =>
    setSelectedIds(checked ? attributes.map((attr) => attr.id) : []);

  const handleSelectRow = (checked, id) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((sId) => sId !== id),
    );
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

  const processPayload = () => ({
    ...formData,
    options:
      formData.type === "DROPDOWN"
        ? formData.options.split(",").map((opt) => opt.trim())
        : [],
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createAttribute.mutate(processPayload());
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editAttribute.mutate({ id: editingId, payload: processPayload() });
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
      {/* header */}
      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Attribute Library
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Manage reusable data fields for CVs and Positions.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="dark:bg-zinc-50 dark:text-zinc-900"
        >
          <Plus className="h-4 w-4 mr-2" /> New Attribute
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search attributes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full bg-white dark:bg-zinc-950 dark:border-zinc-800"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="ml-auto flex items-center gap-2 animate-in fade-in zoom-in duration-200 w-full sm:w-auto justify-end">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mr-2 hidden sm:inline-block">
              {selectedIds.length} selected
            </span>
            {selectedIds.length === 1 && (
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                <Edit2 className="h-4 w-4 sm:mr-2" />{" "}
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() =>
                selectedIds.forEach((id) => deleteMutation.mutate(id))
              }
            >
              <Trash2 className="h-4 w-4 sm:mr-2" />{" "}
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        )}
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
                  No attributes found!
                </TableCell>
              </TableRow>
            ) : (
              attributes.map((attr) => (
                <TableRow
                  key={attr.id}
                  className="dark:border-zinc-800 dark:hover:bg-zinc-800/50"
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

      <AttributeModals
        isCreateOpen={isCreateModalOpen}
        setIsCreateOpen={setIsCreateModalOpen}
        isEditOpen={isEditModalOpen}
        setIsEditOpen={setIsEditModalOpen}
        formData={formData}
        setFormData={setFormData}
        handleCreateSubmit={handleCreateSubmit}
        handleEditSubmit={handleEditSubmit}
        createPending={createAttribute.isPending}
        editPending={editAttribute.isPending}
      />
    </div>
  );
}
