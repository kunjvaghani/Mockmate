"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BrainCircuit,
  Mic,
  BarChart3,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Star,
  CheckCircle2,
  Cpu,
  Flame,
  Award,
} from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  const floatAnimation = {
    y: [0, -8, 0],
    transition: {
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-18">
        {/* Background ambient glow meshes */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-indigo-200/25 via-purple-200/20 to-transparent rounded-full blur-3xl -translate-y-1/3" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-200/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto"
          >
            {/* Top Pill Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs sm:text-sm font-semibold mb-5 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>AI-Powered Technical Interview Simulator</span>
            </motion.div>

            {/* Main Headline - Natural, balanced sizing */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-slate-900 mb-5 leading-tight"
            >
              Practice Technical Interviews. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Get Instant AI Feedback.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-7 leading-relaxed font-normal"
            >
              Simulate realistic mock interviews tailored to your target role. Speak your answers aloud, receive follow-ups, and get detailed scoring across 5 key dimensions.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5"
            >
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-12 px-7 text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all rounded-full font-semibold group cursor-pointer"
                >
                  Start Practicing Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-7 text-sm sm:text-base rounded-full border-slate-200 bg-white/80 backdrop-blur hover:bg-slate-50 text-slate-700 transition-all font-medium"
                >
                  See How It Works
                </Button>
              </Link>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              variants={itemVariants}
              className="mt-10 pt-6 border-t border-slate-200/60 grid grid-cols-3 gap-4 max-w-md mx-auto"
            >
              {[
                { label: "Questions/Session", value: "5 Rounds" },
                { label: "Voice Latency", value: "< 1 sec" },
                { label: "Feedback Axes", value: "5 Dimensions" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 bg-white/80 backdrop-blur-sm relative border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2.5">
              Everything You Need to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Ace Your Interview</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
              From dynamic AI questions to voice interaction and radar charts — all in your browser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: BrainCircuit,
                title: "Context-Aware Questions",
                description: "Analyzes your job role and description to ask targeted questions that gradually increase in depth and complexity.",
                bgGradient: "from-indigo-50 to-blue-50/60",
                borderHover: "hover:border-indigo-300",
              },
              {
                icon: Mic,
                title: "Real-Time Voice I/O",
                description: "Speak your answers naturally with real-time speech-to-text. The AI answers back with clear, natural speech synthesis.",
                bgGradient: "from-purple-50 to-pink-50/60",
                borderHover: "hover:border-purple-300",
              },
              {
                icon: BarChart3,
                title: "5-Axis Performance Radar",
                description: "Get evaluated on Technical Accuracy, Communication, Problem Solving, Experience Depth, and Confidence.",
                bgGradient: "from-cyan-50 to-emerald-50/60",
                borderHover: "hover:border-cyan-300",
              },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card
                  className={`group relative overflow-hidden border border-slate-200/80 ${feature.borderHover} shadow-sm hover:shadow-lg shadow-slate-100 hover:shadow-indigo-100/50 transition-all duration-300 rounded-2xl h-full bg-white`}
                >
                  <CardContent className="p-7">
                    <motion.div
                      animate={floatAnimation}
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.bgGradient} mb-5 shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <feature.icon className={`h-6 w-6 text-indigo-600`} />
                    </motion.div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="pt-14 pb-10 sm:pt-16 sm:pb-12 bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
              Three Steps to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Interview Ready</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto">
              Configure, speak, and review analytics in just a few minutes.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid md:grid-cols-3 gap-8 sm:gap-10 relative"
          >
            {[
              {
                step: "1",
                icon: Zap,
                title: "Configure Session",
                description: "Enter your target job role, years of experience, and job description.",
              },
              {
                step: "2",
                icon: Mic,
                title: "Practice with AI",
                description: "Answer questions through your mic. The AI listens, follows up, and adapts.",
              },
              {
                step: "3",
                icon: Shield,
                title: "Review Analytics",
                description: "Get detailed score radar charts, ideal answers, and actionable feedback.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={itemVariants}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Properly centered dashed connecting line behind step circles */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-[50%] w-[100%] border-t-2 border-dashed border-indigo-200 z-0" />
                )}

                {/* Step Circle */}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white text-base font-bold mb-4 shadow-md shadow-indigo-200 ring-4 ring-white group-hover:scale-105 transition-transform">
                  {item.step}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Cohesive Indigo/Purple Gradient CTA Section (No huge gap, matches site theme) */}
      <section className="pt-4 pb-14 sm:pb-18">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-10 sm:px-12 sm:py-14 text-center shadow-xl shadow-indigo-200/50"
          >
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
                Ready to Ace Your Next Interview?
              </h2>
              <p className="text-indigo-100 text-sm sm:text-base mb-6 max-w-lg mx-auto leading-relaxed">
                Practice with AI that adapts to your role, sharpens your answers, and gives you the confidence to succeed.
              </p>

              {/* Value points */}
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-white/90 font-medium mb-8">
                <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  Free Voice AI
                </span>
                <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  Instant Radar Reports
                </span>
                <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                  Zero Setup
                </span>
              </div>

              {/* White CTA button matching the app theme */}
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="h-12 px-8 text-sm sm:text-base bg-white text-indigo-700 hover:bg-indigo-50 rounded-full font-semibold shadow-lg shadow-indigo-900/20 hover:shadow-xl transition-all cursor-pointer"
                >
                  Start Practicing Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}