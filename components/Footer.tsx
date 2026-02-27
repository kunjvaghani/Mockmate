import Link from "next/link";
import { BrainCircuit, Github } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-slate-100 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
                            <BrainCircuit className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">MockMate</span>
                    </div>

                    <p className="text-xs text-slate-400">
                        © {new Date().getFullYear()} MockMate. Built with AI.
                    </p>

                    <Link
                        href="https://github.com"
                        target="_blank"
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <Github className="h-4 w-4" />
                        GitHub
                    </Link>
                </div>
            </div>
        </footer>
    );
}
