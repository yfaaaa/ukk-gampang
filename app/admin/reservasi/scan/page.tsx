'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Reservation {
    id: string;
    pemesan?: string;
    nama_space?: string;
    ruangan?: string;
    tanggal_sewa?: string;
    tanggal?: string;
    jam_mulai?: string;
    waktu?: string;
    durasi?: number;
    total_tagihan?: number;
    total_harga?: number;
    status?: string;
    kode_voucher?: string;
}

export default function AdminScanPage() {
    const router = useRouter();
    const [scanInput, setScanInput] = useState('');
    const [result, setResult] = useState<Reservation | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleVerify = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setErrorMsg('');
        setResult(null);

        const raw = scanInput.trim();
        if (!raw) {
            setErrorMsg('Masukkan atau Scan QR Code / ID Reservasi terlebih dahulu!');
            return;
        }

        // Ekstrak ID dari Teks QR Code
        let targetId = raw;
        if (raw.includes('E-TICKET:')) {
            const match = raw.match(/E-TICKET:([^|]+)/);
            if (match && match[1]) {
                targetId = match[1];
            }
        }

        if (typeof window !== 'undefined') {
            try {
                const rawReservations =
                    localStorage.getItem('user_reservations') ||
                    localStorage.getItem('reservations') ||
                    '[]';
                const list: Reservation[] = JSON.parse(rawReservations);

                // Cari berdasarkan ID
                const found = list.find((item) => String(item.id).toUpperCase() === targetId.toUpperCase());

                if (found) {
                    setResult(found);
                } else {
                    setErrorMsg(`Reservasi dengan ID "${targetId}" tidak ditemukan dalam database!`);
                }
            } catch (err) {
                console.error(err);
                setErrorMsg('Terjadi kesalahan saat membaca database.');
            }
        }
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-start pt-12 space-y-6">
            
            {/* Header & Input Box */}
            <div className="max-w-xl w-full bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-black text-slate-900">🔍 Verifikasi & Scan E-Ticket</h1>
                        <p className="text-xs text-slate-500">Scan QR Code atau tempel ID Reservasi untuk cek status tiket.</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 transition"
                    >
                        ← Kembali
                    </button>
                </div>

                <form onSubmit={handleVerify} className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Contoh: RES-1789897276500 atau tempel teks QR"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                    <button
                        type="submit"
                        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition cursor-pointer whitespace-nowrap"
                    >
                        Verifikasi
                    </button>
                </form>

                {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl text-center">
                        ⚠️ {errorMsg}
                    </div>
                )}
            </div>

            {/* KARTU DETAIL HASIL SCAN (KEREN) */}
            {result && (
                <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all animate-fadeIn">
                    
                    {/* Header Card dengan Tanda Status */}
                    <div className={`p-6 text-white flex justify-between items-start ${
                        (result.status || '').toUpperCase().includes('TOLAK') || (result.status || '').toUpperCase().includes('BATAL')
                            ? 'bg-gradient-to-r from-rose-600 to-red-700'
                            : (result.status || '').toUpperCase().includes('SETUJU') || (result.status || '').toUpperCase().includes('LUNAS') || (result.status || '').toUpperCase().includes('BERHASIL')
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600'
                    }`}>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md">
                                Hasil Verifikasi Tiket
                            </span>
                            <h2 className="text-2xl font-black mt-2 uppercase">{result.nama_space || result.ruangan || 'SPACE'}</h2>
                            <p className="text-xs text-white/80 font-mono mt-1">ID: #{result.id}</p>
                        </div>

                        {/* Badges Status Besar */}
                        <div className="bg-white/90 text-slate-900 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md">
                            {(result.status || 'MENUNGGU KONFIRMASI').toUpperCase()}
                        </div>
                    </div>

                    {/* Rincian Detail Tiket */}
                    <div className="p-6 space-y-4 text-slate-700">
                        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div>
                                <span className="text-slate-400 block font-medium">Nama Pemesan</span>
                                <strong className="text-slate-900 text-sm font-extrabold">{result.pemesan || 'User Member'}</strong>
                            </div>
                            <div>
                                <span className="text-slate-400 block font-medium">Tanggal Sewa</span>
                                <strong className="text-slate-900 text-sm font-extrabold">{result.tanggal_sewa || result.tanggal || '-'}</strong>
                            </div>
                            <div className="pt-2">
                                <span className="text-slate-400 block font-medium">Waktu Mulai</span>
                                <strong className="text-slate-900 font-bold">{result.jam_mulai || result.waktu || '09:00 WIB'}</strong>
                            </div>
                            <div className="pt-2">
                                <span className="text-slate-400 block font-medium">Durasi Sewa</span>
                                <strong className="text-slate-900 font-bold">{result.durasi || 1} Jam</strong>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-xs text-slate-500 font-bold">Total Pembayaran</span>
                            <span className="text-xl font-black text-blue-600">
                                {formatRupiah(Number(result.total_tagihan || result.total_harga || 0))}
                            </span>
                        </div>

                        {/* Status Pesan Peringatan */}
                        {(result.status || '').toUpperCase().includes('TOLAK') ? (
                            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl text-center">
                                ❌ TIKET DITOLAK — User tidak diizinkan masuk ke ruangan.
                            </div>
                        ) : (result.status || '').toUpperCase().includes('SETUJU') || (result.status || '').toUpperCase().includes('LUNAS') ? (
                            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl text-center">
                                ✅ TIKET VALID — User diizinkan masuk ruang kerja.
                            </div>
                        ) : (
                            <div className="p-3 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl text-center">
                                ⏳ MENUNGGU KONFIRMASI — Harap setujui/konfirmasi pembayaran lebih dulu.
                            </div>
                        )}
                    </div>

                </div>
            )}

        </div>
    );
}