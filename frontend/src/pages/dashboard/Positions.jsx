import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import {
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Copy,
  PlusCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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

export default function Positions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    title: "",
    description: "",
    maxProjects: 3,
    projectTags: "",
    version: 1,
    requirements: [],
  };
  const [formData, setFormData] = useState(initialFormState);

  const { data: positions = [], isLoading: loadingPositions } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await api.get("/positions");
      return res.data.positions;
    },
  });

  const { data: attributes = [] } = useQuery({
    queryKey: ["attributes"],
    queryFn: async () => {
      const res = await api.get("/attributes");
      return res.data.attributes;
    },
  });

  const createPosition = useMutation({
    mutationFn: async (payload) => await api.post("/positions", payload),
    onSuccess: () => {
      toast.success("Position created!");
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setIsCreateModalOpen(false);
      setFormData(initialFormState);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to create position"),
  });

  const editPosition = useMutation({
    mutationFn: async ({ id, payload }) =>
      await api.put(`/positions/${id}`, payload),
    onSuccess: () => {
      toast.success("Position updated!");
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setIsEditModalOpen(false);
      setSelectedIds([]);
      setFormData(initialFormState);
    },
    onError: (err) => {
      if (err.response?.status === 409) {
        toast.error("Conflict: Modified elsewhere! Refreshing...");
        queryClient.invalidateQueries({ queryKey: ["positions"] });
        setIsEditModalOpen(false);
      } else {
        toast.error(err.response?.data?.error || "Failed to update position");
      }
    },
  });

  const deletePosition = useMutation({
    mutationFn: async (id) => await api.delete(`/positions/${id}`),
    onSuccess: () => {
      toast.success("Position deleted!");
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setSelectedIds([]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to delete"),
  });

  const duplicatePosition = useMutation({
    mutationFn: async (id) => await api.post(`/positions/${id}/duplicate`),
    onSuccess: () => {
      toast.success("Position duplicated!");
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      setSelectedIds([]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.error || "Failed to duplicate"),
  });

  const handleSelectAll = (checked) => {
    setSelectedIds(checked ? positions.map((p) => p.id) : []);
  };

  const handleSelectRow = (checked, id) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id),
    );
  };

  const handleAddRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [
        ...prev.requirements,
        { attributeId: "", operator: "EQ", value: "" },
      ],
    }));
  };

  const handleRemoveRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const handleRequirementChange = (index, field, val) => {
    setFormData((prev) => {
      const newReqs = [...prev.requirements];
      newReqs[index][field] = val;
      return { ...prev, requirements: newReqs };
    });
  };

  const handleEditClick = () => {
    const pos = positions.find((p) => p.id === selectedIds[0]);
    if (pos) {
      setEditingId(pos.id);
      setFormData({
        title: pos.title,
        description: pos.description,
        maxProjects: pos.maxProjects,
        projectTags: pos.projectTags ? pos.projectTags.join(", ") : "",
        version: pos.version,
        requirements: pos.requirements.map((req) => ({
          attributeId: req.attributeId,
          operator: req.operator,
          value: req.value,
        })),
      });
      setIsEditModalOpen(true);
    }
  };

  const handleSubmit = (e, isEdit = false) => {
    e.preventDefault();
    const payload = {
      ...formData,
      maxProjects: parseInt(formData.maxProjects) || 3,
      projectTags: formData.projectTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      requirements: formData.requirements.filter(
        (req) => req.attributeId && req.value,
      ),
    };
    if (isEdit) {
      editPosition.mutate({ id: editingId, payload });
    } else {
      createPosition.mutate(payload);
    }
  };

  if (loadingPositions) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  const isRecruiter = user?.role === "RECRUITER" || user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Positions & Templates
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage job roles, access rules, and CV templates.
        </p>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {selectedIds.length} selected
          </span>
          {selectedIds.length > 0 && isRecruiter && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              <Button
                variant="destructive"
                size="sm"
                onClick={() =>
                  selectedIds.forEach((id) => deletePosition.mutate(id))
                }
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
              {selectedIds.length === 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => duplicatePosition.mutate(selectedIds[0])}
                  >
                    <Copy className="h-4 w-4 mr-2" /> Duplicate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleEditClick}>
                    <Edit2 className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {isRecruiter && (
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setFormData(initialFormState)}
                className="dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                <Plus className="h-4 w-4 mr-2" /> New Position
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50">
              <DialogHeader>
                <DialogTitle>Create Position</DialogTitle>
                <DialogDescription className="dark:text-zinc-400">
                  Define the template and set access rules.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => handleSubmit(e, false)}
                className="space-y-4 mt-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Max Projects on CV
                    </label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={formData.maxProjects}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxProjects: e.target.value,
                        })
                      }
                      className="dark:bg-zinc-900 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Project Tags (Comma separated)
                    </label>
                    <Input
                      placeholder="React, Python, AWS"
                      value={formData.projectTags}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectTags: e.target.value,
                        })
                      }
                      className="dark:bg-zinc-900 dark:border-zinc-800"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-semibold">
                      Access Rules (Requirements)
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRequirement}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Rule
                    </Button>
                  </div>
                  {formData.requirements.map((req, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-center mb-2 animate-in slide-in-from-top-2"
                    >
                      <select
                        required
                        className="flex h-9 w-1/3 rounded-md border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                        value={req.attributeId}
                        onChange={(e) =>
                          handleRequirementChange(
                            idx,
                            "attributeId",
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select Attribute...</option>
                        {attributes.map((attr) => (
                          <option key={attr.id} value={attr.id}>
                            {attr.name} ({attr.type})
                          </option>
                        ))}
                      </select>

                      <select
                        required
                        className="flex h-9 w-1/4 rounded-md border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                        value={req.operator}
                        onChange={(e) =>
                          handleRequirementChange(
                            idx,
                            "operator",
                            e.target.value,
                          )
                        }
                      >
                        <option value="EQ">Equals</option>
                        <option value="GT">Greater Than (&gt;)</option>
                        <option value="GTE">Greater or Equal (&ge;)</option>
                        <option value="LT">Less Than (&lt;)</option>
                        <option value="LTE">Less or Equal (&le;)</option>
                        <option value="CONTAINS">Contains</option>
                      </select>

                      <Input
                        required
                        placeholder="Target Value"
                        className="flex-1 dark:bg-zinc-900 dark:border-zinc-800"
                        value={req.value}
                        onChange={(e) =>
                          handleRequirementChange(idx, "value", e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRequirement(idx)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                  {formData.requirements.length === 0 && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                      No access rules set. Position is public.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4 dark:bg-zinc-50 dark:text-zinc-900 h-10"
                  disabled={createPosition.isPending}
                >
                  {createPosition.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Position"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {isRecruiter && (
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50">
              <DialogHeader>
                <DialogTitle>Edit Position</DialogTitle>
                <DialogDescription className="dark:text-zinc-400">
                  Update the template and access rules.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => handleSubmit(e, true)}
                className="space-y-4 mt-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Max Projects on CV
                    </label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={formData.maxProjects}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxProjects: e.target.value,
                        })
                      }
                      className="dark:bg-zinc-900 dark:border-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Project Tags (Comma separated)
                    </label>
                    <Input
                      placeholder="React, Python, AWS"
                      value={formData.projectTags}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectTags: e.target.value,
                        })
                      }
                      className="dark:bg-zinc-900 dark:border-zinc-800"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-semibold">
                      Access Rules (Requirements)
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddRequirement}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Rule
                    </Button>
                  </div>
                  {formData.requirements.map((req, idx) => (
                    <div key={idx} className="flex gap-2 items-center mb-2">
                      <select
                        required
                        className="flex h-9 w-1/3 rounded-md border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                        value={req.attributeId}
                        onChange={(e) =>
                          handleRequirementChange(
                            idx,
                            "attributeId",
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select Attribute...</option>
                        {attributes.map((attr) => (
                          <option key={attr.id} value={attr.id}>
                            {attr.name}
                          </option>
                        ))}
                      </select>
                      <select
                        required
                        className="flex h-9 w-1/4 rounded-md border border-zinc-200 bg-transparent px-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
                        value={req.operator}
                        onChange={(e) =>
                          handleRequirementChange(
                            idx,
                            "operator",
                            e.target.value,
                          )
                        }
                      >
                        <option value="EQ">Equals</option>
                        <option value="GT">Greater Than (&gt;)</option>
                        <option value="GTE">Greater or Equal (&ge;)</option>
                        <option value="LT">Less Than (&lt;)</option>
                        <option value="LTE">Less or Equal (&le;)</option>
                        <option value="CONTAINS">Contains</option>
                      </select>
                      <Input
                        required
                        placeholder="Target Value"
                        className="flex-1 dark:bg-zinc-900 dark:border-zinc-800"
                        value={req.value}
                        onChange={(e) =>
                          handleRequirementChange(idx, "value", e.target.value)
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRequirement(idx)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  type="submit"
                  className="w-full mt-4 dark:bg-zinc-50 dark:text-zinc-900 h-10"
                  disabled={editPosition.isPending}
                >
                  {editPosition.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update Position"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
            <TableRow className="dark:border-zinc-800">
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={
                    positions.length > 0 &&
                    selectedIds.length === positions.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Position Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Access Rules</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[80px]">Version</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center h-24 text-zinc-500"
                >
                  No positions available.
                </TableCell>
              </TableRow>
            ) : (
              positions.map((pos) => (
                <TableRow
                  key={pos.id}
                  className="dark:border-zinc-800 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.includes(pos.id)}
                      onCheckedChange={(checked) =>
                        handleSelectRow(checked, pos.id)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium dark:text-zinc-200">
                    {pos.title}
                  </TableCell>
                  <TableCell className="dark:text-zinc-400 max-w-xs truncate">
                    {pos.description}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:text-zinc-300">
                      {pos.requirements.length > 0
                        ? `${pos.requirements.length} Rules`
                        : "Public"}
                    </span>
                  </TableCell>
                  <TableCell className="dark:text-zinc-400 text-sm">
                    {pos.projectTags.length > 0
                      ? pos.projectTags.join(", ")
                      : "None"}
                  </TableCell>
                  <TableCell className="text-zinc-500">
                    v{pos.version}
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
