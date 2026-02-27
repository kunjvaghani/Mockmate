import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
