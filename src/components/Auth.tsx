import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

/**
 * Authentication component for login and signup
 */
export default function Auth() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Handle form submission for login/signup
   */
  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Assalāmu ʿalaykum! Welcome back');
      } else {
        await signUp(email, password);
        toast.success('Account created successfully! Barakallahu feeki');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 flex items-center justify-center p-3 xs:p-4 transition-colors duration-300">
      <div className="w-full max-w-sm mx-auto">
        {/* Header Section */}
        <div className="text-center mb-4 xs:mb-5">
          <div className="w-12 h-12 xs:w-14 xs:h-14 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-zinc-100 dark:to-zinc-200 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-2 xs:mb-3">
            <span className="text-white dark:text-zinc-900 font-bold text-lg xs:text-xl font-naskh">ح</span>
          </div>
          <h1 className="text-lg xs:text-xl font-bold text-slate-800 dark:text-white font-naskh mb-1">
            حساب (Hisab)
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400">
            {isLogin ? 'Welcome back' : 'Begin your journey'}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="rounded-xl shadow-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center pb-3 px-4 xs:px-5 pt-4 xs:pt-5">
            <CardTitle className="text-sm xs:text-base font-semibold text-slate-800 dark:text-zinc-100 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
              {isLogin ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              {isLogin ? 'Continue tracking' : 'Start your journey'}
            </p>
          </CardHeader>
          
          <CardContent className="px-4 xs:px-5 pb-4 xs:pb-5">
            <div className="space-y-3 xs:space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-medium text-slate-800 dark:text-zinc-100">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="your@email.com"
                    disabled={loading}
                    className="h-10 xs:h-11 pl-9 text-xs xs:text-sm rounded-lg border-2 border-slate-300 dark:border-zinc-600 focus:border-slate-500 dark:focus:border-zinc-400 focus:ring-2 focus:ring-slate-500/20 dark:focus:ring-zinc-400/20 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder:text-slate-500 dark:placeholder:text-zinc-400 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-medium text-slate-800 dark:text-zinc-100">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-zinc-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="••••••••"
                    disabled={loading}
                    className="h-10 xs:h-11 pl-9 pr-10 text-xs xs:text-sm rounded-lg border-2 border-slate-300 dark:border-zinc-600 focus:border-slate-500 dark:focus:border-zinc-400 focus:ring-2 focus:ring-slate-500/20 dark:focus:ring-zinc-400/20 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder:text-slate-500 dark:placeholder:text-zinc-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
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
                <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-800 dark:text-zinc-100">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-zinc-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="••••••••"
                      disabled={loading}
                      className="h-10 xs:h-11 pl-9 pr-10 text-xs xs:text-sm rounded-lg border-2 border-slate-300 dark:border-zinc-600 focus:border-slate-500 dark:focus:border-zinc-400 focus:ring-2 focus:ring-slate-500/20 dark:focus:ring-zinc-400/20 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder:text-slate-500 dark:placeholder:text-zinc-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
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
                className="w-full h-10 xs:h-11 text-xs xs:text-sm font-medium rounded-lg bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100" 
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>

              {/* Toggle Auth Mode */}
              <div className="text-center pt-1 xs:pt-2">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-slate-600 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 text-xs transition-colors hover:underline font-medium"
                  disabled={loading}
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
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
                Privacy & Security
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                We only store your email and daily counts. No deed text or verdicts are stored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
