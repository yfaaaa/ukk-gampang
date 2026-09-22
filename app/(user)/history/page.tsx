'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

// KOMPONEN UNTUK EFEK SCROLL REVEAL (SMOOTH FADE-UP SAAT SCROLL)
function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        const currentRef = domRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, []);

    return (
        <div
            ref={domRef}
            className={`transition-all duration-700 ease-out transform ${
                isVisible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
            } ${className}`}
        >
            {children}
        </div>
    );
}

export default function HistoryPage() {
    const [reservations, setReservations] = useState<any[]>([]);
    const [selectedBulan, setSelectedBulan] = useState<string>('all');
    const [selectedTahun, setSelectedTahun] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [selectedDetail, setSelectedDetail] = useState<any | null>(null);

    // Helper untuk membaca properti yang berbeda-beda nama key-nya dari localStorage/API
    const getKode = (item: any) =>
        item.kodeBooking || item.kode_booking || item.code || item.id || 'RES-17900';

    const getNama = (item: any) =>
        item.namaSpace ||
        item.nama_space ||
        item.spaceName ||
        item.space_name ||
        item.space?.nama ||
        item.space?.name ||
        'MEJA FAHMI';

    const getTanggal = (item: any) =>
        item.tanggalSewa || item.tanggal_sewa || item.tanggal || item.date || '2026-09-22';

    const getJam = (item: any) =>
        item.jamSewa || item.jam_sewa || item.jam || item.time || '09:00 WIB - 17:00';

    const getHarga = (item: any) =>
        Number(
            item.totalHarga ||
            item.total_harga ||
            item.totalTagihan ||
            item.total_tagihan ||
            item.harga ||
            item.total ||
            0
        );

    const getStatus = (item: any) => item.status || 'Ditolak';

    // 1. Load Data dari LocalStorage
    useEffect(() => {
        const loadData = () => {
            try {
                const localData =
                    localStorage.getItem('user_reservations') ||
                    localStorage.getItem('reservations');
                if (localData) {
                    setReservations(JSON.parse(localData));
                } else {
                    // Fallback data simulasi jika kosong
                    const mockData = [
                        {
                            id: '1',
                            kode_booking: 'RES-1790044956218',
                            nama_space: 'MEJA FAHMI',
                            tanggal_sewa: '2026-11-22',
                            jam_sewa: '09:00 WIB - 17:00',
                            total_tagihan: 1000000,
                            status: 'Ditolak',
                        },
                        {
                            id: '2',
                            kode_booking: 'RES-1790044991451',
                            nama_space: 'MEJA FAHMI',
                            tanggal_sewa: '2026-09-23',
                            jam_sewa: '09:00 WIB - 17:00',
                            total_tagihan: 900000,
                            status: 'Ditolak',
                        },
                        {
                            id: '3',
                            kode_booking: 'RES-1790044976593',
                            nama_space: 'MEJA FAHMI',
                            tanggal_sewa: '2026-09-22',
                            jam_sewa: '09:00 WIB - 17:00',
                            total_tagihan: 1000000,
                            status: 'Disetujui',
                        },
                    ];
                    setReservations(mockData);
                }
            } catch (err) {
                console.error('Error loading history:', err);
            }
        };

        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

    // 2. Filter & Urutkan Transaksi
    const filteredReservations = useMemo(() => {
        return reservations
            .filter((item) => {
                const tgl = getTanggal(item);
                if (!tgl) return true;
                const dateObj = new Date(tgl);
                const monthIndex = dateObj.getMonth() + 1;
                const yearNumber = dateObj.getFullYear();

                if (selectedBulan !== 'all' && monthIndex !== parseInt(selectedBulan)) {
                    return false;
                }
                if (selectedTahun !== 'all' && yearNumber !== parseInt(selectedTahun)) {
                    return false;
                }
                return true;
            })
            .sort((a, b) => {
                const timeA = new Date(getTanggal(a)).getTime() || 0;
                const timeB = new Date(getTanggal(b)).getTime() || 0;
                return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
            });
    }, [reservations, selectedBulan, selectedTahun, sortOrder]);

    // 3. KALKULASI TOTAL PENGELUARAN (Abaikan Ditolak / Dibatalkan)
    const totalPengeluaran = useMemo(() => {
        return filteredReservations
            .filter((item) => {
                const statusLower = String(getStatus(item)).toLowerCase();
                return (
                    statusLower !== 'ditolak' &&
                    statusLower !== 'dibatalkan' &&
                    statusLower !== 'rejected' &&
                    statusLower !== 'canceled'
                );
            })
            .reduce((sum, item) => sum + getHarga(item), 0);
    }, [filteredReservations]);

    // Badge Status Rendering dengan indikator berkedip
    const renderStatusBadge = (statusStr: string) => {
        const st = String(statusStr).toLowerCase();
        if (st === 'disetujui' || st === 'selesai' || st === 'approved' || st === 'lunas') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Disetujui
                </span>
            );
        }
        if (st === 'ditolak' || st === 'rejected') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-rose-50 border border-rose-200/60 text-rose-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Ditolak
                </span>
            );
        }
        if (st === 'dibatalkan' || st === 'canceled') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-amber-50 border border-amber-200/60 text-amber-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Dibatalkan
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-sky-50 border border-sky-200/60 text-sky-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                Menunggu
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* HEADER TITLE & TOTAL PENGELUARAN (Diperbaiki jarak pt-28 agar tidak tertutup Navbar Melayang) */}
                <ScrollReveal>
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-1">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
                                    Transaction History
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Histori Transaksi
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium">
                                Rekam jejak dan riwayat pemesanan tempat kerja kamu secara terstruktur.
                            </p>
                        </div>

                        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 md:min-w-[250px] text-left md:text-right shadow-xs">
                            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
                                TOTAL PENGELUARAN (FILTERED)
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Rp {totalPengeluaran.toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                </ScrollReveal>

                {/* FILTER BAR */}
                <ScrollReveal>
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-bold">Bulan:</span>
                                <select
                                    value={selectedBulan}
                                    onChange={(e) => setSelectedBulan(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-bold transition cursor-pointer"
                                >
                                    <option value="all">Semua Bulan</option>
                                    <option value="1">Januari</option>
                                    <option value="2">Februari</option>
                                    <option value="3">Maret</option>
                                    <option value="4">April</option>
                                    <option value="5">Mei</option>
                                    <option value="6">Juni</option>
                                    <option value="7">Juli</option>
                                    <option value="8">Agustus</option>
                                    <option value="9">September</option>
                                    <option value="10">Oktober</option>
                                    <option value="11">November</option>
                                    <option value="12">Desember</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-bold">Tahun:</span>
                                <select
                                    value={selectedTahun}
                                    onChange={(e) => setSelectedTahun(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-bold transition cursor-pointer"
                                >
                                    <option value="all">Semua Tahun</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                    <option value="2027">2027</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-bold">Urutkan:</span>
                            <select
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 font-bold transition cursor-pointer"
                            >
                                <option value="newest">Terbaru → Terlama</option>
                                <option value="oldest">Terlama → Terbaru</option>
                            </select>
                        </div>
                    </div>
                </ScrollReveal>

                {/* DAFTAR KARTU TRANSAKSI */}
                <div className="space-y-3">
                    {filteredReservations.length === 0 ? (
                        <ScrollReveal>
                            <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 space-y-2 shadow-xs">
                                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-xl text-slate-400 mb-2">
                                    🔍
                                </div>
                                <p className="text-sm font-bold text-slate-700">Tidak ada riwayat transaksi ditemukan</p>
                                <p className="text-xs text-slate-400">Coba ubah opsi filter bulan atau tahun kamu.</p>
                            </div>
                        </ScrollReveal>
                    ) : (
                        filteredReservations.map((item, idx) => {
                            const kode = getKode(item);
                            const nama = getNama(item);
                            const tanggal = getTanggal(item);
                            const jam = getJam(item);
                            const harga = getHarga(item);
                            const status = getStatus(item);

                            return (
                                <ScrollReveal key={item.id || kode || idx}>
                                    <div className="group bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-0.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                    #{kode}
                                                </span>
                                                {renderStatusBadge(status)}
                                            </div>
                                            <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-wide">
                                                {nama}
                                            </h3>
                                            <p className="text-xs text-slate-500 font-medium">
                                                Sewa: <span className="font-bold text-slate-700">{tanggal}</span>{' '}
                                                <span className="text-slate-400">({jam})</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                                            <div className="text-left md:text-right">
                                                <span className="text-[10px] font-extrabold text-slate-400 uppercase block tracking-wider">
                                                    Total Tagihan
                                                </span>
                                                <span className="text-lg font-black text-blue-600">
                                                    Rp {harga.toLocaleString('id-ID')}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => setSelectedDetail(item)}
                                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all cursor-pointer active:scale-95 shadow-xs"
                                            >
                                                Cek Pesanan
                                            </button>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            );
                        })
                    )}
                </div>

            </div>

            {/* MODAL DETAIL PESANAN (WITH BACKDROP BLUR & ANIMATION) */}
            {selectedDetail && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedDetail(null)}
                >
                    <div
                        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 border border-slate-100 animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900">Detail Pesanan</h3>
                                <p className="text-[11px] font-mono text-slate-400">#{getKode(selectedDetail)}</p>
                            </div>
                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-xs transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-400 font-medium">Nama Space</span>
                                <span className="font-bold text-slate-800 uppercase">{getNama(selectedDetail)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-400 font-medium">Tanggal Sewa</span>
                                <span className="font-semibold text-slate-700">{getTanggal(selectedDetail)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100">
                                <span className="text-slate-400 font-medium">Jam Operasional</span>
                                <span className="font-semibold text-slate-700">{getJam(selectedDetail)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-slate-100 items-center">
                                <span className="text-slate-400 font-medium">Status Transaksi</span>
                                <div>{renderStatusBadge(getStatus(selectedDetail))}</div>
                            </div>
                            <div className="flex justify-between items-center py-3 bg-blue-50/70 border border-blue-100/80 px-4 rounded-2xl mt-2">
                                <span className="font-extrabold text-slate-700">Total Tagihan</span>
                                <span className="font-black text-blue-600 text-base">
                                    Rp {getHarga(selectedDetail).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedDetail(null)}
                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}