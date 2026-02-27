"use client";

import Webcam from "react-webcam";
import { Camera, CameraOff } from "lucide-react";
import { useState } from "react";

interface WebcamViewProps {
    enabled?: boolean;
}

export default function WebcamView({ enabled = true }: WebcamViewProps) {
    const [hasError, setHasError] = useState(false);

    if (!enabled || hasError) {
        return (
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                <CameraOff className="h-10 w-10 mb-3" />
                <p className="text-sm font-medium">Camera off</p>
                <p className="text-xs text-slate-500 mt-1">Click the camera icon to enable</p>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900">
            <Webcam
                audio={false}
                mirrored
                className="w-full h-full object-cover"
                onUserMediaError={() => setHasError(true)}
                videoConstraints={{
                    facingMode: "user",
                    width: 640,
                    height: 480,
                }}
            />
            {/* Camera indicator */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] text-white font-medium">LIVE</span>
            </div>
        </div>
    );
}
