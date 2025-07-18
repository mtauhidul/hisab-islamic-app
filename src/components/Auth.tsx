import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AuthProps {
  onBack: () => void;
}

export default function Auth({ onBack }: AuthProps) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success(
          <div>
            Welcome back!
            <br />
            As-salāmu ʿalaykum
          </div>
        );
      } else {
        await signUp(email, password);
        toast.success("Account created successfully! Barakallahu feeki");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-3 xs:p-4 transition-colors duration-300">
      <div className="w-full max-w-sm mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-0 transition-all duration-200 hover:scale-102"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Button>
        </div>

        {/* Header Section */}
        <div className="text-center mb-4 xs:mb-5">
          <div className="w-12 h-12 xs:w-14 xs:h-14 bg-black dark:bg-black rounded-xl flex items-center justify-center shadow-lg mx-auto mb-2 xs:mb-3 border border-zinc-200 dark:border-zinc-800">
            <svg viewBox="0 0 24 24" className="w-6 h-6 xs:w-7 xs:h-7">
              <path
                d="M12 3 
                       C7 3, 4 8, 4 16 
                       L4 19 
                       L20 19 
                       L20 16 
                       C20 8, 17 3, 12 3Z"
                fill="#22c55e"
              />
            </svg>
          </div>
          <h1 className="text-lg xs:text-xl font-bold text-zinc-900 dark:text-white font-inter mb-1">
            HisabDaily
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            Daily Spiritual Accountability
          </p>
        </div>

        {/* Auth Card */}
        <Card className="rounded-lg shadow-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <CardHeader className="text-center pb-3 px-4 xs:px-5 pt-4 xs:pt-5">
            <CardTitle className="text-sm xs:text-base font-semibold text-zinc-900 dark:text-white flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              {isLogin
                ? "Continue your spiritual journey"
                : "Begin mindful accountability"}
            </p>
          </CardHeader>

          <CardContent className="px-4 xs:px-5 pb-4 xs:pb-5">
            <div className="space-y-3 xs:space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-zinc-900 dark:text-white"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="your@email.com"
                    disabled={loading}
                    className="h-10 xs:h-11 pl-9 text-xs xs:text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 focus:border-zinc-500 dark:focus:border-zinc-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-zinc-900 dark:text-white"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    disabled={loading}
                    className="h-10 xs:h-11 pl-9 pr-10 text-xs xs:text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 focus:border-zinc-500 dark:focus:border-zinc-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field (Sign Up Only) */}
              {!isLogin && (
                <div className="space-y-1">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-medium text-zinc-900 dark:text-white"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                      disabled={loading}
                      className="h-10 xs:h-11 pl-9 pr-10 text-xs xs:text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 focus:border-zinc-500 dark:focus:border-zinc-400 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                className="w-full h-10 xs:h-11 text-xs xs:text-sm font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-all duration-200 hover:scale-102 hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:hover:scale-100"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </Button>

              {/* Toggle Auth Mode */}
              <div className="text-center pt-1 xs:pt-2">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xs transition-colors hover:underline font-medium"
                  disabled={loading}
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <div className="mt-3 xs:mt-4 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-start gap-2">
            <Shield className="w-3 h-3 xs:w-4 xs:h-4 text-zinc-600 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                Islamic Privacy Promise
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Your spiritual journey stays private. We store only dates and
                counts - never your personal struggles or details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
