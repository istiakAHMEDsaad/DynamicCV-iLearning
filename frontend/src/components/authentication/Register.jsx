import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    location: "",
    role: "CANDIDATE",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(formData);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.error || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 transition-colors duration-300">
      <Card className="w-full max-w-lg shadow-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create an account
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Enter your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="dark:text-zinc-300">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="dark:text-zinc-300">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="dark:text-zinc-300">
                Location
              </Label>
              <Input
                id="location"
                required
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
              />
            </div>

            {/* Quick role selector for testing purposes */}
            <div className="space-y-2">
              <Label htmlFor="role" className="dark:text-zinc-300">
                Account Type
              </Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="flex h-9 w-full items-center justify-between rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300"
              >
                <option value="CANDIDATE" className="dark:bg-zinc-900">
                  Candidate
                </option>
                <option value="RECRUITER" className="dark:bg-zinc-900">
                  Recruiter
                </option>
              </select>
            </div>

            <Button
              className="w-full mt-6 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-zinc-900 dark:text-zinc-100 font-medium underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
