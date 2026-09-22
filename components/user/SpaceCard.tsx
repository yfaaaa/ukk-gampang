'use client';

import Link from 'next/link';
import { Space } from '@/types';
import { formatRupiah } from '@/lib/utils';

export default function SpaceCard({ space }: { space: Space }) {
    const nama = space.nama_space || space.name || 'Ruang Kerja';
    const kategori = space.kategori || space.category || 'Umum';
    const deskripsi = space.deskripsi || space.description || 'Fasilitas premium dengan koneksi internet ultra cepat.';
    const kapasitas = space.kapasitas || space.capacity || 0;
    const fasilitas = space.fasilitas || space.facilities || 'Wi-Fi, AC, Stop Kontak';
    const harga = space.harga_per_jam || space.price_per_hour || 0;
    const status = space.status || 'Tersedia';

    return (
        <div className="group bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 border border-amber-400/20">
                        {kategori}
                    </span>
                    <span
                        className={`text-xs px-2 py-0.5 rounded ${status === 'Tersedia' || status === 'available'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                    >
                        {status}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {nama}
                </h3>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {deskripsi}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-800/60 text-xs text-slate-400 space-y-1">
                    <div>
                        Kapasitas: <span className="text-slate-200 font-medium">{kapasitas} Orang</span>
                    </div>
                    <div>
                        Fasilitas: <span className="text-slate-200 font-medium">{fasilitas}</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                    <span className="text-xs text-slate-500 block">Tarif / Jam</span>
                    <span className="text-lg font-bold text-amber-400">{formatRupiah(harga)}</span>
                </div>
                <Link
                    href={`/spaces/${space.id}`}
                    className="px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-xs font-semibold transition-all border border-amber-500/30"
                >
                    Pesan Sekarang
                </Link>
            </div>
        </div>
    );
}