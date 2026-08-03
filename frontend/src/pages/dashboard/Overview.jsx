import MetricCard from "@/components/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Briefcase,
  FileText,
  Loader2,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router";

export default function Overview() {
  const { user } = useAuth();
  const isCandidate = user?.role === "CANDIDATE";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["overviewStats"],
    queryFn: async () => {
      const res = await api.get("/stats/overview");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        <p>Failed to load dashboard data. Please try logging in again.</p>
      </div>
    );
  }

  const { stats, latestPositions, popularPositions, tagCloud } = data || {};

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome back, {user?.firstName}!
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Here is what is happening on the platform today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="New CVs (24h)"
          value={stats.cvsLast24h}
          icon={Activity}
        />
        <MetricCard title="Total CVs" value={stats.totalCVs} icon={FileText} />
        <MetricCard
          title="Open Positions"
          value={stats.totalPositions}
          icon={Briefcase}
        />
        <MetricCard
          title="Candidates"
          value={stats.totalCandidates}
          icon={Users}
        />
        <MetricCard
          title="Recruiters"
          value={stats.totalRecruiters}
          icon={Users}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-zinc-500" /> Latest Positions
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow>
                  <TableHead>Position Title</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {latestPositions.map((pos) => (
                  <TableRow key={pos.id} className="dark:border-zinc-800">
                    <TableCell className="font-medium dark:text-zinc-200">
                      {pos.title}
                      <div className="text-xs text-zinc-500 font-normal mt-0.5">
                        Updated {new Date(pos.updatedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/dashboard/positions/${pos.id}`}
                        className="text-sm font-medium text-primary hover:underline inline-flex items-center"
                      >
                        View <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-zinc-500" /> Most Popular
              Positions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                <TableRow>
                  <TableHead>Position Title</TableHead>
                  <TableHead className="text-center">CVs Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {popularPositions.map((pos) => (
                  <TableRow key={pos.id} className="dark:border-zinc-800">
                    <TableCell className="font-medium dark:text-zinc-200">
                      {pos.title}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                        {pos._count.cvs} CVs
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        to={`/dashboard/positions/${pos.id}`}
                        className="text-sm font-medium text-primary hover:underline inline-flex items-center"
                      >
                        View <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Popular Tag
          </CardTitle>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Most requested technologies across all positions.
          </p>
        </CardHeader>

        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-3 p-6 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-100 dark:border-zinc-800">
            {tagCloud.length === 0 ? (
              <span className="text-zinc-500">No tags available yet.</span>
            ) : (
              tagCloud.map((tag) => {
                const fontSize = Math.min(32, 12 + tag.count * 3);
                const opacity = Math.min(1, 0.5 + tag.count * 0.1);

                return (
                  <Link
                    key={tag.text}
                    to="/dashboard/positions"
                    className="inline-block transition-transform hover:scale-110 hover:text-primary"
                    style={{
                      fontSize: `${fontSize}px`,
                      opacity: opacity,
                      fontWeight: tag.count > 2 ? 700 : 500,
                      color: `var(--color-zinc-${tag.count > 3 ? "900" : "600"})`,
                    }}
                    title={`${tag.text} (${tag.count} mentions)`}
                  >
                    #{tag.text}
                  </Link>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
