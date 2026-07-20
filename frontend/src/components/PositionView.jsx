import CvDocument from "./CvDocument";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Eye,
  FileText,
  Loader2,
  Send,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router";

function PositionView() {
  const { positionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isRecruiter = user?.role === "RECRUITER" || user?.role === "ADMIN";

  // 1. Fetch Position Details (We fetch all and filter to leverage the cache)
  const { data: position, isLoading: loadingPos } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await api.get("/positions");
      return res.data.positions;
    },
    select: (data) => data.find((p) => p.id === positionId),
  });

  // 2. Fetch Discussions (Polls every 3 seconds for real-time updates)
  const { data: discussions = [] } = useQuery({
    queryKey: ["discussions", positionId],
    queryFn: async () => {
      const res = await api.get(`/discussions/position/${positionId}`);
      return res.data.posts;
    },
    refetchInterval: 3000, // LIVE POLLING EVERY 3 SECONDS
  });

  // 3. Fetch CVs (Only if Recruiter)
  const { data: cvs = [], isLoading: loadingCVs } = useQuery({
    queryKey: ["positionCVs", positionId],
    queryFn: async () => {
      const res = await api.get(`/cvs/position/${positionId}`);
      return res.data.cvs;
    },
    enabled: isRecruiter,
  });

  // --- Mutations ---
  const applyMutation = useMutation({
    mutationFn: async () => await api.post(`/cvs/position/${positionId}`),
    onSuccess: () => toast.success("CV Generated Successfully!"),
    onError: (err) =>
      toast.error(
        err.response?.data?.error ||
          "Failed to generate CV. Do you meet the requirements?",
      ),
  });

  const postMutation = useMutation({
    mutationFn: async (content) =>
      await api.post(`/discussions/position/${positionId}`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions", positionId] });
      setChatInput("");
    },
    onError: () => toast.error("Failed to post message."),
  });

  const likeMutation = useMutation({
    mutationFn: async (cvId) => await api.post(`/cvs/${cvId}/like`),
    onSuccess: (data) => {
      toast.success(data.data.message);
      queryClient.invalidateQueries({ queryKey: ["positionCVs", positionId] });
    },
  });

  // --- States ---
  const [chatInput, setChatInput] = useState("");
  const [selectedCVIds, setSelectedCVIds] = useState([]);
  const [viewingCV, setViewingCV] = useState(null);

  if (loadingPos)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (!position)
    return (
      <div className="p-12 text-center text-red-500">Position not found.</div>
    );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {position.title}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Position Details & Generation Engine
          </p>
        </div>
        {!isRecruiter && (
          <div className="ml-auto">
            <Button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending}
              className="dark:bg-zinc-50 dark:text-zinc-900"
            >
              {applyMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Apply
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 dark:bg-zinc-900 h-10!">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="discussions">
            Discussions ({discussions.length})
          </TabsTrigger>
          {isRecruiter && (
            <TabsTrigger value="cvs">Submitted CVs ({cvs.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4 dark:text-zinc-100">
              Job Description
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
              {position.description}
            </p>

            <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-lg font-medium mb-4 dark:text-zinc-100">
                Required Attributes
              </h3>
              {position.requirements.length === 0 ? (
                <p className="text-sm text-zinc-500 italic">
                  This position is public, No specific attributes required.
                </p>
              ) : (
                <ul className="space-y-2">
                  {position.requirements.map((req) => (
                    <li
                      key={req.id}
                      className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-md border border-zinc-100 dark:border-zinc-800"
                    >
                      <span className="font-semibold">
                        {req.attribute?.name}
                      </span>
                      must be {req.operator === "GT" ? "greater than" : ""}{" "}
                      {req.value}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="discussions" className="mt-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-4">
              {discussions.length === 0 ? (
                <p className="text-center text-zinc-500 mt-20">
                  No discussions yet. Start the conversation!
                </p>
              ) : (
                discussions.map((post) => (
                  <div
                    key={post.id}
                    className={`flex flex-col ${post.authorId === user?.id ? "items-end" : "items-start"}`}
                  >
                    <span className="text-xs text-zinc-500 mb-1">
                      {post.author.firstName} {post.author.lastName} (
                      {post.author.role})
                    </span>
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[80%] ${post.authorId === user?.id ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"}`}
                    >
                      {post.content}
                    </div>
                  </div>
                ))
              )}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (chatInput.trim()) postMutation.mutate(chatInput);
              }}
              className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-2"
            >
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..."
                className="dark:bg-zinc-950 dark:border-zinc-800"
              />
              <Button
                type="submit"
                disabled={!chatInput.trim() || postMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </TabsContent>

        {isRecruiter && (
          <TabsContent value="cvs" className="mt-6 space-y-4">
            {/* TOOLBAR FOR CVs */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {selectedCVIds.length} selected
                </span>
                {selectedCVIds.length === 1 && (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                    <Dialog
                      open={!!viewingCV}
                      onOpenChange={(open) => {
                        if (!open) setViewingCV(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            setViewingCV(
                              cvs.find((c) => c.id === selectedCVIds[0]),
                            )
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Document
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                        <DialogHeader className="sr-only">
                          <DialogTitle>CV Document</DialogTitle>
                        </DialogHeader>
                        {viewingCV && <CvDocument cv={viewingCV} />}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => likeMutation.mutate(selectedCVIds[0])}
                    >
                      <ThumbsUp
                        className={`h-4 w-4 mr-2 ${cvs.find((c) => c.id === selectedCVIds[0])?.likes.some((l) => l.recruiterId === user.id) ? "fill-primary text-primary" : ""}`}
                      />
                      Toggle Like
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* CV TABLE */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                  <TableRow>
                    <TableHead className="w-[50px] text-center">
                      <Checkbox
                        checked={
                          cvs.length > 0 && selectedCVIds.length === cvs.length
                        }
                        onCheckedChange={(c) =>
                          setSelectedCVIds(c ? cvs.map((cv) => cv.id) : [])
                        }
                      />
                    </TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Total Likes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cvs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center h-24 text-zinc-500"
                      >
                        No CVs submitted yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    cvs.map((cv) => (
                      <TableRow key={cv.id} className="dark:border-zinc-800">
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedCVIds.includes(cv.id)}
                            onCheckedChange={(c) =>
                              setSelectedCVIds((prev) =>
                                c
                                  ? [...prev, cv.id]
                                  : prev.filter((id) => id !== cv.id),
                              )
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium dark:text-zinc-200">
                          {cv.profile.firstName} {cv.profile.lastName}
                        </TableCell>
                        <TableCell className="text-zinc-500 dark:text-zinc-400">
                          {new Date(cv.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:text-zinc-300">
                            <ThumbsUp className="h-3 w-3 mr-1" />{" "}
                            {cv.likes.length}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border border-zinc-200 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:focus:ring-zinc-300 ${className}`}
    >
      {children}
    </span>
  );
}

export default PositionView;
