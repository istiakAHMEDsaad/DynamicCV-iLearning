import { useAuth } from "@/contexts/AuthContext";

const Overview = () => {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
      <p className="text-zinc-500">
        Welcome back, {user?.firstName}. This is your {user?.role.toLowerCase()}{" "}
        dashboard.
      </p>
    </div>
  );
};

export default Overview;
