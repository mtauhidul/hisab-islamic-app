import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Moon, TrendingUp, Heart, Mail, CheckCircle, ArrowRight, Star } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
}

/**
 * Home page component showcasing HisabDaily features and motivation
 */
export default function HomePage({ onGetStarted }: HomePageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Islamic Privacy',
      description:
        'Your spiritual journey stays between you and Allah. We store only dates and counts - never personal details.',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: <Moon className="w-6 h-6" />,
      title: 'Daily Reflection',
      description:
        'Track your actions mindfully. Feel genuine regret. Seek sincere repentance through Tawbah.',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Spiritual Growth',
      description:
        'Visualize your journey with meaningful insights. Watch your spiritual awareness grow over time.',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Islamic Guidance',
      description:
        'Built with authentic Islamic principles. Get real scholarly rulings to guide your path.',
      color: 'text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 sm:mb-20">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-zinc-900 dark:bg-zinc-950 rounded-2xl flex items-center justify-center shadow-xl border border-zinc-200 dark:border-zinc-800">
              <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12">
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
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 font-inter">
            HisabDaily
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl text-emerald-600 dark:text-emerald-400 mb-2 font-medium">
            Track. Regret. Repent.
          </p>

          {/* Subtitle */}
          <p className="text-base text-slate-600 dark:text-zinc-300 mb-2 max-w-2xl mx-auto leading-relaxed">
            A privacy-first Islamic app for daily spiritual accountability
          </p>

          {/* Arabic */}
          <p className="text-base text-slate-500 dark:text-zinc-400 mb-8 font-naskh">
            حساب يومي • للمحاسبة الروحية اليومية
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onGetStarted}
              className="w-full sm:w-auto h-12 px-8 text-base font-medium rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Begin Your Journey
              <ArrowRight className="w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 text-base font-medium rounded-xl border-2 border-slate-300 dark:border-zinc-600 hover:border-slate-400 dark:hover:border-zinc-500 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 font-inter">
              Built for Your Spiritual Growth
            </h2>
            <p className="text-base text-slate-600 dark:text-zinc-300 max-w-2xl mx-auto">
              Every feature designed with Islamic principles and your privacy in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  hoveredFeature === index
                    ? 'border-emerald-200 dark:border-emerald-800 shadow-lg scale-105'
                    : 'border-slate-200 dark:border-zinc-700 hover:shadow-md'
                } bg-white dark:bg-zinc-800`}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-3">
                    <div className={`${feature.color} p-2 rounded-lg bg-slate-50 dark:bg-zinc-700`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1 font-inter">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Islamic Values Section */}
        <div className="mb-12 text-center">
          <Card className="p-6 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 border border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-0">
              <Star className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-3 font-inter">
                Rooted in Islamic Teachings
              </h2>
              <p className="text-base text-slate-700 dark:text-zinc-300 mb-4 max-w-2xl mx-auto leading-relaxed">
                Built upon the Islamic concept of <strong>Tawbah</strong> (repentance) and{' '}
                <strong>Muhasabah</strong> (self-accountability).
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-sm text-slate-600 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Authentic Sources</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Scholarly Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Privacy by Design</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Powered by Fanar Section */}
        <div className="mb-12 text-center">
          <Card className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
            <CardContent className="p-0">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-inter">
                  Powered by Fanar API
                </h2>
              </div>

              <p className="text-base text-slate-700 dark:text-zinc-300 mb-4 max-w-2xl mx-auto leading-relaxed">
                Our deed checker feature is powered by <strong>Fanar Chat API</strong>, a trusted
                platform that provides authentic Islamic guidance based on verified sources from the
                Quran and Sunnah. Get reliable scholarly rulings to guide your spiritual journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-4">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Authentic Islamic Sources</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Scholarly Verified Content</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Quran & Sunnah Based</span>
                </div>
              </div>

              <a
                href="https://www.fanar.qa/en"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Visit Fanar.qa to learn more
                <ArrowRight className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <Card className="p-6 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
            <CardContent className="p-0 text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 font-inter">
                About HisabDaily
              </h2>

              <div className="max-w-2xl mx-auto space-y-3 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                <p>
                  Created by a Muslim developer who understood the need for a private, respectful
                  way to track spiritual accountability. Every feature is designed with Islamic
                  principles and your privacy in mind.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-700">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 font-inter">
                  Get in Touch
                </h3>
                <div className="flex flex-col sm:flex-row gap-2 justify-center items-center text-sm">
                  <a
                    href="mailto:mislam.tauhidul@gmail.com"
                    className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>mislam.tauhidul@gmail.com</span>
                  </a>
                  <span className="hidden sm:block text-slate-400">•</span>
                  <span className="text-slate-600 dark:text-zinc-400">
                    For suggestions, issues, or guidance
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple CTA */}
        <div className="text-center">
          <Button
            onClick={onGetStarted}
            className="h-12 px-8 text-base font-medium rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
          >
            Begin Your Journey
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
