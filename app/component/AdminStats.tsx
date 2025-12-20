"use client";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    gradient: string;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
}

function StatCard({ title, value, icon, gradient, change, changeType = "neutral" }: StatCardProps) {
    const changeColors = {
        positive: "text-green-600",
        negative: "text-red-600",
        neutral: "text-gray-600"
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-[var(--text-color)] mb-2">{value}</h3>
                    {change && (
                        <p className={`text-xs font-semibold ${changeColors[changeType]} flex items-center gap-1`}>
                            {changeType === "positive" && "↑"}
                            {changeType === "negative" && "↓"}
                            {change}
                        </p>
                    )}
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

interface AdminStatsProps {
    totalAccounts: number;
    activeToday: number;
    newThisWeek: number;
    growthRate: string;
}

export default function AdminStats({ totalAccounts, activeToday, newThisWeek, growthRate }: AdminStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
                title="Total Accounts"
                value={totalAccounts.toLocaleString()}
                gradient="from-blue-500 to-cyan-500"
                icon={
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                }
            />
            <StatCard
                title="Active Today"
                value={activeToday.toLocaleString()}
                gradient="from-green-500 to-teal-500"
                change="+12% from yesterday"
                changeType="positive"
                icon={
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
            />
            <StatCard
                title="New This Week"
                value={newThisWeek.toLocaleString()}
                gradient="from-purple-500 to-pink-500"
                change="+23% from last week"
                changeType="positive"
                icon={
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                }
            />
            <StatCard
                title="Growth Rate"
                value={growthRate}
                gradient="from-orange-500 to-red-500"
                change="Monthly average"
                changeType="neutral"
                icon={
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                }
            />
        </div>
    );
}
