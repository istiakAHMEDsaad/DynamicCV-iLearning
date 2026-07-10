import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@base-ui/react";
import {
  Briefcase,
  LayoutDashboard,
  Library,
  LogOut,
  UserCircle,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { path: "/dashboard/positions", label: "Positions", icon: Briefcase },
    ...(user?.role !== "CANDIDATE"
      ? [
          {
            path: "/dashboard/attributes",
            label: "Attribute Library",
            icon: Library,
          },
        ]
      : []),
    ...(user?.role !== "RECRUITER"
      ? [{ path: "/dashboard/profile", label: "My Profile", icon: UserCircle }]
      : []),
  ];

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans">
      <aside className="w-64 border-r bg-white flex flex-col shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="bg-zinc-900 p-1.5 rounded-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            CVForge
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-4">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-2">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left",
                  isActive
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-zinc-900" : "text-zinc-500",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t bg-zinc-50/50">
          <Button
            variant="outline"
            className="w-full justify-start text-zinc-600"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 shrink-0">
          <div className="font-medium text-zinc-800 capitalize">
            {location.pathname.split("/").pop().replace("-", " ") || "Overview"}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
