'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false); // State toggle menu mobile

    const navItems = [
        { name: 'Katalog Space', href: '/spaces' },
        { name: 'Pesanan Saya', href: '/my-reservations' },
        { name: 'Histori', href: '/history' },
        { name: 'Profil', href: '/profile' },
    ];

    const handleLogout = () => {
        if (confirm('Yakin ingin keluar?')) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('user_session');
                localStorage.removeItem('active_user');
                window.dispatchEvent(new Event('storage'));
            }
            router.push('/login');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* FLOATING NAVBAR (GLASSMORPHISM) */}
            <header className="fixed top-0 left-0 right-0 z-50 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4">
                <nav className="flex items-center justify-between px-5 py-3 bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm rounded-full">
                    
                    {/* Logo Brand */}
                    <Link href="/spaces" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shadow-md group-hover:scale-105 transition-transform">
                            Y
                        </div>
                        <span className="text-base sm:text-lg font-black tracking-wider text-slate-900 uppercase">
                            YAHYA<span className="text-blue-600 font-light">LUXE</span>
                        </span>
                    </Link>

                    {/* Navigasi Menu Tengah (Tampil di Desktop) */}
                    <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/60">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                                        isActive
                                            ? 'bg-white text-blue-600 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Akses Kanan: Tombol Keluar (Desktop) & Hamburger (Mobile) */}
                    <div className="flex items-center gap-2">
                        {/* Tombol Keluar Desktop */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:block px-5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200/60 rounded-full shadow-xs transition-all cursor-pointer"
                        >
                            Keluar
                        </button>

                        {/* Tombol Hamburger Mobile */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle Menu"
                            className="md:hidden p-2 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-full transition focus:outline-none cursor-pointer"
                        >
                            {isOpen ? (
                                /* Icon Close (X) */
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                /* Icon Hamburger */
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>

                </nav>

                {/* Dropdown Menu Mobile */}
                {isOpen && (
                    <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-4 shadow-xl space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
                        {navItems.map((item) => {
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                            : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}

                        <div className="pt-2 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    handleLogout();
                                }}
                                className="w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
                            >
                                Keluar
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Page Content */}
            <main className="flex-1">{children}</main>
        </div>
    );
}