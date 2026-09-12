import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    const startTime = Date.now();
    let dbStatus = "unknown";
    let dbLatencyMs = 0;

    try {
        // Quick probe to verify MongoDB Atlas connection is warm and responsive
        const dbStart = Date.now();
        await prisma.mockInterview.findFirst({
            select: { id: true },
        });
        dbLatencyMs = Date.now() - dbStart;
        dbStatus = "connected";
    } catch (error) {
        console.error("Health check database probe failed:", error);
        dbStatus = "disconnected";
    }

    const totalLatencyMs = Date.now() - startTime;
    const isHealthy = dbStatus === "connected";

    return NextResponse.json(
        {
            status: isHealthy ? "ok" : "degraded",
            service: "mockmate",
            environment: process.env.NODE_ENV || "production",
            uptimeSeconds: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
            checks: {
                database: {
                    status: dbStatus,
                    latencyMs: dbLatencyMs,
                },
                serverLatencyMs: totalLatencyMs,
            },
        },
        {
            status: isHealthy ? 200 : 503,
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        }
    );
}

// Support HEAD requests (often used by lightweight uptime pingers)
export async function HEAD() {
    return new Response(null, {
        status: 200,
        headers: {
            "Cache-Control": "no-store, no-cache",
        },
    });
}
