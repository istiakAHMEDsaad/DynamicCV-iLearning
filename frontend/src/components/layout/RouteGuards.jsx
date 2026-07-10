import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet, useLocation } from "react-router";

export const LoadingScreen = () => (
  <div className="flex h-screen w-full items-center justify-center bg-zinc-50">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-zinc-900" />
      <p className="text-sm text-zinc-500 font-medium">Loading...</p>
    </div>
  </div>
);

export const GuestRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export const RoleRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN" || allowedRoles.includes(user.role))
    return <Outlet />;
  return <Navigate to="/dashboard" replace />;
};
