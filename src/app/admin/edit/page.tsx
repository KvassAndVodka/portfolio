import { getFileContent, saveFileContent } from "@/actions";
import { redirect } from "next/navigation";

// Next.js 15+ params/searchParams are async
export default async function EditPage({
    searchParams,
}: {
    searchParams: Promise<{ file?: string }>;
}) {
    // 1. Get the file path from URL
    const { file } = await searchParams;

    if (!file) {
        return <div className="p-8">Please select a file to edit.</div>;
    }

    // 2. Fetch content (Server-Side)
    let content = "";
    try {
        content = await getFileContent(file);
    } catch (e) {
        return <div className="p-8 text-red-500">Error loading file: {file}</div>;
    }

    // 3. Render the Form
    return (
        <div className="max-w-6xl mx-auto p-4 h-screen flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-mono text-stone-500">Editing: <span className="text-black font-bold">{file}</span></h1>
                <a href="/admin" className="text-sm underline">Back to Dashboard</a>
            </div>

            <form
                action={async (formData) => {
                    "use server";
                    const newContent = formData.get("content") as string;
                    await saveFileContent(file, newContent);
                    redirect("/admin"); // Go back after save
                }}
                className="flex-1 flex flex-col"
            >
                <textarea
                    name="content"
                    className="flex-1 w-full bg-stone-900 text-stone-100 font-mono p-4 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={content}
                    spellCheck={false}
                />
                <div className="mt-4 flex justify-end">
                    <button
                        type="submit"
                        className="bg-black text-white px-6 py-3 rounded font-bold hover:bg-stone-800 transition"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}