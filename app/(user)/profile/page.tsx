'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState({
        id: '1297',
        nama: 'Fahmi User',
        email: 'user@coworkluxe.com',
        telepon: '081234567890',
        role: 'USER MEMBER',
        joined: '20 September 2026'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(user);

    // BACA DATA USER DARI MULTI-KEY LOCALSTORAGE
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedUser =
                localStorage.getItem('user') ||
                localStorage.getItem('user_session') ||
                localStorage.getItem('active_user');

            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    
                    // Bersihkan nama agar tidak angka '1'
                    let validNama = parsed.nama || parsed.name || parsed.username || 'Fahmi User';
                    if (validNama === '1') validNama = 'Fahmi User';

                    const validRole =
                        parsed.role && parsed.role.toUpperCase() !== 'ADMIN'
                            ? parsed.role
                            : 'USER MEMBER';

                    const updatedData = {
                        ...parsed,
                        id: parsed.id || '1297',
                        nama: validNama,
                        email: parsed.email || 'user@coworkluxe.com',
                        telepon: parsed.telepon || '081234567890',
                        role: validRole,
                        joined: parsed.joined || '20 September 2026',
                    };

                    setUser((prev) => ({ ...prev, ...updatedData }));
                    setForm((prev) => ({ ...prev, ...updatedData }));
                } catch (e) {
                    console.error('Error parse user session:', e);
                }
            }
        }
    }, []);

    // SIMPAN PERUBAHAN & SINKRONKAN KE SELURUH SISTEM
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.nama.trim()) {
            alert('Nama Lengkap tidak boleh kosong!');
            return;
        }

        const updated = {
            ...user,
            ...form,
            nama: form.nama.trim(),
            email: form.email.trim(),
            telepon: form.telepon.trim(),
        };

        setUser(updated);

        if (typeof window !== 'undefined') {
            // 1. Simpan Session User
            localStorage.setItem('user', JSON.stringify(updated));
            localStorage.setItem('user_session', JSON.stringify(updated));

            // 2. Sinkronkan ke Data Member Admin (registered_members)
            try {
                const rawMembers = localStorage.getItem('registered_members') || '[]';
                let membersList: any[] = JSON.parse(rawMembers);

                const index = membersList.findIndex(
                    (m) => String(m.id) === String(updated.id) || m.email === updated.email
                );

                if (index !== -1) {
                    membersList[index] = { ...membersList[index], ...updated };
                } else {
                    membersList.unshift(updated);
                }
                localStorage.setItem('registered_members', JSON.stringify(membersList));
            } catch (err) {
                console.error('Error sync registered_members:', err);
            }

            // 3. Update nama pemesan di seluruh riwayat reservasi
            try {
                const rawRes =
                    localStorage.getItem('user_reservations') ||
                    localStorage.getItem('reservations') ||
                    '[]';
                let resList: any[] = JSON.parse(rawRes);

                const updatedResList = resList.map((item) => {
                    if (String(item.pemesan) === '1' || item.pemesan === user.nama) {
                        return { ...item, pemesan: updated.nama };
                    }
                    return item;
                });

                localStorage.setItem('user_reservations', JSON.stringify(updatedResList));
                localStorage.setItem('reservations', JSON.stringify(updatedResList));
                localStorage.setItem('admin_reservations', JSON.stringify(updatedResList));
            } catch (err) {
                console.error('Error sync reservations:', err);
            }

            // Trigger Event Realtime Listener
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('members-updated'));
            window.dispatchEvent(new Event('reservation-updated'));
        }

        setIsEditing(false);
        alert('Profil berhasil diperbarui!');
    };

    // LOGOUT BERSIH
    const handleLogout = () => {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                localStorage.removeItem('user_session');
                localStorage.removeItem('active_user');
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('user_role');
                window.dispatchEvent(new Event('storage'));
            }
            router.push('/login');
        }
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 px-4 sm:px-6 pt-28 md:pt-32 pb-16 flex justify-center items-start">
            <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                
                {/* Header Profil User */}
                <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                        {user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-xl font-black text-slate-900 truncate">{user.nama}</h1>
                        <p className="text-xs text-slate-400 font-bold mt-0.5 truncate">{user.email}</p>
                        <span className="inline-block mt-2 bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                            {user.role || 'USER MEMBER'}
                        </span>
                    </div>
                </div>

                {/* Content / Form Edit */}
                {isEditing ? (
                    <form onSubmit={handleSave} className="space-y-4 text-xs">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">Nama Lengkap</label>
                            <input
                                type="text"
                                value={form.nama}
                                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">Nomor Telepon / WA</label>
                            <input
                                type="text"
                                value={form.telepon}
                                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                            />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition text-xs shadow-md shadow-blue-500/20 cursor-pointer"
                            >
                                Simpan Perubahan
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setForm(user);
                                    setIsEditing(false);
                                }}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs cursor-pointer"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4 text-xs">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-500 font-medium">Nama Lengkap</span>
                                <span className="font-bold text-slate-800">{user.nama}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-500 font-medium">Email</span>
                                <span className="font-bold text-slate-800">{user.email}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-200/60 pb-2">
                                <span className="text-slate-500 font-medium">No. Telepon / WA</span>
                                <span className="font-bold text-slate-800">{user.telepon}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Bergabung Sejak</span>
                                <span className="font-bold text-slate-800">{user.joined}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition text-xs shadow-sm cursor-pointer"
                            >
                                Edit Profil
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-2xl transition text-xs cursor-pointer"
                            >
                                Keluar Akun
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}