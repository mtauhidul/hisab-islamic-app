import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Plus, Minus, CheckCircle, XCircle, TrendingDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useSinCounter } from '@/hooks/useSinCounter';
import { useTrendData } from '@/hooks/useTrendData';
import { verifyDeed } from '@/lib/api';

type TrendPeriod = 7 | 30 | 90 | 180 | 365;

interface Evidence {
  source: string;
  snippet: string;
}

interface VerificationResult {
  verdict: 'sin' | 'not_sin';
  evidence: Evidence[];
}

/**
 * Main dashboard component for Hisab Islamic app
 */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const { count, loading: counterLoading, increment, decrement, syncOfflineData } = useSinCounter();
  const [selectedPeriod, setSelectedPeriod] = useState<TrendPeriod>(7);
  const {
    data: trendData,
    loading: trendLoading,
    getPercentageChange,
  } = useTrendData(selectedPeriod);

  // Deed verification state
  const [deedText, setDeedText] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Show motivational toast on login
  useEffect(() => {
    if (user && !counterLoading && !trendLoading) {
      const percentageChange = getPercentageChange();
      if (percentageChange !== null) {
        if (percentageChange < 0) {
          toast.success(`Alḥamdulillāh! Down ${Math.abs(percentageChange).toFixed(1)}% this week`, {
            description: 'May Allah continue to guide you on the right path.',
          });
        } else {
          toast.message("Let's improve today, in shāʾAllāh", {
            description: 'Every step towards righteousness is a blessing.',
          });
        }
      }
    }
  }, [user, counterLoading, trendLoading, getPercentageChange]);

  /**
   * Handle deed verification
   */
  const handleVerifyDeed = async () => {
    if (!deedText.trim()) {
      toast.error('Please enter a deed to verify');
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyDeed(deedText, 'en');
      setVerificationResult(result);
      // Clear the textarea after verification (don't store the text)
      setDeedText('');
    } catch {
      toast.error('Failed to verify deed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  /**
   * Handle online status change for syncing
   */
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [syncOfflineData]);

  if (counterLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">حساب (Hisab)</h1>
          <p className="text-muted-foreground">Assalāmu ʿalaykum, {user?.email?.split('@')[0]}</p>
        </div>
        <Button variant="outline" onClick={logout}>
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Deed Checker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Deed Checker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter a deed to verify if it's permissible in Islam..."
              value={deedText}
              onChange={(e) => setDeedText(e.target.value)}
              className="min-h-20"
            />
            <Button
              onClick={handleVerifyDeed}
              disabled={isVerifying || !deedText.trim()}
              className="w-full"
            >
              {isVerifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Check Deed
            </Button>

            {verificationResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {verificationResult.verdict === 'sin' ? (
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="w-3 h-3" />
                      Sin
                    </Badge>
                  ) : (
                    <Badge variant="default" className="gap-1 bg-green-600">
                      <CheckCircle className="w-3 h-3" />
                      Not a Sin
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Evidence:</h4>
                  {verificationResult.evidence.map((evidence, index) => (
                    <div key={index} className="text-sm border-l-2 border-muted pl-3">
                      <div className="font-medium">{evidence.source}</div>
                      <div className="text-muted-foreground">{evidence.snippet}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sin Counter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">Daily Sin Counter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{count}</div>
              <p className="text-muted-foreground">Today's Count</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={decrement}
                disabled={count <= 0}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-2" />
                Decrease
              </Button>
              <Button variant="destructive" size="lg" onClick={increment} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Increase
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Counter resets daily at midnight
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Trend Analysis
          </CardTitle>
          <div className="flex gap-2 mt-4">
            {[7, 30, 90, 180, 365].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period as TrendPeriod)}
              >
                {period}d
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {trendLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="rgb(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'rgb(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
