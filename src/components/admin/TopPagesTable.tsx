import Link from 'next/link';
import { FaExternalLinkAlt } from 'react-icons/fa';

interface PageStat {
    path: string;
    views: number;
}

export default function TopPagesTable({ pages }: { pages: PageStat[] }) {
    return (
        <div className="bg-white dark:bg-[#0c0a09] p-6 rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-6">Top Content</h3>
            
            <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="text-stone-400 border-b border-stone-100 dark:border-white/5">
                            <th className="pb-3 pl-2 font-medium">Rank</th>
                            <th className="pb-3 font-medium">Page</th>
                            <th className="pb-3 pr-2 text-right font-medium">Views</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-white/5">
                        {pages.map((page, i) => (
                            <tr key={page.path} className="group hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                                <td className="py-3 pl-2 text-stone-400 font-mono text-xs w-12">#{i + 1}</td>
                                <td className="py-3 font-medium text-stone-700 dark:text-stone-300">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate max-w-[150px] md:max-w-[200px]" title={page.path}>{page.path}</span>
                                        <Link href={page.path} target="_blank" className="text-stone-300 hover:text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-all">
                                            <FaExternalLinkAlt size={10} />
                                        </Link>
                                    </div>
                                </td>
                                <td className="py-3 pr-2 text-right font-mono font-bold text-stone-900 dark:text-stone-100">
                                    {page.views.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {pages.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-10 text-center text-stone-400">No data yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
