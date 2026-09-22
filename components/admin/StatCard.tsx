interface StatCardProps {
    title: string;
    value: string | number;
    color?: string;
}

export default function StatCard({ title, value, color = 'text-slate-900' }: StatCardProps) {
    return (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase">{title}</span>
            <div className={`text-2xl font-bold mt-2 ${color}`}>{value}</div>
        </div>
    );
}