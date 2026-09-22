'use client';

import { useEffect, useState } from 'react';

export interface Reservation {
    id: string;
    pemesan?: string;
    nama_space?: string;
    ruangan?: string;
    tanggal_sewa?: string;
    tanggal_reservasi?: string;
    tanggal?: string;
    created_at?: string;
    total_harga?: number | string;
    total_tagihan?: number | string;
    total_bayar?: number | string;
    harga?: number | string;
    total?: number | string;
    status?: string;
}

// Helper Ekstraksi Nominal
export const parseNominal = (item: Reservation): number => {
    let raw = item.total_tagihan ?? item.total_harga ?? item.total_bayar ?? item.harga ?? item.total ?? 0;
    if (typeof raw === 'string') {
        raw = raw.replace(/[^0-9]/g, '');
    }
    const val = Number(raw);
    return isNaN(val) ? 0 : val;
};

// Helper Cek Status Approved
export const isApprovedStatus = (statusRaw?: string): boolean => {
    if (!statusRaw) return false;
    const s = statusRaw.toLowerCase();
    return s.includes('setuju') || s.includes('approv') || s.includes('terkonfirmasi') || s.includes('selesai');
};

export default function AdminLaporanPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [selectedMonth, setSelectedMonth] = useState('09');
    const [selectedYear, setSelectedYear] = useState('2026');

    const loadApprovedReservations = () => {
        if (typeof window === 'undefined') return;

        try {
            const storageKeys = [
                'user_reservations',
                'admin_reservasi',
                'reservasi',
                'data_reservasi',
                'laporan_reservasi',
                'reservasi_list'
            ];

            let dataLoaded: Reservation[] = [];
            for (const key of storageKeys) {
                const rawData = localStorage.getItem(key);
                if (rawData) {
                    const parsed = JSON.parse(rawData);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        dataLoaded = parsed;
                        break;
                    }
                }
            }
            setReservations(dataLoaded);
        } catch (err) {
            console.error("Gagal load laporan:", err);
            setReservations([]);
        }
    };

    useEffect(() => {
        loadApprovedReservations();

        window.addEventListener('storage', loadApprovedReservations);
        window.addEventListener('reservation-updated', loadApprovedReservations);

        return () => {
            window.removeEventListener('storage', loadApprovedReservations);
            window.removeEventListener('reservation-updated', loadApprovedReservations);
        };
    }, []);

    // FILTER TRANSAKSI YANG DISETUJUI & SESUAI PERIODE BULAN / TAHUN
    const approvedReservations = reservations.filter((item) => {
        if (!isApprovedStatus(item.status)) return false;

        const tglStr = String(item.tanggal_sewa || item.tanggal_reservasi || item.tanggal || item.created_at || '');
        if (!tglStr) return true;

        // Pemisah format YYYY-MM-DD
        const parts = tglStr.split('-');
        if (parts.length >= 2) {
            const year = parts[0];
            const month = parts[1];
            return year === selectedYear && month === selectedMonth;
        }

        return true;
    });

    // HITUNG TOTAL PENDAPATAN
    const totalPendapatan = approvedReservations.reduce((acc, curr) => {
        return acc + parseNominal(curr);
    }, 0);

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 p-6 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">

                {/* Header & Filter */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                        <h1 className="text-xl font-black text-slate-900">Rekapitulasi Keuangan</h1>
                        <p className="text-xs text-slate-400 mt-1">Laporan estimasi dan realisasi pendapatan per bulan.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-xl font-bold text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="01">Bulan 01 - Januari</option>
                            <option value="02">Bulan 02 - Februari</option>
                            <option value="03">Bulan 03 - Maret</option>
                            <option value="04">Bulan 04 - April</option>
                            <option value="05">Bulan 05 - Mei</option>
                            <option value="06">Bulan 06 - Juni</option>
                            <option value="07">Bulan 07 - Juli</option>
                            <option value="08">Bulan 08 - Agustus</option>
                            <option value="09">Bulan 09 - September</option>
                            <option value="10">Bulan 10 - Oktober</option>
                            <option value="11">Bulan 11 - November</option>
                            <option value="12">Bulan 12 - Desember</option>
                        </select>

                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-xs rounded-xl font-bold text-slate-700 outline-none cursor-pointer"
                        >
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>

                        <button
                            onClick={() => window.print()}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                        >
                            Cetak Laporan
                        </button>
                    </div>
                </div>

                {/* Ringkasan Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Pendapatan Bersih</span>
                        <div className="text-2xl font-black text-emerald-600">{formatRupiah(totalPendapatan)}</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Transaksi Selesai</span>
                        <div className="text-2xl font-black text-slate-800">{approvedReservations.length} Transaksi</div>
                    </div>
                </div>

                {/* Tabel Detail */}
                <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            RINCIAN TRANSAKSI RESERVASI ({selectedMonth}/{selectedYear})
                        </h2>
                        <span className="text-xs font-extrabold text-emerald-400">
                            Total {approvedReservations.length} Approved
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="text-slate-400 font-extrabold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                                    <th className="py-3 px-2">NO / ID</th>
                                    <th className="py-3 px-2">NAMA MEMBER</th>
                                    <th className="py-3 px-2">RUANGAN / MEJA</th>
                                    <th className="py-3 px-2">TANGGAL</th>
                                    <th className="py-3 px-2">TOTAL BAYAR</th>
                                    <th className="py-3 px-2">STATUS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
                                {approvedReservations.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-slate-500 font-bold">
                                            Belum ada transaksi yang disetujui (Approved) pada periode {selectedMonth}/{selectedYear}.
                                        </td>
                                    </tr>
                                ) : (
                                    approvedReservations.map((item, idx) => {
                                        const rawId = item.id || `RES-${idx + 1}`;
                                        const idDisplay = rawId.startsWith('#') ? rawId : `#${rawId}`;
                                        const pemesan = item.pemesan || 'User Member';
                                        const ruangan = item.nama_space || item.ruangan || 'Ruang Kerja';
                                        const tgl = item.tanggal_sewa || item.tanggal_reservasi || item.tanggal || '-';
                                        const total = parseNominal(item);

                                        return (
                                            <tr key={rawId} className="hover:bg-slate-800/50 transition">
                                                <td className="py-3 px-2 font-mono text-blue-400">{idDisplay}</td>
                                                <td className="py-3 px-2 font-bold text-white">{pemesan}</td>
                                                <td className="py-3 px-2">{ruangan}</td>
                                                <td className="py-3 px-2 text-slate-400">{tgl}</td>
                                                <td className="py-3 px-2 font-bold text-emerald-400">{formatRupiah(total)}</td>
                                                <td className="py-3 px-2">
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                        DISETUJUI
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}