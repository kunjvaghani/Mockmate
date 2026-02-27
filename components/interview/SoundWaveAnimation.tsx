"use client";

interface SoundWaveAnimationProps {
    isActive: boolean;
}

export default function SoundWaveAnimation({ isActive }: SoundWaveAnimationProps) {
    return (
        <div className="flex items-center justify-center gap-[3px] h-10">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="sound-wave-bar"
                    style={{
                        animationDelay: `${i * 0.15}s`,
                        animationPlayState: isActive ? "running" : "paused",
                        height: isActive ? undefined : "8px",
                        opacity: isActive ? 1 : 0.3,
                        transition: "opacity 0.3s, height 0.3s",
                    }}
                />
            ))}
        </div>
    );
}
