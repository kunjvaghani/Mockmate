import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIsAdmin, getAdminProfile } from "@/lib/admin";

// POST /api/admin/inquiries/[id]/reply — Submit an official admin response
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await checkIsAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { id } = await context.params;
        const { reply } = await req.json();

        if (!reply || !reply.trim()) {
            return NextResponse.json({ error: "Reply text is required" }, { status: 400 });
        }

        const adminProfile = await getAdminProfile();

        const updated = await prisma.userInquiry.update({
            where: { id },
            data: {
                adminReply: reply.trim(),
                adminRepliedAt: new Date(),
                adminName: adminProfile.name || "MockMate Admin",
                status: "RESOLVED",
            },
        });

        return NextResponse.json({ success: true, inquiry: updated });
    } catch (error) {
        console.error("Error submitting admin reply:", error);
        return NextResponse.json(
            { error: "Failed to submit reply" },
            { status: 500 }
        );
    }
}
