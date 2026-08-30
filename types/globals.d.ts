export {};

export type UserRole = "admin" | "candidate" | "moderator";

declare global {
    interface CustomJwtSessionClaims {
        metadata?: {
            role?: UserRole;
        };
    }
}
   