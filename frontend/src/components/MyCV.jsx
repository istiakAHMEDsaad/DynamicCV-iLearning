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
import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

function MyCV() {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState([]);

  const { data: cvs = [], isLoading } = useQuery({
    queryKey: ["myCVs"],
    queryFn: async () => {
      const res = await api.get("/cvs/my-cvs");
      return res.data.cvs;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/cvs/${id}`),
    onSuccess: () => {
      toast.success("CV Deleted");
      queryClient.invalidateQueries({ queryKey: ["myCVs"] });
      setSelectedIds([]);
    },
  });

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
          My Generated CVs
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          View and manage the CVs you have submitted to positions.
        </p>
      </div>

      {/* TOOLBAR */}
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
                onClick={() =>
                  selectedIds.forEach((id) => deleteMutation.mutate(id))
                }
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
              {/* For brevity, viewing own CV can navigate to position or open a modal similar to recruiter */}
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
                  checked={cvs.length > 0 && selectedIds.length === cvs.length}
                  onCheckedChange={(c) =>
                    setSelectedIds(c ? cvs.map((cv) => cv.id) : [])
                  }
                />
              </TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Generated On</TableHead>
              <TableHead>Likes Received</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cvs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center h-24 text-zinc-500"
                >
                  You haven't generated any CVs yet.
                </TableCell>
              </TableRow>
            ) : (
              cvs.map((cv) => (
                <TableRow key={cv.id} className="dark:border-zinc-800">
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.includes(cv.id)}
                      onCheckedChange={(c) =>
                        setSelectedIds((prev) =>
                          c
                            ? [...prev, cv.id]
                            : prev.filter((id) => id !== cv.id),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium dark:text-zinc-200">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-zinc-400" />
                      {cv.position.title}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 dark:text-zinc-400">
                    {new Date(cv.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:text-zinc-300">
                      {cv.likes.length} Likes
                    </span>
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

export default MyCV;
