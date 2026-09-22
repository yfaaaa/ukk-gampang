'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Space {
    id: string | number;
    nama?: string;
    nama_space?: string;
    tipe?: string;
    harga?: number | string;
    harga_per_jam?: number | string;
    kapasitas?: number | string;
    fasilitas?: string;
    deskripsi?: string;
    gambar?: string;
    foto?: string;
    image?: string;
}

interface Reservation {
    id: string;
    space_id?: string;
    pemesan?: string;
    nama_space?: string;
    nama?: string; // Fix: Ditambahkan agar tidak merah di TypeScript
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

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

const defaultSpacesList: Space[] = [
    {
        id: '459',
        nama: 'MEJA FAHMI',
        nama_space: 'MEJA FAHMI',
        tipe: 'MEETING_ROOM',
        harga: 1000000,
        kapasitas: 20,
        fasilitas: 'AC ADEM, Proyektor, WiFi Kencang',
        gambar: DEFAULT_IMAGE,
    },
    {
        id: '455',
        nama: 'MEJA YAHYA',
        nama_space: 'MEJA YAHYA',
        tipe: 'PRIVATE_OFFICE',
        harga: 10,
        kapasitas: 10,
        fasilitas: 'AC, Meja Kerja Privat, Papan Tulis',
        gambar: DEFAULT_IMAGE,
    },
    {
        id: '430',
        nama: 'Meja',
        nama_space: 'Meja',
        tipe: 'PRIVATE_OFFICE',
        harga: 10,
        kapasitas: 10,
        fasilitas: 'ac ac an, Stopkontak, Kursi Ergonomis',
        gambar: DEFAULT_IMAGE,
    },
];

export default function SpaceDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const router = useRouter();

    const resolvedParams = 'then' in params ? use(params) : params;
    const spaceId = resolvedParams.id;

    const [space, setSpace] = useState<Space | null>(null);
    const [loading, setLoading] = useState(true);

