import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

function ProjectsSection({ projects }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    tags: "",
  });

  const createProfile = useMutation({
    mutationFn: async (payload) => await api.post("/projects", payload),
    onSuccess: () => {
      toast.success("Project added!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsOpen(false);
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        tags: "",
      });
    },
  });

  const deleteProfile = useMutation({
    mutationFn: async (id) => await api.delete(`/projects/${id}`),
    onSuccess: () => {
      toast.success("Project deleted!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createProfile.mutate({
      ...formData,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium dark:text-zinc-50">My Projects</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Add relevant experience.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="dark:bg-zinc-50 dark:text-zinc-900">
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px] dark:bg-zinc-950 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="dark:text-zinc-50">
                Add Project
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-zinc-300">
                  Project Name
                </label>

                <Input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="dark:bg-zinc-900 dark:border-zinc-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-zinc-300">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium dark:text-zinc-300">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="dark:bg-zinc-900 dark:border-zinc-800"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-zinc-300">
                  Tags (Comma separated)
                </label>
                <Input
                  placeholder="React, Node, Postgres"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="dark:bg-zinc-900 dark:border-zinc-800"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium dark:text-zinc-300">
                  Description (Markdown)
                </label>
                <Textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="dark:bg-zinc-900 dark:border-zinc-800"
                />
              </div>
              <Button
                type="submit"
                className="w-full dark:bg-zinc-50 dark:text-zinc-900 h-10"
                disabled={createProfile.isPending}
              >
                {createProfile.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Project"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {projects.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 text-center text-zinc-500 dark:text-zinc-400">
            No projects added yet.
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 flex justify-between"
            >
              <div className="space-y-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
                  {proj.name}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(proj.startDate).toLocaleDateString()} -{" "}
                  {proj.endDate
                    ? new Date(proj.endDate).toLocaleDateString()
                    : "Present"}
                </p>
                <div className="flex gap-2 mt-2">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteProfile.mutate(proj.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProjectsSection;
