import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkIsAdmin } from "@/lib/admin";

// PATCH /api/admin/inquiries/[id]/status — Update inquiry status
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const isAdmin = await checkIsAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        const { id } = await context.params;
        const { status } = await req.json();

        const validStatuses = ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
        }

        const updated = await prisma.userInquiry.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json({ success: true, inquiry: updated });
    } catch (error) {
        console.error("Error updating inquiry status:", error);
        return NextResponse.json(
            { error: "Failed to update inquiry status" },
            { status: 500 }
        );
    }
}