    const [todayStr, setTodayStr] = useState('');
    const [tanggalSewa, setTanggalSewa] = useState('');
    const [jamMulai, setJamMulai] = useState('09:00');
    const [durasi, setDurasi] = useState(1);
    const [kodeVoucher, setKodeVoucher] = useState('');
    const [diskonPersen, setDiskonPersen] = useState(0);
    const [voucherStatus, setVoucherStatus] = useState('');

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setTodayStr(today);
        setTanggalSewa(today);
    }, []);

    const fetchDetailSpace = async () => {
        setLoading(true);

        let apiList: Space[] = [];
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
            const res = await axios.get('https://learn.smktelkom-mlg.sch.id/coworking/api/spaces', {
                headers: {
                    'x-maker-key': process.env.NEXT_PUBLIC_MAKER_KEY || 'app_key_siswa',
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = res.data.data || res.data;
            if (Array.isArray(data)) apiList = data;
        } catch {
            // Offline Mode
        }

        let localList: Space[] = [];
        let customPhotos: Record<string, string> = {};

        if (typeof window !== 'undefined') {
            try {
                const rawAdmin = localStorage.getItem('admin_spaces') || localStorage.getItem('spaces') || '[]';
                localList = JSON.parse(rawAdmin);
            } catch {
                localList = [];
            }

            try {
                const rawPhotos = localStorage.getItem('custom_spaces_photos');
                if (rawPhotos) customPhotos = JSON.parse(rawPhotos);
            } catch {
                customPhotos = {};
            }
        }

        const allSpaces = [...localList, ...apiList, ...defaultSpacesList];
        const found = allSpaces.find((s) => String(s.id) === String(spaceId));

        if (found) {
            const photoSaved = customPhotos[String(spaceId)];
            const finalPhoto = photoSaved || found.gambar || found.foto || found.image || DEFAULT_IMAGE;

            setSpace({
                ...found,
                nama: found.nama || found.nama_space || `Space #${spaceId}`,
                harga: found.harga ?? found.harga_per_jam ?? 0,
                gambar: finalPhoto,
                foto: finalPhoto,
            });
        } else {
            setSpace({
                id: spaceId,
                nama: `Space ID #${spaceId}`,
                tipe: 'PERSONAL_DESK',
                harga: 50000,
                kapasitas: 5,
                fasilitas: 'Fasilitas standar coworking space',
                gambar: customPhotos[String(spaceId)] || DEFAULT_IMAGE,
            });
        }

        setLoading(false);
    };

    useEffect(() => {
        if (spaceId) {
            fetchDetailSpace();
        }
    }, [spaceId]);

    const handleApplyVoucher = () => {
        setVoucherStatus('');
        if (!kodeVoucher.trim()) return;

        if (!tanggalSewa) {
            setVoucherStatus('⚠️ Pilih tanggal sewa terlebih dahulu sebelum menggunakan voucher!');
            return;
        }

        const codeUpper = kodeVoucher.trim().toUpperCase();
        const selectedBookingDate = new Date(tanggalSewa);
        selectedBookingDate.setHours(0, 0, 0, 0);

        let foundVoucher: any = null;

        if (typeof window !== 'undefined') {
            try {
                const rawVouchers = localStorage.getItem('admin_vouchers') || localStorage.getItem('vouchers') || '[]';
                const vouchers = JSON.parse(rawVouchers);
                foundVoucher = vouchers.find(
                    (v: any) => String(v.kode || v.nama || v.nama_diskon).toUpperCase() === codeUpper
                );
            } catch (e) {
                console.error(e);
            }
        }

        if (!foundVoucher) {
            if (codeUpper === 'YF69' || codeUpper === 'DISKON10') {
                foundVoucher = {
                    kode: codeUpper,
                    diskon: 10,
                    tanggal_awal: '2026-09-20',
                    tanggal_akhir: '2026-10-21',
                };
            } else if (codeUpper === 'PROMO50') {
                foundVoucher = {
                    kode: 'PROMO50',
                    diskon: 50,
                    tanggal_awal: '2026-01-01',
                    tanggal_akhir: '2026-12-31',
                };
            }
        }

        if (!foundVoucher) {
            setDiskonPersen(0);
            setVoucherStatus('❌ Kode voucher tidak ditemukan.');
            return;
        }

        const rawStart = foundVoucher.tanggal_awal || foundVoucher.start_date || foundVoucher.berlaku_dari;
        const rawEnd = foundVoucher.tanggal_akhir || foundVoucher.end_date || foundVoucher.berlaku_sampai;

        if (rawStart) {
            const startDate = new Date(rawStart);
            startDate.setHours(0, 0, 0, 0);
            if (selectedBookingDate < startDate) {
                setDiskonPersen(0);
                setVoucherStatus(`❌ Voucher "${codeUpper}" belum berlaku untuk tanggal sewa ini!`);
                return;
            }
        }

        if (rawEnd) {
            const endDate = new Date(rawEnd);
            endDate.setHours(23, 59, 59, 999);
            if (selectedBookingDate > endDate) {
                setDiskonPersen(0);
                setVoucherStatus(`❌ Voucher "${codeUpper}" sudah kedaluwarsa (kadaluarsa)!`);
                return;
            }
        }

        const potongan = Number(foundVoucher.diskon || foundVoucher.potongan || foundVoucher.persentase || 10);
        setDiskonPersen(potongan);
        setVoucherStatus(`✅ Voucher "${codeUpper}" dipasang (Diskon ${potongan}%)!`);
    };

    const hargaPerJam = Number(space?.harga || space?.harga_per_jam || 0);
    const subtotal = hargaPerJam * durasi;
    const potonganHarga = (subtotal * diskonPersen) / 100;
    const totalBayar = Math.max(0, subtotal - potonganHarga);

    const getAllExistingReservations = (): Reservation[] => {
        if (typeof window === 'undefined') return [];
        try {
            const raw1 = localStorage.getItem('user_reservations');
            const raw2 = localStorage.getItem('reservations');
            const raw3 = localStorage.getItem('admin_reservations');

            const list1: Reservation[] = raw1 ? JSON.parse(raw1) : [];
            const list2: Reservation[] = raw2 ? JSON.parse(raw2) : [];
            const list3: Reservation[] = raw3 ? JSON.parse(raw3) : [];

            const combined = [
                ...(Array.isArray(list1) ? list1 : []),
                ...(Array.isArray(list2) ? list2 : []),
                ...(Array.isArray(list3) ? list3 : []),
            ];

            const map = new Map<string, Reservation>();
            combined.forEach((item) => {
                if (item && item.id) {
                    map.set(String(item.id), item);
                }
            });

            return Array.from(map.values());
        } catch (e) {
            console.error(e);
            return [];
        }
    };

    // FUNGSI UTAMA BOOKING + VALIDASI TANGGAL LAMPAU & BENTROK
    const handleBooking = (e: React.FormEvent) => {
        e.preventDefault();

        if (!tanggalSewa) {
            alert('Pilih tanggal sewa terlebih dahulu!');
            return;
        }

        // 1. VALIDASI: PENCEGAHAN TANGGAL LAMPAU (SEBELUM HARI INI)
        const selectedBookingDate = new Date(tanggalSewa);
        selectedBookingDate.setHours(0, 0, 0, 0);

        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        if (selectedBookingDate < todayDate) {
            alert(`⚠️ MAAF, TANGGAL SUDAH LEWAT!\n\nTanggal sewa (${tanggalSewa}) sudah berlalu. Silakan pilih tanggal hari ini atau tanggal yang akan datang!`);
            return;
        }

        if (typeof window !== 'undefined') {
            try {
                const existingList = getAllExistingReservations();

                const [reqHour, reqMin] = jamMulai.split(':').map(Number);
                const reqStartInMin = reqHour * 60 + reqMin;
                const reqEndInMin = reqStartInMin + durasi * 60;

                const reqSpaceId = String(spaceId || space?.id || '').trim().toLowerCase();
                const reqSpaceName = String(space?.nama || space?.nama_space || '').trim().toLowerCase();

                // 2. VALIDASI: BENTROK JADWAL (FIXED)
                const conflictItem = existingList.find((res) => {
                    const status = String(res.status || '').toUpperCase();

                    // Abaikan jika reservasi sudah ditolak / dibatalkan
                    if (
                        status.includes('TOLAK') ||
                        status.includes('BATAL') ||
                        status.includes('REJECT') ||
                        status.includes('CANCEL') ||
                        status.includes('DECLINE')
                    ) {
                        return false;
                    }

                    const resSpaceId = String(res.space_id || '').trim().toLowerCase();
                    const resSpaceName = String(res.nama_space || res.ruangan || res.nama || '').trim().toLowerCase();

                    // Pencocokan ruangan secara eksak (Bukan lagi .includes yang bikin false-positive)
                    let isSameSpace = false;
                    if (reqSpaceId && resSpaceId) {
                        isSameSpace = (reqSpaceId === resSpaceId);
                    } else if (reqSpaceName && resSpaceName) {
                        isSameSpace = (reqSpaceName === resSpaceName);
                    }

                    const resDate = String(res.tanggal_sewa || res.tanggal || '').trim();
                    const isSameDate = (resDate === tanggalSewa);

                    // Jika ruangan & tanggal sama, cek apakah jamnya bertabrakan/overlap
                    if (isSameSpace && isSameDate) {
                        const rawTime = String(res.jam_mulai || res.waktu || '09:00');
                        const cleanTime = rawTime.replace(/[^0-9:]/g, '');
                        const parts = cleanTime.split(':');

                        const resHour = Number(parts[0]) || 0;
                        const resMin = Number(parts[1]) || 0;

                        const resStartInMin = resHour * 60 + resMin;
                        const resDurasi = Number(res.durasi || 1);
                        const resEndInMin = resStartInMin + resDurasi * 60;

                        // Rumus Overlap Jam: (StartA < EndB) AND (EndA > StartB)
                        return reqStartInMin < resEndInMin && reqEndInMin > resStartInMin;
                    }

                    return false;
                });

                if (conflictItem) {
                    alert(`⚠️ MAAF, JADWAL BENTROK!\n\nRuangan "${space?.nama || 'Space'}" pada Tanggal ${tanggalSewa} Jam ${jamMulai} WIB sudah dipesan sebelumnya.\n\nSilakan pilih Tanggal, Jam, atau Ruangan lain!`);
                    return;
                }

                // SIMPAN RESERVASI BARU
                const userRaw = localStorage.getItem('user');
                const userData = userRaw ? JSON.parse(userRaw) : null;
                const namaPemesan = userData?.nama || userData?.email?.split('@')[0] || 'User Member';

                const newReservation: Reservation = {
                    id: `RES-${Date.now()}`,
                    space_id: String(spaceId),
                    pemesan: namaPemesan,
                    nama_space: space?.nama || space?.nama_space || 'Space Coworking',
                    ruangan: space?.nama || space?.nama_space || 'Space Coworking',
                    tanggal_sewa: tanggalSewa,
                    tanggal: tanggalSewa,
                    jam_mulai: `${jamMulai} WIB`,
                    waktu: `${jamMulai} WIB`,
                    durasi: Number(durasi),
                    total_tagihan: totalBayar,
                    total_harga: totalBayar,
                    bukti_transfer: '',
                    bukti: '',
                    struk: '',
                    status: 'Menunggu Pembayaran',
                    kode_voucher: diskonPersen > 0 ? kodeVoucher.toUpperCase() : undefined,
                };

                const updatedList = [newReservation, ...existingList];

                localStorage.setItem('user_reservations', JSON.stringify(updatedList));
                localStorage.setItem('reservations', JSON.stringify(updatedList));
                localStorage.setItem('admin_reservations', JSON.stringify(updatedList));

                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('reservation-updated'));

                alert(`✅ Reservasi untuk ${space?.nama} BERHASIL DIBUAT!\n\nSilakan upload bukti transfer di halaman "Pesanan Saya".`);
                router.push('/my-reservations');

            } catch (err) {
                console.error(err);
                alert('Terjadi kesalahan saat memproses reservasi.');
            }
        }
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">Memuat detail space...</div>;
    }

    const namaSpace = space?.nama || space?.nama_space || 'Meja Space';
    const photoUrl = space?.gambar || space?.foto || space?.image || DEFAULT_IMAGE;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-6">
            <div className="max-w-5xl mx-auto space-y-6">

                <button
                    onClick={() => router.push('/spaces')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 transition flex items-center gap-1 cursor-pointer"
                >
                    ← Kembali ke Katalog
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Sisi Kiri */}
                    <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100">
                            <img
                                src={photoUrl}
                                alt={namaSpace}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                                }}
                            />
                            <span className="absolute top-4 left-4 px-3 py-1 bg-slate-900/80 text-white text-[10px] font-black rounded-lg uppercase">
                                {space?.tipe || 'MEETING_ROOM'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-start">
                                <h1 className="text-2xl font-black text-slate-900">{namaSpace}</h1>
                                <div className="text-right">
                                    <span className="text-xl font-black text-blue-600">{formatRupiah(hargaPerJam)}</span>
                                    <span className="text-xs text-slate-400 font-bold">/jam</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="text-slate-400 font-medium block">Kapasitas</span>
                                    <strong className="text-slate-800 font-bold">{space?.kapasitas || 10} Orang</strong>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-medium block">Fasilitas</span>
                                    <strong className="text-slate-800 font-bold">{space?.fasilitas || space?.deskripsi || 'Standar Coworking'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sisi Kanan: Form Booking */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 self-start">
                        <h2 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
                            Formulir Reservasi Space
                        </h2>

                        <form onSubmit={handleBooking} className="space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Tanggal Sewa *</label>
                                <input
                                    type="date"
                                    min={todayStr}
                                    value={tanggalSewa}
                                    onChange={(e) => setTanggalSewa(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Jam Mulai</label>
                                    <select
                                        value={jamMulai}
                                        onChange={(e) => setJamMulai(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                                    >
                                        <option value="08:00">08:00 WIB</option>
                                        <option value="09:00">09:00 WIB</option>
                                        <option value="10:00">10:00 WIB</option>
                                        <option value="11:00">11:00 WIB</option>
                                        <option value="13:00">13:00 WIB</option>
                                        <option value="14:00">14:00 WIB</option>
                                        <option value="15:00">15:00 WIB</option>
                                        <option value="16:00">16:00 WIB</option>
                                        <option value="17:00">17:00 WIB</option>
                                        <option value="18:00">18:00 WIB</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Durasi (Jam)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={12}
                                        value={durasi}
                                        onChange={(e) => setDurasi(Math.max(1, Number(e.target.value)))}
                                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Kode Promo / Voucher</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="CONTOH: YF69"
                                        value={kodeVoucher}
                                        onChange={(e) => setKodeVoucher(e.target.value)}
                                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 uppercase outline-none focus:border-blue-600 focus:bg-white transition"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyVoucher}
                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer"
                                    >
                                        Pakai
                                    </button>
                                </div>
                                {voucherStatus && <p className="text-[11px] font-bold mt-1.5 text-slate-600">{voucherStatus}</p>}
                            </div>

                            <div className="pt-3 border-t border-slate-100 space-y-1.5">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal:</span>
                                    <span className="font-bold text-slate-800">{formatRupiah(subtotal)}</span>
                                </div>
                                {diskonPersen > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Diskon ({diskonPersen}%):</span>
                                        <span>-{formatRupiah(potonganHarga)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-100">
                                    <span className="font-extrabold text-slate-900">Total Bayar:</span>
                                    <span className="text-base font-black text-blue-600">{formatRupiah(totalBayar)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition cursor-pointer mt-2"
                            >
                                Lanjutkan Pemesanan
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}