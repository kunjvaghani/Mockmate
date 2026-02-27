"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isLandingPage = pathname === "/";

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
                            <BrainCircuit className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            MockMate
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-4">
                        {isLandingPage && (
                            <Link
                                href="#features"
                                className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                            >
                                How it Works
                            </Link>
                        )}

                        <SignedIn>
                            <Link href="/dashboard">
                                <Button
                                    variant="ghost"
                                    className="text-sm font-medium text-slate-600 hover:text-indigo-600"
                                >
                                    Dashboard
                                </Button>
                            </Link>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox:
                                            "h-9 w-9 ring-2 ring-indigo-100 hover:ring-indigo-300 transition-all",
                                    },
                                }}
                            />
                        </SignedIn>

                        <SignedOut>
                            <Link href="/sign-in">
                                <Button variant="ghost" className="text-sm font-medium text-slate-600">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/sign-up">
                                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all">
                                    Get Started
                                </Button>
                            </Link>
                        </SignedOut>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-100 py-4 space-y-3">
                        <SignedIn>
                            <Link
                                href="/dashboard"
                                className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-indigo-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <div className="px-3 py-2">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </SignedIn>
                        <SignedOut>
                            <Link
                                href="/sign-in"
                                className="block px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="block px-3 py-2 text-sm font-medium text-indigo-600 rounded-lg hover:bg-indigo-50"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </SignedOut>
                    </div>
                )}
            </div>
        </nav>
    );
}
