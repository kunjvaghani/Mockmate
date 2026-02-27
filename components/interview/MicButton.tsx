"use client";

import { Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MicButtonProps {
    listening: boolean;
    onStart: () => void;
    onStop: () => void;
    disabled?: boolean;
}

export default function MicButton({
    listening,
    onStart,
    onStop,
    disabled = false,
}: MicButtonProps) {
    return (
        <div className="flex flex-col items-center gap-3">
            <button
                onClick={listening ? onStop : onStart}
                disabled={disabled}
                className={`
          relative h-20 w-20 rounded-full flex items-center justify-center
          transition-all duration-300 
          ${listening
                        ? "bg-red-500 shadow-xl shadow-red-200 scale-110"
                        : disabled
                            ? "bg-slate-200 cursor-not-allowed"
                            : "bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-200 hover:scale-105 hover:shadow-2xl"
                    }
        `}
            >
                {/* Pulsing ring when active */}
                {listening && (
                    <>
                        <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />
                        <span className="absolute -inset-2 rounded-full border-2 border-red-300 animate-ping opacity-50" style={{ animationDelay: "0.5s" }} />
                    </>
                )}

                {listening ? (
                    <Square className="h-7 w-7 text-white fill-white" />
                ) : (
                    <Mic className="h-8 w-8 text-white" />
                )}
            </button>

            <p className="text-sm font-medium text-slate-500">
                {disabled
                    ? "AI is speaking..."
                    : listening
                        ? "Listening — click to stop"
                        : "Tap to speak"}
            </p>
        </div>
    );
}
