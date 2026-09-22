'use client';

import { useState, useEffect, useRef } from 'react';
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
    bukti_transfer?: string;
    bukti?: string;
    struk?: string;
    status?: string;
    kode_voucher?: string;
}

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

export default function MyReservationsPage() {
    const router = useRouter();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // State Modal Upload Struk
    const [selectedResId, setSelectedResId] = useState<string | null>(null);
    const [inputStrukUrl, setInputStrukUrl] = useState<string>('');

    const loadReservations = () => {
        setLoading(true);
        if (typeof window !== 'undefined') {
            try {
                const rawData =
                    localStorage.getItem('user_reservations') ||
                    localStorage.getItem('reservations') ||
                    '[]';
                const parsed: Reservation[] = JSON.parse(rawData);
                setReservations(parsed);
            } catch (err) {
                console.error(err);
                setReservations([]);
            } finally {
                setLoading(false);
            }
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

    // SIMPAN / EDIT STRUK TRANSFER
    const handleSaveStruk = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedResId || !inputStrukUrl.trim()) return;

        const updated = reservations.map((item) => {
            if (item.id === selectedResId) {
                return {
                    ...item,
                    bukti_transfer: inputStrukUrl.trim(),
                    bukti: inputStrukUrl.trim(),
                    struk: inputStrukUrl.trim(),
                    status: 'Menunggu Konfirmasi', // Status otomatis berubah setelah upload
                };
            }
            return item;
        });

        setReservations(updated);

        if (typeof window !== 'undefined') {
            localStorage.setItem('user_reservations', JSON.stringify(updated));
            localStorage.setItem('reservations', JSON.stringify(updated));

            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new Event('reservation-updated'));
        }

        setSelectedResId(null);
        setInputStrukUrl('');
        alert('✅ Bukti transfer berhasil diunggah! Status berubah menjadi Menunggu Konfirmasi.');
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    // BADGE STATUS DENGAN INDIKATOR WARNA SMOOTH
    const renderStatusBadge = (statusRaw?: string) => {
        const status = (statusRaw || 'MENUNGGU PEMBAYARAN').toUpperCase();

        if (status.includes('SETUJU') || status.includes('LUNAS') || status.includes('BERHASIL')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    DISETUJUI
                </span>
            );
        }
        if (status.includes('BATAL') || status.includes('TOLAK')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200/60 text-rose-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    DITOLAK
                </span>
            );
        }
        if (status.includes('KONFIRMASI')) {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200/60 text-amber-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    MENUNGGU KONFIRMASI
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 border border-sky-200/60 text-sky-700 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                MENUNGGU PEMBAYARAN
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* HEADER HALAMAN (Diperbaiki jarak pt-28 agar tidak tertutup Navbar Melayang) */}
                <ScrollReveal>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full mb-1">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
                                    My Bookings & History
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Pesanan & Histori Saya
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-500 max-w-md">
                                Kelola jadwal penggunaan ruang kerja, upload bukti transfer, dan cetak E-Ticket.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/spaces')}
                            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center gap-2 self-start md:self-auto"
                        >
                            <span>+ Pesan Space Baru</span>
                        </button>
                    </div>
                </ScrollReveal>

                {/* DAFTAR RESERVASI */}
                {loading ? (
                    <div className="bg-white rounded-3xl p-16 text-center text-slate-400 font-bold text-xs uppercase tracking-widest border border-slate-200 animate-pulse">
                        Memuat data pesanan...
                    </div>
                ) : reservations.length === 0 ? (
                    <ScrollReveal>
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
                            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl">
                                📋
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-800 font-bold text-base">Belum Ada Reservasi</p>
                                <p className="text-slate-400 font-medium text-xs max-w-sm mx-auto">
                                    Kamu belum memiliki riwayat reservasi ruang kerja saat ini.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/spaces')}
                                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer active:scale-95 inline-block"
                            >
                                Jelajahi Katalog Space
                            </button>
                        </div>
                    </ScrollReveal>
                ) : (
                    <div className="space-y-4">
                        {reservations.map((item) => {
                            const namaSpace = item.nama_space || item.ruangan || 'Space Coworking';
                            const tanggal = item.tanggal_sewa || item.tanggal || '-';
                            const jam = item.jam_mulai || item.waktu || '09:00 WIB';
                            const durasi = item.durasi || 1;
                            const total = Number(item.total_tagihan || item.total_harga || 0);
                            const hasStruk = Boolean(item.bukti_transfer || item.bukti || item.struk);

                            return (
                                <ScrollReveal key={item.id}>
                                    <div className="group bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        
                                        {/* Left Info */}
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                    #{item.id}
                                                </span>
                                                {renderStatusBadge(item.status)}
                                                {item.kode_voucher && (
                                                    <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                        Voucher: {item.kode_voucher}
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                                                {namaSpace}
                                            </h3>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                                                <div>
                                                    <span className="text-slate-400 font-medium block">Tanggal</span>
                                                    <p className="font-bold text-slate-800 mt-0.5">{tanggal}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 font-medium block">Jam Mulai</span>
                                                    <p className="font-bold text-slate-800 mt-0.5">{jam}</p>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 font-medium block">Durasi</span>
                                                    <p className="font-bold text-slate-800 mt-0.5">{durasi} Jam</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Action & Price */}
                                        <div className="flex md:flex-col justify-between items-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                                            <div className="text-left md:text-right">
                                                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                                                    Total Tagihan
                                                </span>
                                                <span className="text-xl font-black text-blue-600">
                                                    {formatRupiah(total)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                {/* TOMBOL UPLOAD / EDIT STRUK */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedResId(item.id);
                                                        setInputStrukUrl(item.bukti_transfer || item.bukti || item.struk || '');
                                                    }}
                                                    className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                                                        hasStruk
                                                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                            : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 font-black'
                                                    }`}
                                                >
                                                    {hasStruk ? '✏️ Edit Struk' : '📤 Upload Struk'}
                                                </button>

                                                {/* TOMBOL LIHAT E-TICKET */}
                                                <button
                                                    onClick={() => router.push(`/e-ticket/${item.id}`)}
                                                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
                                                >
                                                    🎟️ Lihat E-Ticket
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            );
                        })}
                    </div>
                )}

            </div>

            {/* MODAL POPUP INPUT/EDIT LINK STRUK (WITH BACKDROP BLUR & SMOOTH FADE) */}
            {selectedResId && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setSelectedResId(null)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-base">Upload Bukti Transfer</h3>
                                <p className="text-[11px] text-slate-400">ID Pesanan: #{selectedResId}</p>
                            </div>
                            <button
                                onClick={() => setSelectedResId(null)}
                                className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full font-bold flex items-center justify-center text-xs transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveStruk} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="block font-bold text-slate-700">
                                    URL / Link Foto Struk Transfer <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="https://i.ibb.co/struk-tf.jpg"
                                    value={inputStrukUrl}
                                    onChange={(e) => setInputStrukUrl(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all"
                                    required
                                />
                                <p className="text-[10px] text-slate-400">
                                    Tempelkan URL langsung gambar bukti transfer pembayaran kamu di sini.
                                </p>
                            </div>

                            {inputStrukUrl && (
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                                    <img
                                        src={inputStrukUrl}
                                        alt="Preview Struk"
                                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shadow-xs"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/png?text=Link+Rusak';
                                        }}
                                    />
                                    <div>
                                        <span className="text-[11px] text-slate-800 font-bold block">Pratinjau Struk</span>
                                        <span className="text-[10px] text-slate-400">Pastikan gambar terlihat jelas</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedResId(null)}
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition cursor-pointer active:scale-95"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition cursor-pointer active:scale-95"
                                >
                                    Simpan Struk
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}