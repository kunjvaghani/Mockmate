"use client";

import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    PolarAngleAxis,
} from "recharts";

interface ScoreCircleProps {
    score: number; // 1-10
}

export default function ScoreCircle({ score }: ScoreCircleProps) {
    const percentage = Math.round((score / 10) * 100);
    const data = [{ name: "Score", value: percentage, fill: getColor(percentage) }];

    function getColor(pct: number): string {
        if (pct >= 80) return "#22c55e";
        if (pct >= 60) return "#4f46e5";
        if (pct >= 40) return "#f59e0b";
        return "#ef4444";
    }

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="75%"
                        outerRadius="100%"
                        barSize={14}
                        data={data}
                        startAngle={90}
                        endAngle={-270}
                    >
                        <PolarAngleAxis
                            type="number"
                            domain={[0, 100]}
                            angleAxisId={0}
                            tick={false}
                        />
                        <RadialBar
                            dataKey="value"
                            cornerRadius={10}
                            background={{ fill: "#f1f5f9" }}
                            animationBegin={0}
                            animationDuration={1500}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-800">{percentage}%</span>
                    <span className="text-sm text-slate-400 font-medium">Overall Score</span>
                </div>
            </div>

            <p className="mt-2 text-lg font-semibold text-slate-700">
                {score}/10
            </p>
        </div>
    );
}
