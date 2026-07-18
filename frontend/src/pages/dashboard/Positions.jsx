import NewPosition from "@/components/positionSection/NewPosition";
import UpdatePosition from "@/components/positionSection/UpdatePosition";
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
import { Copy, Edit2, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

export default function Positions() {
  const { user } = useAuth();
  const navigate = useNavigate();
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

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
              {selectedIds.length === 1 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    navigate(`/dashboard/positions/${selectedIds[0]}`)
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Open Position
                </Button>
              )}

              {/* recruiter control */}
              {isRecruiter && (
                <>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEditClick}
                      >
                        <Edit2 className="h-4 w-4 mr-2" /> Edit
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {isRecruiter && (
          <NewPosition
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
            setFormData={setFormData}
            initialFormState={initialFormState}
            handleSubmit={handleSubmit}
            formData={formData}
            handleAddRequirement={handleAddRequirement}
            handleRequirementChange={handleRequirementChange}
            attributes={attributes}
            handleRemoveRequirement={handleRemoveRequirement}
            createPosition={createPosition}
          />
        )}

        {isRecruiter && (
          <UpdatePosition
            isEditModalOpen={isEditModalOpen}
            setIsEditModalOpen={setIsEditModalOpen}
            handleSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            handleAddRequirement={handleAddRequirement}
            handleRequirementChange={handleRequirementChange}
            attributes={attributes}
            handleRemoveRequirement={handleRemoveRequirement}
            editPosition={editPosition}
          />
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
