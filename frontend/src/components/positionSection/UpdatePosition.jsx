import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle, X } from "lucide-react";

function UpdatePosition({
  isEditModalOpen,
  setIsEditModalOpen,
  handleSubmit,
  formData,
  setFormData,
  handleAddRequirement,
  handleRequirementChange,
  attributes,
  handleRemoveRequirement,
  editPosition,
}) {
  return (
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
              <label className="text-sm font-medium">Max Projects</label>
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
                    handleRequirementChange(idx, "attributeId", e.target.value)
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
                    handleRequirementChange(idx, "operator", e.target.value)
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
            className="w-full mt-4 dark:bg-zinc-50 dark:text-zinc-900"
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
  );
}

export default UpdatePosition;
