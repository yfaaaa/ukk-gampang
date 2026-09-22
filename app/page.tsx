'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Space {
    id: string | number;
    nama?: string;
    nama_space?: string;
    tipe?: string;
    kategori?: string;
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

// Kosongkan array ini agar tidak ada data bentrok/duplikat dengan Admin Panel
const defaultSpacesList: Space[] = [];

// KOMPONEN UNTUK EFEK MUNCUL / HILANG AUTOMATIS SAAT SCROLL
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
            className={`transition-all duration-700 ease-out transform ${
                isVisible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-16 scale-95 pointer-events-none'
            } ${className}`}
        >
            {children}
        </div>
    );
}

export default function HomePage() {
    const router = useRouter();

    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [isModalAnimating, setIsModalAnimating] = useState(false);
    const [selectedSpaceName, setSelectedSpaceName] = useState('');

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
            // Offline fallback jika API gagal
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

        // Utamakan data dari Admin LocalStorage & API
        const activeList = [...localList, ...apiList];
        
        // Gunakan data aktif, jika tidak ada baru gunakan fallback
        const sourceList = activeList.length > 0 ? activeList : defaultSpacesList;

        const map = new Map<string, Space>();

        sourceList.forEach((item) => {
            const idStr = String(item.id);
            if (!map.has(idStr)) {
                const photoSaved = customPhotos[idStr];
                const finalPhoto = photoSaved || item.gambar || item.foto || item.image || DEFAULT_IMAGE;

                map.set(idStr, {
                    ...item,
                    nama: item.nama || item.nama_space || `Space #${idStr}`,
                    tipe: item.tipe || item.kategori || 'DESK',
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

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        setIsMenuOpen(false);
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const openModal = (namaSpace?: string) => {
        setSelectedSpaceName(namaSpace || '');
        setShowModal(true);
        setTimeout(() => setIsModalAnimating(true), 10);
    };

    const closeModal = () => {
        setIsModalAnimating(false);
        setTimeout(() => setShowModal(false), 250);
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
    };

    // LOGIKA FILTER KATEGORI SAMA DENGAN DENGAN USER & ADMIN LAYOUT
    const filteredSpaces = spaces.filter((item) => {
        const namaMatch = (item.nama || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        if (selectedCategory === 'ALL') return namaMatch;

        const rawType = (item.tipe || item.kategori || '').toUpperCase().replace(/_/g, ' ').trim();
        const selCategory = selectedCategory.toUpperCase().replace(/_/g, ' ').trim();

        // Pengecekan variasi nama tipe Desk / Personal Desk / Meja
        if (selCategory === 'PERSONAL DESK' || selCategory === 'DESK') {
            const isDesk = rawType.includes('DESK') || rawType.includes('MEJA');
            return namaMatch && isDesk;
        }

        return namaMatch && rawType === selCategory;
    });

    return (
        <div className="min-h-screen w-full bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">

            {/* 1. NAVBAR GLASSMORPHISM */}
            <header className="fixed top-0 left-0 right-0 z-40 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4">
                <nav className="flex items-center justify-between px-6 py-3.5 bg-white/80 backdrop-blur-xl border border-white/90 shadow-xs rounded-full">
                    <a href="#" className="flex items-center gap-1 group">
                        <span className="text-xl font-black tracking-wider text-slate-900 uppercase">
                            YAHYA<span className="text-blue-600 font-light">LUXE</span>
                        </span>
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600 tracking-wider uppercase">
                        <a href="#katalog" onClick={(e) => handleSmoothScroll(e, '#katalog')} className="hover:text-blue-600 transition-colors">
                            Katalog Space
                        </a>
                        <a href="#fasilitas" onClick={(e) => handleSmoothScroll(e, '#fasilitas')} className="hover:text-blue-600 transition-colors">
                            Fasilitas
                        </a>
                        <a href="#tentang" onClick={(e) => handleSmoothScroll(e, '#tentang')} className="hover:text-blue-600 transition-colors">
                            Tentang
                        </a>
                    </div>

                    {/* Action Buttons & Mobile Hamburger */}
                    <div className="flex items-center gap-2">
                        <Link href="/login" className="px-5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-full shadow-xs transition-all">
                            Masuk
                        </Link>
                        <Link href="/register" className="hidden sm:inline-block px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm transition-all">
                            Daftar
                        </Link>

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle Navigation"
                            className="md:hidden p-2 text-slate-700 hover:text-blue-600 rounded-full transition focus:outline-none cursor-pointer"
                        >
                            {isMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </nav>

                {/* Mobile Navigation Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden mt-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-4 shadow-xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <a
                            href="#katalog"
                            onClick={(e) => handleSmoothScroll(e, '#katalog')}
                            className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                        >
                            KATALOG SPACE
                        </a>
                        <a
                            href="#fasilitas"
                            onClick={(e) => handleSmoothScroll(e, '#fasilitas')}
                            className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                        >
                            FASILITAS
                        </a>
                        <a
                            href="#tentang"
                            onClick={(e) => handleSmoothScroll(e, '#tentang')}
                            className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                        >
                            TENTANG
                        </a>
                    </div>
                )}
            </header>

            {/* 2. HERO SECTION DENGAN VIDEO BACKGROUND */}
            <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-24 pb-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover object-center scale-105"
                    >
                        <source src="/OfficeBackground.mp4" type="video/mp4" />
                        Browser Anda tidak mendukung tag video.
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/75 to-slate-50 backdrop-blur-[2px]" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto space-y-6">

                    <ScrollReveal>
                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                            ELEVATE YOUR <br className="hidden sm:block" />
                            <span className="font-serif italic font-normal text-blue-600">WORKFLOW</span> WITH YAHYALUXE
                        </h1>
                    </ScrollReveal>

                    <ScrollReveal>
                        <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed">
                            Temukan suasana kerja produktif dan fleksibel. Mulai dari <span className="text-slate-900 font-bold">Personal Desk</span>, <span className="text-slate-900 font-bold">Meeting Room</span>, hingga <span className="text-slate-900 font-bold">Private Office</span>.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                            <a
                                href="#katalog"
                                onClick={(e) => handleSmoothScroll(e, '#katalog')}
                                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-xl transition-all cursor-pointer"
                            >
                                Jelajahi Katalog Space ↓
                            </a>
                            <Link
                                href="/register"
                                className="w-full sm:w-auto px-8 py-3.5 bg-white/90 hover:bg-white text-slate-800 border border-slate-200 font-bold text-xs uppercase tracking-wider rounded-full shadow-xs transition-all"
                            >
                                Daftar Member
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* 3. SECTION KATALOG (#katalog) */}
            <section id="katalog" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto space-y-10">
                <ScrollReveal>
                    <div className="text-center space-y-3">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                            Ruangan Tersedia
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                            Katalog Space Realtime
                        </h2>
                        <p className="text-slate-500 text-sm max-w-lg mx-auto">
                            Data inventaris terhubung langsung secara terintegrasi.
                        </p>
                    </div>
                </ScrollReveal>

                {/* Filter & Search */}
                <ScrollReveal>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
                        <input
                            type="text"
                            placeholder="Cari nama ruangan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-72 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-blue-600 focus:bg-white transition"
                        />

                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            {['ALL', 'PERSONAL_DESK', 'MEETING_ROOM', 'PRIVATE_OFFICE'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
                                        selectedCategory === cat
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat === 'ALL' ? 'Semua' : cat.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Card Items */}
                {loading ? (
                    <div className="text-center py-20 text-slate-400 font-bold text-sm">
                        Memuat katalog ruangan...
                    </div>
                ) : filteredSpaces.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 font-bold text-xs">
                        Tidak ada ruangan yang sesuai kriteria.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSpaces.map((item) => (
                            <ScrollReveal key={item.id}>
                                <div className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between h-full">
                                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                                        <img
                                            src={item.gambar}
                                            alt={item.nama}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                                            }}
                                        />
                                        <span className="absolute top-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black rounded-xl uppercase">
                                            {(item.tipe || item.kategori || 'DESK').replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                        <div className="space-y-2">
                                            <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                                {item.nama}
                                            </h3>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                {item.fasilitas || item.deskripsi || 'AC, Wi-Fi Kencang, Stopkontak'}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold block">HARGA SEWA</span>
                                                <span className="text-base font-black text-blue-600">
                                                    {formatRupiah(Number(item.harga || 0))}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold">/jam</span>
                                            </div>

                                            <button
                                                onClick={() => openModal(item.nama)}
                                                className="px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-xs rounded-2xl transition cursor-pointer"
                                            >
                                                Pesan Sekarang
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </section>

            {/* 4. SECTION FASILITAS (#fasilitas) */}
            <section id="fasilitas" className="py-20 bg-white border-y border-slate-200/80 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto space-y-12">
                    <ScrollReveal>
                        <div className="text-center space-y-3">
                            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                                Fasilitas Unggulan
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
                                Pengalaman Kerja Terbaik
                            </h2>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <ScrollReveal>
                            <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-3xl space-y-3 hover:border-blue-400/50 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                                    🚀
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Wi-Fi Kencang 1 Gbps</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Internet dedicated fiber optic stabil untuk rapat video conference dan transfer data.
                                </p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal>
                            <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-3xl space-y-3 hover:border-blue-400/50 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                                    ☕
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Free Flow Coffee & Tea</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Seduhan kopi espresso artisan & pilihan teh gratis tanpa batas selama jam kerja.
                                </p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal>
                            <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-3xl space-y-3 hover:border-blue-400/50 hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl">
                                    🔑
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Akses Fleksibel 24/7</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Sistem pemesanan fleksibel per jam atau harian sesuai waktu kerja produktif kamu.
                                </p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

            {/* 5. TENTANG YAHYALUXE (#tentang) */}
            <section id="tentang" className="py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-8">
                <ScrollReveal>
                    <div className="space-y-3">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                            Tentang YahyaLuxe
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 max-w-2xl mx-auto">
                            Membangun Ekosistem Kerja Masa Depan
                        </h2>
                        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
                            YahyaLuxe menghadirkan standar baru dalam penyediaan ruang kerja bersama yang elegan, modern, dan siap mendukung produktivitas.
                        </p>
                    </div>
                </ScrollReveal>

                <ScrollReveal>
                    <button
                        onClick={() => openModal()}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-full shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                    >
                        Mulai Booking Sekarang
                    </button>
                </ScrollReveal>
            </section>

            {/* 6. FOOTER */}
            <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 border-t border-slate-800">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <div>
                        <span className="text-lg font-black tracking-wider uppercase">
                            YAHYA<span className="text-blue-500">LUXE</span>
                        </span>
                        <p className="text-xs text-slate-400 mt-1">
                            © 2026 YahyaLuxe Platform. All rights reserved.
                        </p>
                    </div>

                    <div className="flex gap-6 text-xs font-bold text-slate-400">
                        <a href="#katalog" onClick={(e) => handleSmoothScroll(e, '#katalog')} className="hover:text-white transition-colors">Katalog</a>
                        <a href="#fasilitas" onClick={(e) => handleSmoothScroll(e, '#fasilitas')} className="hover:text-white transition-colors">Fasilitas</a>
                        <a href="#tentang" onClick={(e) => handleSmoothScroll(e, '#tentang')} className="hover:text-white transition-colors">Tentang</a>
                        <Link href="/login" className="hover:text-white transition-colors">Masuk</Link>
                    </div>
                </div>
            </footer>

            {/* 7. POPUP MODAL */}
            {showModal && (
                <div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity duration-300 ${
                        isModalAnimating ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <div
                        className={`bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-5 transition-all duration-300 transform ${
                            isModalAnimating ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'
                        }`}
                    >
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
                            🔒
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-slate-900">
                                Akses Terbatas!
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {selectedSpaceName ? (
                                    <>Silakan login terlebih dahulu untuk memesan ruangan <strong className="text-slate-800">{selectedSpaceName}</strong>.</>
                                ) : (
                                    <>Silakan login terlebih dahulu untuk melakukan reservasi ruangan.</>
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition cursor-pointer"
                            >
                                Login Sekarang
                            </button>
                            <button
                                onClick={closeModal}
                                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-2xl transition cursor-pointer"
                            >
                                Nanti Saja
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}