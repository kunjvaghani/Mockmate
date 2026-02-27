import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Mic, BarChart3, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/20 to-purple-100/20 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8">
              <Sparkles className="h-4 w-4" />
              AI-Powered Interview Practice
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
              Master Your Job <br />
              <span className="text-gradient">Interview with AI</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Practice with a context-aware AI interviewer that adapts to your role,
              speaks follow-up questions aloud, and delivers detailed performance analytics.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transition-all animate-pulse-glow rounded-full">
                  Start Practicing Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                { label: "Questions/Session", value: "5" },
                { label: "AI Response Time", value: "<1s" },
                { label: "Feedback Axes", value: "5" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-gradient">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to <span className="text-gradient">Ace Your Interview</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              From AI-generated questions to voice interaction and detailed analytics — all in your browser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: BrainCircuit,
                title: "AI-Powered Questions",
                description: "Context-aware questions that adapt to your job role, experience level, and answers. Difficulty ramps up naturally.",
                gradient: "from-indigo-500 to-blue-500",
                bgGradient: "from-indigo-50 to-blue-50",
              },
              {
                icon: Mic,
                title: "Real-Time Voice I/O",
                description: "Speak your answers naturally. The AI listens, processes, and responds with its own voice — just like a real interview.",
                gradient: "from-purple-500 to-pink-500",
                bgGradient: "from-purple-50 to-pink-50",
              },
              {
                icon: BarChart3,
                title: "Detailed Analytics",
                description: "Get scored on 5 dimensions with radar charts, per-question feedback, ideal answers, and actionable improvement tips.",
                gradient: "from-emerald-500 to-teal-500",
                bgGradient: "from-emerald-50 to-teal-50",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-0 shadow-lg shadow-slate-100 hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300 hover:-translate-y-1 rounded-2xl"
              >
                <CardContent className="p-8">
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.bgGradient} mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-7 w-7 bg-gradient-to-br ${feature.gradient} bg-clip-text`} style={{ color: feature.gradient.includes('indigo') ? '#4f46e5' : feature.gradient.includes('purple') ? '#9333ea' : '#10b981' }} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Three Steps to <span className="text-gradient">Interview Ready</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                icon: Zap,
                title: "Configure Your Session",
                description: "Enter your target job role, paste the job description, and set your experience level.",
              },
              {
                step: "02",
                icon: Mic,
                title: "Practice with AI",
                description: "The AI asks questions, you answer by voice. It listens, follows up, and adapts — just like a real interviewer.",
              },
              {
                step: "03",
                icon: Shield,
                title: "Get Feedback",
                description: "Receive a detailed score breakdown, ideal answers for each question, and personalized improvement tips.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xl font-bold mb-6 shadow-lg shadow-indigo-200">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(100%_-_16px)] w-[calc(100%_-_64px)] border-t-2 border-dashed border-indigo-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-8 py-16 sm:px-16 text-center shadow-2xl shadow-indigo-200">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                Join MockMate and practice with AI that truly understands your role. It&apos;s free to start.
              </p>
              <Link href="/sign-up">
                <Button size="lg" className="h-14 px-10 text-base bg-white text-indigo-700 hover:bg-indigo-50 rounded-full font-semibold shadow-xl transition-all">
                  Get Started — It&apos;s Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}