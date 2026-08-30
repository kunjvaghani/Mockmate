import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIsAdmin } from "@/lib/admin";

// GET /api/admin/inquiries — Fetch all user inquiries for admin review
export async function GET(req: NextRequest) {
    try {
        const isAdmin = await checkIsAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const category = searchParams.get("category");
        const search = searchParams.get("search");

        const where: any = {};

        if (status && status !== "ALL") {
            where.status = status;
        }

        if (category && category !== "ALL") {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { subject: { contains: search, mode: "insensitive" } },
                { message: { contains: search, mode: "insensitive" } },
                { userName: { contains: search, mode: "insensitive" } },
                { userEmail: { contains: search, mode: "insensitive" } },
            ];
        }

        const [inquiries, total, pending, inProgress, resolved] = await Promise.all([
            prisma.userInquiry.findMany({
                where,
                orderBy: { createdAt: "desc" },
            }),
            prisma.userInquiry.count(),
            prisma.userInquiry.count({ where: { status: "PENDING" } }),
            prisma.userInquiry.count({ where: { status: "IN_PROGRESS" } }),
            prisma.userInquiry.count({ where: { status: "RESOLVED" } }),
        ]);

        return NextResponse.json({
            inquiries,
            stats: {
                total,
                pending,
                inProgress,
                resolved,
            },
        });
    } catch (error) {
        console.error("Error fetching admin inquiries:", error);
        return NextResponse.json(
            { error: "Failed to fetch inquiries" },
            { status: 500 }
        );
    }
}
