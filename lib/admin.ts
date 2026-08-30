import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Checks whether the currently authenticated Clerk user has admin privileges.
 * An admin is identified by matching their email against the comma-separated ADMIN_EMAILS env variable.
 * In development mode, if ADMIN_EMAILS is not yet configured, any logged-in user is granted access for testing.
 */
export async function checkIsAdmin(): Promise<boolean> {
    const { userId } = await auth();
    if (!userId) return false;

    const user = await currentUser();
    if (!user) return false;

    const adminEmailsConfig = process.env.ADMIN_EMAILS || "";
    const adminEmails = adminEmailsConfig
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

    const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();

    // If configured in env, verify email match
    if (adminEmails.length > 0) {
        return Boolean(userEmail && adminEmails.includes(userEmail));
    }

    // Development fallback so user can immediately test locally without manual env setup
    if (process.env.NODE_ENV === "development") {
        return true;
    }

    return false;
}

/**
 * Returns admin metadata for stamping replies and audits.
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
