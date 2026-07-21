import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MetricCard({ title, value, icon: Icon }) {
  return (
    <Card className="dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-zinc-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold dark:text-zinc-50">{value}</div>
      </CardContent>
    </Card>
  );
}

export default MetricCard;
