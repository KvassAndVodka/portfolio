import { FaEye, FaUserFriends, FaChartLine } from 'react-icons/fa';

interface StatsProps {
    totalViews: number;
    uniqueVisitors: number;
    viewsToday: number;
}

export default function VisitorStatsCards({ totalViews, uniqueVisitors, viewsToday }: StatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                title="Total Views" 
                value={totalViews} 
                icon={<FaEye className="text-blue-500" />} 
                trend="All time"
            />
            <StatCard 
                title="Unique Visitors" 
                value={uniqueVisitors} 
                icon={<FaUserFriends className="text-purple-500" />} 
                trend="Distinct IPs"
            />
            <StatCard 
                title="Views Today" 
                value={viewsToday} 
                icon={<FaChartLine className="text-emerald-500" />} 
                trend="Since midnight"
            />
        </div>
    );
}

function StatCard({ title, value, icon, trend }: { title: string, value: number, icon: React.ReactNode, trend: string }) {
    return (
        <div className="bg-white dark:bg-[#0c0a09] p-6 rounded-2xl border border-stone-200 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-stone-50 dark:bg-white/5 rounded-xl">
                    {icon}
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-stone-900 dark:text-stone-100">{value.toLocaleString()}</h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm font-medium mt-1">{title}</p>
                <div className="mt-4 pt-4 border-t border-stone-100 dark:border-white/5 text-xs text-stone-400 font-mono">
                    {trend}
                </div>
            </div>
        </div>
    );
}
