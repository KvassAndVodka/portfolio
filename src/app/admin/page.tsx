import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { getFiles } from "@/actions"; // Import the new action
import Link from 'next/link';

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    // Fetch the files
    const { posts, projects } = await getFiles();

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
                {/* STATUS CARD */}
                <div className="border border-stone-200 p-6 rounded bg-stone-50 h-fit">
                    <h2 className="font-bold mb-2">System Status</h2>
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span>Operational</span>
                    </div>
                </div>

                {/* CONTENT LIST */}
                <div className="border border-stone-200 p-6 rounded">
                    <h2 className="font-bold mb-4 text-xl">Content Manager</h2>
                    
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-stone-400 uppercase mb-2">Projects</h3>
                        <ul className="space-y-2">
                        {projects.map(f => (
                            <li key={f.path}>
                                <Link href={`/admin/edit?file=${f.path}`} className="block p-2 hover:bg-stone-100 rounded text-sm font-mono">
                                    {f.name}
                                </Link>
                            </li>
                        ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-stone-400 uppercase mb-2">Blog Posts</h3>
                        <ul className="space-y-2">
                        {posts.map(f => (
                            <li key={f.path}>
                                <Link href={`/admin/edit?file=${f.path}`} className="block p-2 hover:bg-stone-100 rounded text-sm font-mono">
                                    {f.name}
                                </Link>
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}