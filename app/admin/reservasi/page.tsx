'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface Reservation {
    id: string;
    pemesan?: string;
    nama_space?: string;
    ruangan?: string;
    tanggal_sewa?: string;
    tanggal?: string;
    jam_mulai?: string;
    waktu?: string;
    durasi?: number | string;
    total_harga?: number | string;
    total_tagihan?: number | string;
    bukti_transfer?: string;
    bukti?: string;
    struk?: string;
    status?: string;
}

export default function AdminReservasiPage() {
    const router = useRouter();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // BACA LANGSUNG DARI LOCALSTORAGE
    const loadReservations = () => {
        if (typeof window === 'undefined') return;

        try {
            const rawData = localStorage.getItem('user_reservations') || localStorage.getItem('reservations');
            if (rawData) {
                const parsed = JSON.parse(rawData);
                if (Array.isArray(parsed)) {
                    setReservations(parsed);
                    return;
                }
            }
            setReservations([]);
        } catch (error) {
            console.error("Gagal membaca data reservasi:", error);
            setReservations([]);
        }
    };

    useEffect(() => {
        loadReservations();

        window.addEventListener('storage', loadReservations);
        window.addEventListener('reservation-updated', loadReservations);

        return () => {
            window.removeEventListener('storage', loadReservations);
            window.removeEventListener('reservation-updated', loadReservations);
        };
    }, []);

    // UPDATE STATUS & SIMPAN KEMBALI KE LOCALSTORAGE
    const handleUpdateStatus = (id: string, newStatus: string) => {
        const updatedList = reservations.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item
        );

        setReservations(updatedList);

        if (typeof window !== 'undefined') {
            localStorage.setItem('user_reservations', JSON.stringify(updatedList));
            localStorage.setItem('reservations', JSON.stringify(updatedList));

            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('reservation-updated'));
        }
    };

    // BERSIHKAN DATA
    const handleClearData = () => {
        if (confirm('Yakin mau menghapus semua data reservasi?')) {
            localStorage.removeItem('user_reservations');
            localStorage.removeItem('reservations');
            localStorage.removeItem('admin_reservations');
            setReservations([]);
        }
    };

    const formatRupiah = (val: any) => {
        const num = Number(val) || 0;
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 p-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                    <div>
                        <h1 className="text-xl font-black text-slate-900">Verifikasi Reservasi Member</h1>
                        <p className="text-xs text-slate-400 mt-1">Periksa bukti transfer dan konfirmasi pembayaran dari pengguna.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => router.push('/admin/reservasi/scan')}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            📷 Scan QR
                        </button>
                        <button
                            onClick={handleClearData}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                        >
                            🗑️ Bersihkan Data
                        </button>
                        <button
                            onClick={loadReservations}
                            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer"
                        >
                            Refresh Data
                        </button>
                    </div>
                </div>

                {/* Tabel */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="text-slate-400 font-extrabold border-b border-slate-100 uppercase text-[10px] tracking-wider">
                                <th className="py-3 px-2">KODE / ID</th>
                                <th className="py-3 px-2">PEMESAN</th>
                                <th className="py-3 px-2">RUANGAN</th>
                                <th className="py-3 px-2">TANGGAL & JAM</th>
                                <th className="py-3 px-2">TOTAL BAYAR</th>
                                <th className="py-3 px-2">STRUK TRANSFER</th>
                                <th className="py-3 px-2">STATUS</th>
                                <th className="py-3 px-2 text-center">AKSI VERIFIKASI</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {reservations.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-slate-400 font-bold">
                                        Belum ada data reservasi masuk dari user.
                                    </td>
                                </tr>
                            ) : (
                                reservations.map((item) => {
                                    const idDisplay = item.id.startsWith('#') ? item.id : `#${item.id}`;
                                    const namaPemesan = item.pemesan || 'User Member';
                                    const namaRuangan = item.nama_space || item.ruangan || 'Ruang Kerja';
                                    const tgl = item.tanggal_sewa || item.tanggal || '-';
                                    const jam = item.jam_mulai || item.waktu || '09:00 - 14:00';
                                    const total = item.total_tagihan || item.total_harga || 0;
                                    const imageSrc = item.bukti_transfer || item.bukti || item.struk;

                                    const statusRaw = item.status || 'Menunggu Konfirmasi';
                                    const statusUpper = statusRaw.toUpperCase();

                                    const isApproved = statusUpper.includes('APPROV') || statusUpper.includes('SETUJU') || statusUpper.includes('TERKONFIRMASI');
                                    const isRejected = statusUpper.includes('REJECT') || statusUpper.includes('TOLAK') || statusUpper.includes('BATAL');

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3.5 px-2 font-black text-blue-600">{idDisplay}</td>
                                            <td className="py-3.5 px-2 font-bold text-slate-900">{namaPemesan}</td>
                                            <td className="py-3.5 px-2 font-bold text-slate-800">{namaRuangan}</td>
                                            <td className="py-3.5 px-2 text-slate-500">{tgl} ({jam})</td>
                                            <td className="py-3.5 px-2 font-black text-slate-900">{formatRupiah(total)}</td>
                                            
                                            <td className="py-3.5 px-2">
                                                <button
                                                    onClick={() => {
                                                        if (imageSrc) {
                                                            setPreviewImage(imageSrc);
                                                        } else {
                                                            alert('User belum menyertakan link/foto bukti transfer!');
                                                        }
                                                    }}
                                                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-[11px] border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                                                >
                                                    🖼️ Lihat Struk
                                                </button>
                                            </td>

                                            <td className="py-3.5 px-2">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider ${isApproved
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : isRejected
                                                                ? 'bg-rose-100 text-rose-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}
                                                >
                                                    {statusUpper}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-2 text-center">
                                                {isApproved ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(item.id, 'Ditolak')}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 font-bold rounded-lg text-[11px] border border-slate-200 transition cursor-pointer"
                                                    >
                                                        Ubah Ditolak
                                                    </button>
                                                ) : isRejected ? (
                                                    <button
                                                        onClick={() => handleUpdateStatus(item.id, 'Disetujui')}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 font-bold rounded-lg text-[11px] border border-slate-200 transition cursor-pointer"
                                                    >
                                                        Ubah Disetujui
                                                    </button>
                                                ) : (
                                                    <div className="flex justify-center gap-1.5">
                                                        <button
                                                            onClick={() => handleUpdateStatus(item.id, 'Disetujui')}
                                                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
                                                        >
                                                            Setujui
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(item.id, 'Ditolak')}
                                                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
                                                        >
                                                            Tolak
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* MODAL POPUP PREVIEW GAMBAR STRUK */}
            {previewImage && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="bg-white rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl border border-slate-100 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <h3 className="font-extrabold text-slate-800 text-sm">Pratinjau Bukti Transfer</h3>
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full font-bold flex items-center justify-center text-xs transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-auto rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                            <img
                                src={previewImage}
                                alt="Bukti Transfer"
                                className="max-w-full max-h-[50vh] object-contain rounded-xl shadow-xs"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/png?text=Link+Gambar+Tidak+Valid';
                                }}
                            />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <a
                                href={previewImage}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                            >
                                🔗 Buka di Tab Baru
                            </a>
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}