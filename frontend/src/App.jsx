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
import Overview from "./pages/dashboard/Overview";
import PlaceholderPage from "./pages/dashboard/PlaceholderPage";

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
                  element={<PlaceholderPage title="Positions & Templates" />}
                />

                <Route element={<RoleRoute allowedRoles={["RECRUITER"]} />}>
                  <Route
                    path="attributes"
                    element={<PlaceholderPage title="Attribute Library" />}
                  />
                </Route>

                <Route element={<RoleRoute allowedRoles={["CANDIDATE"]} />}>
                  <Route
                    path="profile"
                    element={<PlaceholderPage title="Candidate Profile" />}
                  />
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
