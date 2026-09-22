'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

const defaultSpacesList: Space[] = [
    {
        id: '459',
        nama: 'MEJA FAHMI',
        tipe: 'MEETING_ROOM',
        harga: 1000000,
        kapasitas: 20,
        fasilitas: 'AC ADEM, Proyektor, Wi-Fi Dedicated',
        gambar: DEFAULT_IMAGE,
    },
    {
        id: '455',
        nama: 'MEJA YAHYA',
        tipe: 'PRIVATE_OFFICE',
        harga: 10,
        kapasitas: 10,
        fasilitas: 'AC, Meja Kerja Privat, Papan Tulis Glass',
        gambar: DEFAULT_IMAGE,
    },
    {
        id: '430',
        nama: 'Meja Utama',
        tipe: 'PRIVATE_OFFICE',
        harga: 10,
        kapasitas: 10,
        fasilitas: 'Stopkontak Dedicated, Kursi Ergonomis',
        gambar: DEFAULT_IMAGE,
    },
];

// KOMPONEN UNTUK EFEK SCROLL REVEAL (MUNCUL/HILANG SAAT SCROLL)
function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.15 }
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
            className={`transition-all duration-700 ease-out transform ${isVisible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-16 scale-95 pointer-events-none'
                } ${className}`}
        >
            {children}
        </div>
    );
}

export default function CatalogSpacesPage() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    const fetchSpacesData = async () => {
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
            // Fallback jika API gagal
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

        const map = new Map<string, Space>();

        [...localList, ...apiList, ...defaultSpacesList].forEach((item) => {
            const idStr = String(item.id);
            if (!map.has(idStr)) {
                const photoSaved = customPhotos[idStr];
                const finalPhoto = photoSaved || item.gambar || item.foto || item.image || DEFAULT_IMAGE;

                map.set(idStr, {
                    ...item,
                    nama: item.nama || item.nama_space || `Space #${idStr}`,
                    harga: item.harga ?? item.harga_per_jam ?? 0,
                    gambar: finalPhoto,
                });
            }
        });

        setSpaces(Array.from(map.values()));
        setLoading(false);
    };

    useEffect(() => {
        fetchSpacesData();
    }, []);

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    // LOGIKA FILTER DENGAN DUKUNGAN KATEGORI DESK / PERSONAL_DESK
    const filteredSpaces = spaces.filter((item) => {
        const namaMatch = (item.nama || '').toLowerCase().includes(searchQuery.toLowerCase());
        const rawTipe = (item.tipe || '').toUpperCase().trim();

        let tipeMatch = false;
        if (selectedCategory === 'ALL') {
            tipeMatch = true;
        } else if (selectedCategory === 'PERSONAL_DESK') {
            tipeMatch = rawTipe === 'PERSONAL_DESK' || rawTipe === 'DESK' || rawTipe === 'PERSONAL DESK';
        } else {
            tipeMatch = rawTipe === selectedCategory;
        }

        return namaMatch && tipeMatch;
    });

    return (
        <div className="min-h-screen w-full bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white pb-20">

            {/* HEADER HALAMAN */}
            <section className="pt-28 pb-6 px-4 sm:px-6 max-w-6xl mx-auto">
                <ScrollReveal>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/80 pb-8">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full">
                                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
                                    Workspace Catalog
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                Katalog Ruang Kerja
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-sm max-w-md">
                                Pilih tempat kerja fleksibel dan produktif sesuai kebutuhanmu.
                            </p>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input
                                type="text"
                                placeholder="Cari nama ruangan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-blue-600 transition shadow-xs"
                            />

                            <div className="flex flex-wrap gap-1 p-1 bg-slate-200/60 rounded-2xl border border-slate-200">
                                {[
                                    { id: 'ALL', label: 'Semua' },
                                    { id: 'PERSONAL_DESK', label: 'Personal Desk' },
                                    { id: 'MEETING_ROOM', label: 'Meeting Room' },
                                    { id: 'PRIVATE_OFFICE', label: 'Private Office' },
                                ].map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${selectedCategory === cat.id
                                                ? 'bg-blue-600 text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                                            }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollReveal>
            </section>

            {/* GRID KATALOG RUANGAN */}
            <main className="px-4 sm:px-6 max-w-6xl mx-auto pt-4">
                {loading ? (
                    <div className="text-center py-20 text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">
                        Memuat data ruangan...
                    </div>
                ) : filteredSpaces.length === 0 ? (
                    <ScrollReveal>
                        <div className="w-full text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 space-y-2">
                            <p className="text-slate-700 text-sm font-bold">Tidak Ada Ruangan Ditemukan</p>
                            <p className="text-slate-400 text-xs max-w-sm mx-auto">
                                Belum ada data ruangan untuk kategori atau pencarian ini.
                            </p>
                        </div>
                    </ScrollReveal>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSpaces.map((item) => (
                            <ScrollReveal key={item.id}>
                                <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between h-full">
                                    {/* Gambar & Badge Tipe */}
                                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                        <img
                                            src={item.gambar}
                                            alt={item.nama}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                                            }}
                                        />
                                        <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black rounded-xl uppercase tracking-wider">
                                            {item.tipe || 'DESK'}
                                        </span>
                                    </div>

                                    {/* Info Ruangan */}
                                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                        <div className="space-y-1.5">
                                            <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                                {item.nama}
                                            </h3>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                {item.fasilitas || item.deskripsi || 'Fasilitas lengkap untuk produktivitas.'}
                                            </p>
                                        </div>

                                        {/* Kapasitas & Harga */}
                                        <div className="pt-3 border-t border-slate-100 space-y-3">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-400 font-medium">
                                                    Kapasitas: <strong className="text-slate-800">{item.kapasitas || 1} orang</strong>
                                                </span>
                                                <div className="text-right">
                                                    <span className="text-sm font-black text-blue-600">
                                                        {formatRupiah(Number(item.harga || 0))}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-bold"> /jam</span>
                                                </div>
                                            </div>

                                            {/* Tombol Detail & Pesan */}
                                            <Link
                                                href={`/spaces/${item.id}`}
                                                className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all active:scale-98"
                                            >
                                                Detail & Pesan Space
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </main>

        </div>
    );
}