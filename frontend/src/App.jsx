import { Navigate, Route, Routes } from "react-router";
import Login from "./components/authentication/Login";
import Register from "./components/authentication/Register";
import DashboardLayout from "./components/layout/DashboardLayout";
import {
  GuestRoute,
  ProtectedRoute,
  RoleRoute,
} from "./components/layout/RouteGuards";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./lib/theme-provider";
import Attributes from "./pages/dashboard/Attributes";
import Overview from "./pages/dashboard/Overview";
import Positions from "./pages/dashboard/Positions";
import Profile from "./pages/dashboard/Profile";
import PositionView from "./components/PositionView";
import MyCV from "./components/MyCV";
import Users from "./pages/Users";

function App() {
  return (
    <div>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AuthProvider>
          <Routes>
            {/* guest routes */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* protected area */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Overview />} />

                <Route
                  path="positions"
                  element={<Positions title="Positions & Templates" />}
                />
                <Route
                  path="positions/:positionId"
                  element={<PositionView />}
                />

                <Route element={<RoleRoute allowedRoles={["RECRUITER"]} />}>
                  <Route
                    path="attributes"
                    element={<Attributes title="Attribute Library" />}
                  />
                </Route>

                <Route element={<RoleRoute allowedRoles={["ADMIN"]} />}>
                  <Route path="users" element={<Users />} />
                </Route>

                <Route element={<RoleRoute allowedRoles={["CANDIDATE"]} />}>
                  <Route
                    path="profile"
                    element={<Profile title="Candidate Profile" />}
                  />
                  <Route path="my-cvs" element={<MyCV />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
