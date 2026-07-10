import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 transition-colors duration-300">
      <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-zinc-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100 h-10"
              />
            </div>
            <Button
              className="w-full dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 h-12"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-zinc-900 dark:text-zinc-100 font-medium underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
