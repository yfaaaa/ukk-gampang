'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
// Sesuaikan path import AuthGuard di bawah ini dengan lokasi file AuthGuard kamu
import AuthGuard from '@/components/common/AuthGuard';

const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Ruangan & Meja', href: '/admin/spaces' },
    { name: 'Data Reservasi', href: '/admin/reservasi' },
    { name: 'Data Member', href: '/admin/members' },
    { name: 'Voucher Diskon', href: '/admin/diskon' },
    { name: 'Laporan Keuangan', href: '/admin/laporan' },
    { name: 'Profil Pengelola', href: '/admin/profile' },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
        }
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">

            {/* ==================== HEADER TOPBAR (KHUSUS MOBILE/HP) ==================== */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex items-center justify-between md:hidden shadow-xs">
                <div className="flex items-center gap-3">
                    {/* Tombol Hamburger */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition duration-200 focus:outline-none"
                        aria-label="Toggle Navigation Menu"
                    >
                        {isMobileMenuOpen ? (
                            // Icon Tutup (X)
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            // Icon Hamburger (Garis 3)
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>

                    <span className="font-extrabold text-slate-900 text-sm tracking-tight">Workspace Admin</span>
                </div>

                <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 transition"
                >
                    Keluar
                </button>
            </header>

            {/* ==================== DRAWER MENU SLIDE-IN (KHUSUS MOBILE/HP) ==================== */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    {/* Backdrop Gelap dengan Blur */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    {/* Panel Menu Samping */}
                    <div className="relative bg-white w-72 max-w-[80%] h-full shadow-2xl flex flex-col justify-between p-6 z-10 animate-in slide-in-from-left duration-300">
                        <div>
                            {/* Header Drawer */}
                            <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                                <div>
                                    <h2 className="text-base font-black text-slate-900">Workspace Admin</h2>
                                    <p className="text-[11px] text-slate-400 font-medium">Panel Manajemen Coworking</p>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Items Menu Mobile */}
                            <nav className="mt-5 space-y-1">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center px-4 py-3 text-xs font-bold rounded-xl transition ${isActive
                                                    ? 'bg-slate-900 text-white shadow-sm'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Footer Logout Drawer */}
                        <div className="pt-4 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition border border-red-100"
                            >
                                Keluar / Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== SIDEBAR (KHUSUS DESKTOP) ==================== */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen p-6 shrink-0">
                <div className="mb-8">
                    <h1 className="text-lg font-black text-slate-900 tracking-tight">Workspace Admin</h1>
                    <div className="h-1 w-12 bg-slate-900 rounded-full mt-2"></div>
                </div>

                <nav className="flex-1 space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-xs font-bold rounded-xl transition ${isActive
                                        ? 'bg-slate-900 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="pt-6 border-t border-slate-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 text-slate-700 font-bold text-xs rounded-xl hover:bg-red-50 hover:text-red-600 transition border border-slate-200/80"
                    >
                        <span>Keluar / Logout</span>
                        <span className="text-slate-400">→</span>
                    </button>
                </div>
            </aside>

            {/* ==================== CONTENT AREA ==================== */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header Desktop Topbar */}
                <header className="hidden md:flex items-center justify-between bg-white px-8 py-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-slate-600">Panel Manajemen Coworking</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-xs font-bold text-red-500 hover:text-red-600 transition"
                    >
                        Keluar / Logout
                    </button>
                </header>

                {/* Isi Halaman Admin */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
            </div>

        </div>
    );
}

// Pembungkusan dengan AuthGuard untuk Proteksi Role
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard requiredRole="admin">
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AuthGuard>
    );
}