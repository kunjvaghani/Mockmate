"use client";

import Link from "next/link";
import {
    BrainCircuit,
    Github,
    Twitter,
    Linkedin,
    Sparkles,
    Heart,
    ChevronUp,
} from "lucide-react";

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Helper to generate pre-filled dashboard links
    const createRoleLink = (role: string, desc: string, exp: string = "1") => {
        const params = new URLSearchParams({ role, desc, exp });
        return `/dashboard/new?${params.toString()}`;
    };

    const footerNavigation = {
        product: [
            { name: "AI Resume Parser", href: "/resume", badge: "New" },
            { name: "Interview Simulator", href: "/dashboard/new", badge: "AI Voice" },
            { name: "Interview Dashboard", href: "/dashboard" },
            { name: "Performance Analytics", href: "/user-dashboard" },
            { name: "5-Axis Radar Scoring", href: "/#features" },
        ],
        roles: [
            {
                name: "Full Stack Engineer",
                href: createRoleLink(
                    "Full Stack Engineer",
                    "React, Next.js, Node.js, TypeScript, PostgreSQL, Prisma ORM, REST & GraphQL APIs, System Design, Cloud Deployments",
                    "1"
                ),
            },
            {
                name: "Frontend Developer",
                href: createRoleLink(
                    "Frontend Developer",
                    "React, Next.js, TypeScript, Tailwind CSS, State Management (Redux/Zustand), Web Performance Optimization, Responsive UI, REST APIs",
                    "1"
                ),
            },
            {
                name: "Backend Developer",
                href: createRoleLink(
                    "Backend Developer",
                    "Node.js, Express, Python, PostgreSQL, MongoDB, RESTful APIs, Microservices, Caching with Redis, Database Optimization",
                    "1"
                ),
            },
            {
                name: "System Design & Architect",
                href: createRoleLink(
                    "System Design Engineer",
                    "Distributed Systems, Microservices Architecture, Load Balancing, Database Sharding, Caching Strategies, High Availability & Scalability",
                    "1"
                ),
            },
            {
                name: "DevOps & Cloud Engineer",
                href: createRoleLink(
                    "DevOps & Cloud Engineer",
                    "Docker, Kubernetes, AWS/GCP Cloud Architecture, CI/CD Pipelines, GitHub Actions, Terraform, Infrastructure as Code, Linux Administration",
                    "1"
                ),
            },
        ],
        resources: [
            { name: "AI Resume Analyzer", href: "/resume" },
            { name: "How MockMate Works", href: "/#features" },
            { name: "Scoring Methodology", href: "/user-dashboard" },
            { name: "Sample Ideal Answers", href: "/dashboard" },
            { name: "Voice Setup Guide", href: "/#features" },
        ],
        legal: [
            { name: "Privacy Policy", href: "#" },
            { name: "Terms of Service", href: "#" },
            { name: "Security & Compliance", href: "#" },
            { name: "AI Ethics & Transparency", href: "#" },
        ],
    };

    return (
        <footer className="border-t border-slate-200/80 bg-white relative overflow-hidden">
            {/* Subtle ambient background glow */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute bottom-0 left-1/4 w-[450px] h-[450px] bg-indigo-50/70 rounded-full blur-3xl" />
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-50/60 rounded-full blur-3xl" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-200/60">
                    {/* Brand Column (Col span 4) */}
                    <div className="md:col-span-4 space-y-4">
                        <Link href="/" className="flex items-center gap-2.5 group inline-flex">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 shadow-md shadow-indigo-200 transition-transform group-hover:scale-105">
                                <BrainCircuit className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                                MockMate
                            </span>
                        </Link>

                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed pr-2">
                            The intelligent AI interview simulator. Practice targeted technical interviews with conversational voice AI, instant follow-ups, and 5-axis analytics.
                        </p>

                        {/* Status badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>All AI Systems Operational</span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-2 pt-2">
                            {[
                                { icon: Github, href: "https://github.com", label: "GitHub" },
                                { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                                { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
                            ].map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={social.label}
                                    className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all shadow-xs"
                                >
                                    <social.icon className="h-4 w-4" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Column 1: Product */}
                    <div className="md:col-span-2 space-y-3">
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-900">Product</p>
                        <ul className="space-y-2.5">
                            {footerNavigation.product.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="group inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium"
                                    >
                                        <span>{item.name}</span>
                                        {item.badge && (
                                            <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-sm border border-indigo-100">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 2: Mock Roles with auto-fill links */}
                    <div className="md:col-span-2 space-y-3">
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-900">Mock Roles</p>
                        <ul className="space-y-2.5">
                            {footerNavigation.roles.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium block"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Resources */}
                    <div className="md:col-span-2 space-y-3">
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-900">Resources</p>
                        <ul className="space-y-2.5">
                            {footerNavigation.resources.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium block"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Legal & Security */}
                    <div className="md:col-span-2 space-y-3">
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-900">Trust & Legal</p>
                        <ul className="space-y-2.5">
                            {footerNavigation.legal.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-600 hover:text-indigo-600 transition-colors font-medium block"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <span>© {new Date().getFullYear()} MockMate Inc. All rights reserved.</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1">
                            Built with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 mx-0.5 inline" /> for tech interview candidates
                        </span>
                        <button
                            onClick={scrollToTop}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 transition-colors font-medium cursor-pointer"
                        >
                            <span>Back to top</span>
                            <ChevronUp className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}
