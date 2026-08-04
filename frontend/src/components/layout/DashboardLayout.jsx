import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/lib/theme-provider";
import {
  Briefcase,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Moon,
  Sun,
  UserCircle,
  UserCog,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import FavIcon from "../../assets/cv-builder.png";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    ...(user?.role === "CANDIDATE"
      ? [{ path: "/dashboard/my-cvs", label: "My CVs", icon: Briefcase }]
      : []),
    ...(user?.role !== "RECRUITER"
      ? [{ path: "/dashboard/profile", label: "My Profile", icon: UserCircle }]
      : []),
    ...(user?.role === "ADMIN"
      ? [{ path: "/dashboard/users", label: "User Management", icon: UserCog }]
      : []),
      
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden font-sans transition-colors duration-300">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 
        flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <img src={FavIcon} alt="icon" className="w-5 h-5" />
            Solution Byte
          </div>

          <button
            onClick={toggleSidebar}
            className="md:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-4">
          <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2 px-2">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full text-left
                  ${
                    isActive
                      ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-100"
                  }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-500 dark:text-zinc-400"}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start text-zinc-600 dark:text-zinc-400 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 mr-2" />
            ) : (
              <Moon className="h-4 w-4 mr-2" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 dark:border-zinc-700"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="font-medium text-zinc-800 dark:text-zinc-200 capitalize">
              {location.pathname.split("/").pop().replace("-", " ") ||
                "Overview"}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-sm text-zinc-500 dark:text-zinc-400 text-right">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                {user?.firstName}
              </div>
              <div className="text-xs">{user?.role}</div>
            </div>
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold">
              {user?.firstName?.charAt(0) || "U"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-50 dark:bg-zinc-950">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
