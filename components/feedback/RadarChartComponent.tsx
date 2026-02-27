"use client";

import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface RadarScores {
    technicalAccuracy: number;
    communication: number;
    problemSolving: number;
    experienceDepth: number;
    confidence: number;
}

interface RadarChartComponentProps {
    scores: RadarScores;
}

export default function RadarChartComponent({ scores }: RadarChartComponentProps) {
    const data = [
        { dimension: "Technical", value: scores.technicalAccuracy, fullMark: 100 },
        { dimension: "Communication", value: scores.communication, fullMark: 100 },
        { dimension: "Problem Solving", value: scores.problemSolving, fullMark: 100 },
        { dimension: "Experience", value: scores.experienceDepth, fullMark: 100 },
        { dimension: "Confidence", value: scores.confidence, fullMark: 100 },
    ];

    return (
        <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis
                        dataKey="dimension"
                        tick={{ fill: "#475569", fontSize: 13, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            padding: "8px 12px",
                        }}
                        formatter={(value: any) => [`${value}%`, "Score"]}
                    />
                    <Radar
                        name="Performance"
                        dataKey="value"
                        stroke="#4f46e5"
                        fill="#4f46e5"
                        fillOpacity={0.2}
                        strokeWidth={2}
                        animationBegin={0}
                        animationDuration={1200}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
