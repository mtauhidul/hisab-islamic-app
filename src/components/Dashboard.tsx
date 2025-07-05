import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useSinCounter } from '@/hooks/useSinCounter';
import { useTrendData } from '@/hooks/useTrendData';
import { verifyDeed } from '@/lib/api';
import {
  BarChart3,
  CheckCircle,
  Loader2,
  LogOut,
  Minus,
  Moon,
  Plus,
  Shield,
  Sun,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

type TrendPeriod = 7 | 30 | 90 | 180 | 365;

interface Evidence {
  source: string;
  snippet: string;
}

interface VerificationResult {
  verdict: 'sin' | 'not_sin';
  evidence: Evidence[];
}

export default function Dashboard() {
  const { logout } = useAuth();
  const { count, loading: counterLoading, increment, decrement, syncOfflineData } = useSinCounter();
  const [selectedPeriod, setSelectedPeriod] = useState<TrendPeriod>(7);
  const {
    data: trendData,
    loading: trendLoading,
    getPercentageChange,
  } = useTrendData(selectedPeriod);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });
  const [deedText, setDeedText] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<'counter' | 'checker' | 'trends'>('counter');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Handle deed verification
  const handleVerifyDeed = async () => {
    if (!deedText.trim()) {
      toast.error('Please enter a deed to verify');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyDeed(deedText, 'en');
      setVerificationResult(result);
      setDeedText('');
      toast.success('Deed verified successfully');
    } catch {
      toast.error('Failed to verify deed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle logout confirmation
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    toast.success('You have been signed out. Fi amanillah!');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle online status change for syncing
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncOfflineData]);

  // Show loading state
  if (counterLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600 dark:text-zinc-400" />
      </div>
    );
  }

  const tabs = [
    { id: 'counter', label: 'Counter', icon: BarChart3 },
    { id: 'checker', label: 'Checker', icon: Shield },
    { id: 'trends', label: 'Trends', icon: TrendingDown },
  ];

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-300 ${darkMode ? 'dark' : ''}`}
    >
      {/* Mobile-First Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-md mx-auto px-3 xs:px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 xs:h-16 sm:h-18">
            <div className="flex items-center space-x-2 xs:space-x-3">
              <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-zinc-100 dark:to-zinc-200 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white dark:text-zinc-900 font-bold text-base xs:text-lg sm:text-xl font-naskh">
                  ح
                </span>
              </div>
              <div>
                <h1 className="text-base xs:text-lg sm:text-xl font-semibold text-slate-800 dark:text-zinc-100 font-naskh">
                  حساب (Hisab)
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                  Assalāmu ʿalaykum
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1 xs:space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-zinc-400" />
                ) : (
                  <Moon className="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-zinc-400" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogoutClick}
                className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="h-4 w-4 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-zinc-400" />
                <span className="sr-only">Sign out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 mx-4 max-w-sm w-full shadow-xl border border-slate-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-2">
              Sign Out
            </h3>
            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6">
              Are you sure you want to sign out? Your progress will be saved.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleLogoutCancel}
                className="px-4 py-2 text-sm border-slate-300 dark:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 text-sm bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <nav className="sticky top-14 xs:top-16 sm:top-18 z-40 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-md mx-auto px-3 xs:px-4 sm:px-6">
          <div className="flex space-x-1 py-2 xs:py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'counter' | 'checker' | 'trends')}
                className={`
                  flex-1 h-10 xs:h-11 text-xs xs:text-sm font-medium rounded-lg 
                  flex items-center justify-center
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-zinc-500/20 dark:focus:ring-offset-zinc-900
                  ${
                    activeTab === tab.id
                      ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg hover:bg-slate-800 dark:hover:bg-zinc-200'
                      : 'text-slate-600 dark:text-zinc-400 bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-100 active:bg-slate-200 dark:active:bg-zinc-700'
                  }
                `}
              >
                <tab.icon className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.slice(0, 1)}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-3 xs:px-4 sm:px-6 py-4 xs:py-6 space-y-4 xs:space-y-6">
        {/* Counter Tab */}
        {activeTab === 'counter' && (
          <div className="flex flex-col gap-4 xs:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Daily Counter Card */}
            <Card className="rounded-xl p-3 xs:p-4 sm:p-6 shadow-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-600">
              <CardContent className="p-0">
                <div className="text-center mb-4 xs:mb-6">
                  <div className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 dark:text-zinc-100 mb-2 font-mono transition-all duration-200">
                    {count}
                  </div>
                  <p className="text-xs xs:text-sm sm:text-base text-slate-600 dark:text-zinc-400">
                    {count === 1 ? 'deed tracked today' : 'deeds tracked today'}
                  </p>
                  {getPercentageChange() !== null && (
                    <div
                      className={`inline-flex items-center mt-2 xs:mt-3 px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        getPercentageChange()! < 0
                          ? 'bg-emerald-100 dark:bg-green-900/20 text-emerald-700 dark:text-green-400'
                          : 'bg-rose-100 dark:bg-red-900/20 text-rose-700 dark:text-red-400'
                      }`}
                    >
                      {getPercentageChange()! < 0 ? '↓' : '↑'}{' '}
                      {Math.abs(getPercentageChange()!).toFixed(1)}%
                    </div>
                  )}
                </div>

                <div className="flex flex-col xs:flex-col sm:flex-row gap-2 xs:gap-3">
                  <Button
                    variant="outline"
                    onClick={decrement}
                    disabled={count <= 0}
                    className="flex-1 h-11 xs:h-12 sm:h-14 rounded-lg border-2 border-slate-300 dark:border-zinc-500 hover:border-slate-400 dark:hover:border-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-600 bg-white dark:bg-zinc-700 transition-all duration-200 disabled:opacity-50 text-xs xs:text-sm sm:text-base text-slate-700 dark:text-zinc-100"
                  >
                    <Minus className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2" />
                    Decrease
                  </Button>
                  <Button
                    onClick={increment}
                    className="flex-1 h-11 xs:h-12 sm:h-14 rounded-lg bg-rose-400 hover:bg-rose-500 dark:bg-red-400 dark:hover:bg-red-500 text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 text-xs xs:text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2" />
                    Increase
                  </Button>
                </div>

                <p className="text-xs sm:text-sm text-center text-slate-500 dark:text-zinc-400 mt-3 xs:mt-4">
                  Counter resets daily at midnight
                </p>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 xs:gap-4">
              <Card className="rounded-xl p-3 xs:p-4 shadow-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-slate-300 dark:hover:border-zinc-600">
                <CardContent className="p-0 text-center">
                  <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-slate-800 dark:text-zinc-100 font-mono">
                    {trendData && trendData.length >= 7
                      ? trendData.slice(-7).reduce((sum, d) => sum + d.count, 0)
                      : 0}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">This Week</p>
                </CardContent>
              </Card>
              <Card className="rounded-xl p-3 xs:p-4 shadow-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-slate-300 dark:hover:border-zinc-600">
                <CardContent className="p-0 text-center">
                  <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-slate-800 dark:text-zinc-100 font-mono">
                    {trendData && trendData.length >= 30
                      ? trendData.slice(-30).reduce((sum, d) => sum + d.count, 0)
                      : 0}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">This Month</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Checker Tab */}
        {activeTab === 'checker' && (
          <div className="flex flex-col gap-4 xs:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="rounded-xl p-3 xs:p-4 sm:p-6 shadow-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:shadow-md transition-all duration-200">
              <CardHeader className="p-0 pb-3 xs:pb-4">
                <CardTitle className="flex items-center gap-2 text-base xs:text-lg sm:text-xl text-slate-800 dark:text-zinc-100">
                  <Shield className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-zinc-400" />
                  Deed Checker
                </CardTitle>
                <p className="text-xs xs:text-sm sm:text-base text-slate-600 dark:text-zinc-400 mt-1 xs:mt-2">
                  Verify if an action is permissible in Islam
                </p>
              </CardHeader>
              <CardContent className="p-0 space-y-3 xs:space-y-4">
                <Textarea
                  placeholder="Enter a deed to verify..."
                  value={deedText}
                  onChange={(e) => setDeedText(e.target.value)}
                  className="min-h-20 xs:min-h-24 sm:min-h-28 resize-none rounded-lg border-2 border-slate-300 dark:border-zinc-600 focus:border-slate-500 dark:focus:border-zinc-400 focus:ring-2 focus:ring-slate-500/20 dark:focus:ring-zinc-400/20 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 placeholder:text-slate-500 dark:placeholder:text-zinc-400 transition-all text-xs xs:text-sm sm:text-base"
                  rows={4}
                />
                <Button
                  onClick={handleVerifyDeed}
                  disabled={isVerifying || !deedText.trim()}
                  className="w-full h-11 xs:h-12 sm:h-14 rounded-lg bg-slate-900 dark:bg-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 text-xs xs:text-sm sm:text-base"
                >
                  {isVerifying && (
                    <Loader2 className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 mr-1 xs:mr-2 animate-spin" />
                  )}
                  {isVerifying ? 'Checking...' : 'Check Deed'}
                </Button>

                {verificationResult && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div
                      className={`p-3 xs:p-4 sm:p-5 rounded-lg border-2 transition-all ${
                        verificationResult.verdict === 'sin'
                          ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                          : 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2 xs:mb-3">
                        {verificationResult.verdict === 'sin' ? (
                          <XCircle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-red-600 dark:text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                        )}
                        <Badge
                          variant={
                            verificationResult.verdict === 'sin' ? 'destructive' : 'secondary'
                          }
                          className="text-xs sm:text-sm font-medium px-2 xs:px-3 py-1"
                        >
                          {verificationResult.verdict === 'sin' ? 'Not Permissible' : 'Permissible'}
                        </Badge>
                      </div>

                      {verificationResult.evidence && verificationResult.evidence.length > 0 && (
                        <div className="space-y-2 xs:space-y-3">
                          <p className="text-xs xs:text-sm sm:text-base font-medium text-slate-800 dark:text-zinc-100">
                            Evidence:
                          </p>
                          <div className="space-y-1 xs:space-y-2 max-h-28 xs:max-h-32 overflow-y-auto">
                            {verificationResult.evidence.map((evidence, index) => (
                              <div
                                key={index}
                                className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300"
                              >
                                <span className="font-medium text-slate-800 dark:text-zinc-100">
                                  {evidence.source}:
                                </span>{' '}
                                <span className="italic">"{evidence.snippet}"</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="flex flex-col gap-4 xs:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Card className="rounded-xl p-3 xs:p-4 sm:p-6 shadow-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:shadow-md transition-all duration-200">
              <CardHeader className="p-0 pb-3 xs:pb-4">
                <CardTitle className="flex items-center gap-2 text-base xs:text-lg sm:text-xl text-slate-800 dark:text-zinc-100">
                  <TrendingDown className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-zinc-400" />
                  Trend Analysis
                </CardTitle>

                {/* Period Filter Tabs */}
                <div className="flex gap-1 xs:gap-2 mt-3 xs:mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { value: 7, label: '7D' },
                    { value: 30, label: '1M' },
                    { value: 90, label: '3M' },
                    { value: 180, label: '6M' },
                    { value: 365, label: '1Y' },
                  ].map((period) => (
                    <Button
                      key={period.value}
                      variant={selectedPeriod === period.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod(period.value as TrendPeriod)}
                      className={`h-8 xs:h-9 sm:h-10 px-2 xs:px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                        selectedPeriod === period.value
                          ? 'bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg border-slate-900 dark:border-zinc-100'
                          : 'border-slate-300 dark:border-zinc-600 hover:border-slate-500 dark:hover:border-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100'
                      }`}
                    >
                      {period.label}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {trendLoading ? (
                  <div className="flex items-center justify-center h-48 xs:h-64 sm:h-72 md:h-80">
                    <Loader2 className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 animate-spin text-zinc-600 dark:text-zinc-400" />
                  </div>
                ) : trendData && trendData.length > 0 ? (
                  <div className="h-48 xs:h-64 sm:h-72 md:h-80 w-full bg-white dark:bg-zinc-800 rounded-lg p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={darkMode ? '#52525b' : '#cbd5e1'}
                          opacity={0.6}
                        />
                        <XAxis
                          dataKey="date"
                          tick={{
                            fontSize: 11,
                            fill: darkMode ? '#a1a1aa' : '#64748b',
                            fontWeight: 600,
                          }}
                          axisLine={{ stroke: darkMode ? '#52525b' : '#94a3b8', strokeWidth: 1 }}
                          tickLine={{ stroke: darkMode ? '#52525b' : '#94a3b8', strokeWidth: 1 }}
                          tickFormatter={(value) => {
                            const parts = value.split('-');
                            return parts.length === 3 ? `${parts[1]}/${parts[2]}` : value;
                          }}
                        />
                        <YAxis
                          tick={{
                            fontSize: 11,
                            fill: darkMode ? '#a1a1aa' : '#64748b',
                            fontWeight: 600,
                          }}
                          axisLine={{ stroke: darkMode ? '#52525b' : '#94a3b8', strokeWidth: 1 }}
                          tickLine={{ stroke: darkMode ? '#52525b' : '#94a3b8', strokeWidth: 1 }}
                          width={25}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? '#27272a' : '#ffffff',
                            border: darkMode ? '1px solid #52525b' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            fontSize: '12px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            color: darkMode ? '#fafafa' : '#0f172a',
                            fontWeight: 500,
                          }}
                          labelStyle={{
                            color: darkMode ? '#fafafa' : '#0f172a',
                            fontWeight: 600,
                          }}
                          labelFormatter={(value) => {
                            const parts = value.split('-');
                            if (parts.length === 3) {
                              const date = new Date(
                                parseInt(parts[0]),
                                parseInt(parts[1]) - 1,
                                parseInt(parts[2])
                              );
                              return date.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              });
                            }
                            return value;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke={darkMode ? '#fafafa' : '#dc2626'}
                          strokeWidth={3}
                          dot={{
                            fill: darkMode ? '#fafafa' : '#dc2626',
                            strokeWidth: 2,
                            stroke: darkMode ? '#27272a' : '#ffffff',
                            r: 4,
                          }}
                          activeDot={{
                            r: 6,
                            fill: darkMode ? '#fafafa' : '#dc2626',
                            strokeWidth: 3,
                            stroke: darkMode ? '#27272a' : '#ffffff',
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 xs:h-64 sm:h-72 md:h-80 text-center">
                    <div className="text-slate-500 dark:text-zinc-400">
                      <p className="text-xs xs:text-sm">
                        No data available for the selected period
                      </p>
                      <p className="text-xs mt-1">Start tracking to see your trend</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
