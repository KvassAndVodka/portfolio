import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-3xl font-bold">Mission Control</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-stone-500">{session.user.email}</span>
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/" });
                        }}
                    >
                        <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition">
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-stone-200 p-6 rounded bg-stone-50">
                    <h2 className="font-bold mb-2">System Status</h2>
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span>Operational</span>
                    </div>
                </div>

                {/* Placeholder for future Content Editor */}
                <div className="border border-dashed border-stone-300 p-6 rounded flex items-center justify-center text-stone-400">
                    Content Editor (Coming Soon)
                </div>
            </div>
        </div>
    );
}
