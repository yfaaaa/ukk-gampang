'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
    children: React.ReactNode;
    /** Role yang diizinkan mengakses rute ini (bisa berupa string atau array string) */
    requiredRole?: string | string[];
}

export default function AuthGuard({ children, requiredRole }: AuthGuardProps) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

    useEffect(() => {
        // 1. Ambil kredensial dari localStorage
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role') || '';

        // 2. Validasi Autentikasi: Jika belum login, redirect ke halaman Login
        if (!token) {
            router.replace('/login');
            return;
        }

        // 3. Normalisasi Role: Menangani toleransi role dari backend (admin / admin_space)
        let allowedRoles: string[] = [];

        if (Array.isArray(requiredRole)) {
            allowedRoles = requiredRole;
        } else if (requiredRole === 'admin') {
            // Menoleransi role admin dari berbagai format backend UKK
            allowedRoles = ['admin', 'admin_space', 'ADMIN'];
        } else if (requiredRole) {
            allowedRoles = [requiredRole];
        }

        // 4. Validasi Otorisasi: Jika role tidak sesuai, lemparkan ke katalog spaces
        if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
            console.warn(`[AuthGuard] Akses ditolak. Role user: "${role}", Role dibutuhkan:`, allowedRoles);
            router.replace('/spaces');
            return;
        }

        // 5. Akses diberikan
        setIsAuthorized(true);
    }, [router, requiredRole]);

    // Tampilan Loading indikator sembari memvalidasi hak akses (mencegah blink/kelempar)
    if (!isAuthorized) {
        return (
            <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans">
                <div className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-semibold text-slate-600 tracking-wide">
                        Memeriksa Hak Akses Admin...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}