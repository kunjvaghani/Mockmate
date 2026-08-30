import { auth, currentUser } from "@clerk/nextjs/server";

/*Checks whether the currently authenticated Clerk user has admin privileges. */

export async function checkIsAdmin(): Promise<boolean> {
    const { userId, sessionClaims } = await auth();
    if (!userId) return false;

    // 1. Primary Production Check: Clerk Session Claims (Public Metadata)
    const userRole = sessionClaims?.metadata?.role;
    if (userRole === "admin") {
        return true;
    }
    

    // 2. Secondary Fallback Check: ADMIN_EMAILS env variable
    // const adminEmailsConfig = process.env.ADMIN_EMAILS || "";
    // const adminEmails = adminEmailsConfig
    //     .split(",")
    //     .map((e) => e.trim().toLowerCase())
    //     .filter(Boolean);

    // if (adminEmails.length > 0) {
    //     const user = await currentUser();
    //     const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
    //     if (userEmail && adminEmails.includes(userEmail)) {
    //         return true;
    //     }
    // }

    // 3. Local Development fallback (when no admin is configured at all)
    // if (process.env.NODE_ENV === "development" && adminEmails.length === 0 && !userRole) {
    //     return true;
    // }

    return false;
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
