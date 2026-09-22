'use client';

import { useState, useEffect, use } from 'react';
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

export default function ETicketPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const reservationId = resolvedParams.id;
    const router = useRouter();

    const [ticket, setTicket] = useState<Reservation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                // Ambil data reservasi dari LocalStorage
                const rawReservations =
                    localStorage.getItem('user_reservations') ||
                    localStorage.getItem('reservations') ||
                    '[]';
                const list: Reservation[] = JSON.parse(rawReservations);

                // Cari reservasi yang sesuai dengan ID di URL
                const found = list.find((item) => String(item.id) === String(reservationId));

                if (found) {
                    setTicket(found);
                } else {
                    // Fallback jika ID tidak ditemukan (membuat data dummy sementara)
                    setTicket({
                        id: reservationId,
                        pemesan: 'User Member',
                        nama_space: 'Ruang Kerja Coworking',
                        tanggal_sewa: new Date().toISOString().split('T')[0],
                        jam_mulai: '09:00 WIB',
                        durasi: 2,
                        total_tagihan: 50000,
                        status: 'TERKONFIRMASI',
                    });
                }
            } catch (err) {
                console.error('Gagal memuat e-ticket:', err);
            } finally {
                setLoading(false);
            }
        }
    }, [reservationId]);

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
                <p className="text-slate-500 font-medium">Memuat E-Ticket...</p>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
                <p className="text-slate-700 font-bold mb-4">E-Ticket Tidak Ditemukan!</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                    Kembali
                </button>
            </div>
        );
    }

    const namaPemesan = ticket.pemesan || 'User Member';
    const namaSpace = ticket.nama_space || ticket.ruangan || 'Space Coworking';
    const tanggal = ticket.tanggal_sewa || ticket.tanggal || '-';
    const jam = ticket.jam_mulai || ticket.waktu || '09:00 WIB';
    const durasi = ticket.durasi || 1;
    const total = Number(ticket.total_tagihan || ticket.total_harga || 0);
    const status = (ticket.status || 'MENUNGGU KONFIRMASI').toUpperCase();

    const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        `${currentHost}/e-ticket/${ticket.id}`
    )}`;

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 flex flex-col items-center justify-center print:bg-white print:p-0">
            {/* Navigasi / Tombol Aksi (Sembunyi saat diprint) */}
            <div className="max-w-md w-full flex items-center justify-between mb-6 print:hidden">
                <button
                    onClick={() => router.back()}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
                >
                    ← Kembali
                </button>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                    🖨️ Cetak / Simpan PDF
                </button>
            </div>

            {/* KARTU E-TICKET */}
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none">

                {/* Header Ticket */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-md">
                                E-Ticket Pass
                            </span>
                            <h1 className="text-xl font-black mt-2 leading-tight">{namaSpace}</h1>
                        </div>
                        <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${status.includes('LUNAS') || status.includes('SETUJU') || status.includes('BERHASIL')
                                    ? 'bg-emerald-400 text-slate-900'
                                    : 'bg-amber-400 text-slate-900'
                                }`}
                        >
                            {status}
                        </span>
                    </div>
                    <p className="text-xs text-blue-100 mt-3 font-mono">ID: #{ticket.id}</p>
                </div>

                {/* Garis Potong Tiket (Dotted Tear Line) */}
                <div className="relative bg-white h-4 border-b-2 border-dashed border-slate-200">
                    <div className="absolute -left-3 -top-2 w-6 h-6 bg-slate-100 rounded-full print:hidden"></div>
                    <div className="absolute -right-3 -top-2 w-6 h-6 bg-slate-100 rounded-full print:hidden"></div>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="text-slate-400 block font-medium">Nama Pemesan</span>
                            <strong className="text-slate-800 text-sm font-extrabold">{namaPemesan}</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-medium">Tanggal Sewa</span>
                            <strong className="text-slate-800 text-sm font-extrabold">{tanggal}</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-medium">Waktu Mulai</span>
                            <strong className="text-slate-800 font-bold">{jam}</strong>
                        </div>
                        <div>
                            <span className="text-slate-400 block font-medium">Durasi Sewa</span>
                            <strong className="text-slate-800 font-bold">{durasi} Jam</strong>
                        </div>
                    </div>

                    {ticket.kode_voucher && (
                        <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-xs flex justify-between items-center text-emerald-800">
                            <span>Voucher Digunakan:</span>
                            <strong className="font-extrabold uppercase">{ticket.kode_voucher}</strong>
                        </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Total Pembayaran</span>
                        <span className="text-lg font-black text-blue-600">{formatRupiah(total)}</span>
                    </div>

                    {/* QR Code Section */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col items-center justify-center space-y-2">
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-2xl">
                            <img
                                src={qrCodeUrl}
                                alt="QR Code E-Ticket"
                                className="w-32 h-32 object-contain"
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium text-center">
                            Tunjukkan QR Code ini kepada petugas/admin saat berada di lokasi.
                        </p>
                    </div>
                </div>

                {/* Footer Tiket */}
                <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                        Terima Kasih Telah Memesan di CoworkLuxe
                    </p>
                </div>

            </div>
        </div>
    );
}