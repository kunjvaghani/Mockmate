import { auth, currentUser } from "@clerk/nextjs/server";

/*Checks whether the currently authenticated Clerk user has admin privileges. */

export async function checkIsAdmin(): Promise<boolean> {
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;

    // Primary Production Check: Clerk Session Claims (Public Metadata)
    const userRole = sessionClaims?.metadata?.role;
    return userRole === "admin";
}

/**
 * Returns admin metadata for stamping official replies.
 */
export async function getAdminProfile(): Promise<{
    isAdmin: boolean;
    name: string;
    email: string;
    userId: string | null;
}> {
    const { userId } = await auth();
    if (!userId) {
        return { isAdmin: false, name: "Admin", email: "", userId: null };
    }

    const user = await currentUser();
    const isAdmin = await checkIsAdmin();

    const name =
        user?.fullName ||
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        "MockMate Support Team";
    const email = user?.primaryEmailAddress?.emailAddress || "";

    return {
        isAdmin,
        name,
        email,
        userId,
    };
}
