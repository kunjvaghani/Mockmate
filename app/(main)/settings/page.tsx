import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Settings</h1>
            <UserProfile
                appearance={{
                    elements: {
                        rootBox: "w-full",
                        card: "shadow-lg rounded-2xl border-0",
                    },
                }}
            />
        </div>
    );
}
