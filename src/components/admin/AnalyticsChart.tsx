'use client';

interface DailyVisit {
    date: string;
    count: number;
}

export default function AnalyticsChart({ data }: { data: DailyVisit[] }) {
    const max = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="bg-white dark:bg-[#0c0a09] p-6 rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm h-full">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-6">Traffic Trend</h3>
            
            <div className="flex h-64 w-full gap-2 items-stretch pb-6">
                {data.map((item, i) => {
                    const heightPercent = (item.count / max) * 100;
                    
                    // Logic: Show last 7 days on desktop, last 5 days on mobile.
                    // Indices are 0..N-1. Oldest is 0.
                    const cutoffDesktop = data.length - 7;
                    const cutoffMobile = data.length - 5;
                    
                    const isVisibleDesktop = i >= cutoffDesktop;
                    const isVisibleMobile = i >= cutoffMobile;

                    let visibilityClass = 'flex';
                    if (!isVisibleDesktop) {
                        visibilityClass = 'hidden';
                    } else if (!isVisibleMobile) {
                        visibilityClass = 'hidden md:flex';
                    }

                    return (
                        <div key={i} className={`flex-1 flex-col items-center justify-end gap-2 group ${visibilityClass}`}>
                            <div className="w-full relative flex-1 flex items-end">
                                <div 
                                    className="w-full bg-orange-500/20 dark:bg-orange-500/60 hover:bg-orange-500 dark:hover:bg-orange-500 rounded-t transition-all relative group-hover:shadow-[0_0_20px_-5px_orange] group-hover:opacity-100"
                                    style={{ height: `${heightPercent}%` }}
                                >
                                     {/* Tooltip */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 dark:bg-white text-white dark:text-black text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                        {item.count} views
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono -rotate-45 origin-top-left translate-y-4 whitespace-nowrap md:rotate-0 md:translate-y-0 md:origin-center">
                                {item.date}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
