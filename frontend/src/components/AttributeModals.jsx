import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export function AttributeModals({
  isCreateOpen,
  setIsCreateOpen,
  isEditOpen,
  setIsEditOpen,
  formData,
  setFormData,
  handleCreateSubmit,
  handleEditSubmit,
  createPending,
  editPending,
}) {
  const renderFormFields = () => (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="STRING">Short Text</option>
          <option value="TEXT">Long Text</option>
          <option value="NUMERIC">Numeric</option>
          <option value="BOOLEAN">Boolean</option>
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
    </>
  );

  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50">
          <DialogHeader>
            <DialogTitle>Create Attribute</DialogTitle>
            <DialogDescription className="dark:text-zinc-400">
              Define a new field to be reused across positions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
            {renderFormFields()}
            <Button
              type="submit"
              className="w-full mt-4 dark:bg-zinc-50 dark:text-zinc-900"
              disabled={createPending}
            >
              {createPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Attribute"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-50">
          <DialogHeader>
            <DialogTitle>Edit Attribute</DialogTitle>
            <DialogDescription className="dark:text-zinc-400">
              Update the attribute definitions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            {renderFormFields()}
            <Button
              type="submit"
              className="w-full mt-4 dark:bg-zinc-50 dark:text-zinc-900"
              disabled={editPending}
            >
              {editPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Update Attribute"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
