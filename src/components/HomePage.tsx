import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle,
  Heart,
  Mail,
  Moon,
  Shield,
  Star,
  TrendingUp
} from "lucide-react";

interface HomePageProps {
  onGetStarted: () => void;
}

export default function HomePage({ onGetStarted }: HomePageProps) {

  const features = [
    {
      icon: <Shield className="w-7 h-7" />,
      title: "Sacred Privacy",
      description: "Your spiritual journey remains sacred between you and Allah. We honor your privacy with minimal data storage - only dates and counts, never personal details.",
      color: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20"
    },
    {
      icon: <Moon className="w-7 h-7" />,
      title: "Mindful Reflection",
      description: "Cultivate deep spiritual awareness through daily self-accountability. Feel genuine remorse and seek sincere repentance through Tawbah.",
      color: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: "Spiritual Ascension",
      description: "Witness your spiritual growth through meaningful insights and beautiful visualizations. Track your journey towards Allah's pleasure.",
      color: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20"
    },
    {
      icon: <Heart className="w-7 h-7" />,
      title: "Divine Guidance",
      description: "Built upon authentic Islamic principles with real scholarly rulings from the Quran and Sunnah to illuminate your righteous path.",
      color: "from-rose-500 to-pink-600",
      bgGradient: "from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        
        {/* Minimal Hero Section */}
        <div className="text-center mb-20 sm:mb-24">
          {/* Simple Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black dark:bg-black rounded-xl flex items-center justify-center shadow-lg border border-zinc-200 dark:border-zinc-800">
              <svg viewBox="0 0 24 24" className="w-10 h-10 sm:w-12 sm:h-12">
                <path
                  d="M12 3 C7 3, 4 8, 4 16 L4 19 L20 19 L20 16 C20 8, 17 3, 12 3Z"
                  fill="#22c55e"
                />
              </svg>
            </div>
          </div>

          {/* Simple Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white mb-6 tracking-tight">
            HisabDaily
          </h1>
          
          {/* Fearful Reminder */}
          <div className="mb-8">
            <p className="text-xl sm:text-2xl font-medium text-zinc-700 dark:text-zinc-300 mb-4">
              Daily Spiritual Accountability
            </p>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-6">
              Remember: Every deed is recorded. Allah is watching, and the Day of Judgment is real.
            </p>
          </div>
          
          {/* Arabic Reminder */}
          <div className="mb-10">
            <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 font-arabic mb-2">
              وَأَنَّ إِلَىٰ رَبِّكَ الْمُنتَهَىٰ
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              "And that to your Lord is the final destination" - Quran 53:42
            </p>
          </div>

          {/* Simple Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={onGetStarted}
              className="w-full sm:w-auto h-12 px-8 text-base font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-all duration-200 hover:scale-102 hover:shadow-lg cursor-pointer"
            >
              Begin Accountability
            </Button>

            <Button
              variant="outline"
              className="w-full sm:w-auto h-12 px-8 text-base font-medium rounded-lg border border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 text-zinc-700 dark:text-zinc-300 transition-all duration-200 hover:scale-102 hover:shadow-md cursor-pointer"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Simple Features Section */}
        <div id="features" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-4">
              Why Track Your Deeds?
            </h2>
            <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
              Because Allah records everything, and accountability begins with yourself
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors duration-200"
              >
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed text-justify">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Simple Islamic Values Section */}
        <div className="mb-16 text-center">
          <Card className="p-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <CardContent className="p-0">
              <Star className="w-8 h-8 text-zinc-600 dark:text-zinc-400 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-4">
                Rooted in Islamic Teachings
              </h2>
              <p className="text-base text-zinc-700 dark:text-zinc-300 mb-6 max-w-2xl mx-auto leading-relaxed text-justify">
                Built upon the Islamic concept of <strong>Muhasabah</strong> (self-accountability) and <strong>Tawbah</strong> (repentance). Every feature respects Islamic principles and your privacy.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Authentic Sources</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Privacy First</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Scholarly Verified</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Fanar API Section */}
        <div className="mb-16 text-center">
          <Card className="p-8 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <CardContent className="p-0">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-zinc-200">
                  <img 
                    src="/fanar_logo.svg" 
                    alt="Fanar Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                  Powered by Fanar API
                </h2>
              </div>
              <p className="text-base text-zinc-700 dark:text-zinc-300 mb-6 max-w-2xl mx-auto leading-relaxed text-justify">
                Our deed checker uses <strong>Fanar Chat API</strong> for authentic Islamic guidance based on Quran and Sunnah. Get reliable scholarly rulings for your spiritual journey.
              </p>
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

        {/* Simple About Section */}
        <div className="mb-16">
          <Card className="p-8 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
            <CardContent className="p-0 text-center">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">
                About HisabDaily
              </h2>
              <div className="max-w-2xl mx-auto space-y-4 text-base text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6">
                <p className="text-justify">
                  Created by a Muslim developer who understood the need for a private, respectful way to track spiritual accountability. Every feature is designed with Islamic principles and your privacy in mind.
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-3">
                  Get in Touch
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a
                    href="mailto:mislam.tauhidul@gmail.com"
                    className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>mislam.tauhidul@gmail.com</span>
                  </a>
                  <span className="hidden sm:block text-zinc-400">•</span>
                  <a
                    href="https://mirtauhid.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>mirtauhid.com</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Final CTA */}
        <div className="text-center">
          <Button
            onClick={onGetStarted}
            className="h-12 px-8 text-base font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-900 transition-all duration-200 hover:scale-102 hover:shadow-lg cursor-pointer"
          >
            Begin Your Accountability
          </Button>
        </div>
      </div>
    </div>
  );
}
