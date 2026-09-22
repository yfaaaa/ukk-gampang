'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();

    // Daftar menu disesuaikan persis dengan struktur folder app/admin/
    const navItems = [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Ruangan & Meja', href: '/admin/spaces' },
        { label: 'Data Reservasi', href: '/admin/reservasi' },
        { label: 'Data Member', href: '/admin/members' },
        { label: 'Voucher Diskon', href: '/admin/diskon' },
        { label: 'Laporan Keuangan', href: '/admin/laporan' },
        { label: 'Profil Pengelola', href: '/admin/profile' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between hidden md:flex min-h-screen">
            <div>
                <div className="text-lg font-bold text-slate-900 mb-8 border-b pb-4">
                    Workspace Admin
                </div>
                <nav className="space-y-2 text-sm font-medium">
                    {navItems.map((item) => {
                        // Mengecek apakah menu ini sedang dibuka
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-3 py-2 rounded-lg transition-colors ${isActive
                                        ? 'bg-slate-900 text-white font-semibold'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t pt-4 text-xs text-slate-400">
                Logged in as Administrator
            </div>
        </aside>
    );
}