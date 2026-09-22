'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface ProfileData {
    nama_coworking: string;
    nama_pemilik: string;
    telp: string;
    jam_operasional: string;
    alamat: string;
    deskripsi: string;
    foto: string;
}

const DEFAULT_PROFILE: ProfileData = {
    nama_coworking: 'Cowork Luxe Malang',
    nama_pemilik: 'Admin Pengelola',
    telp: '081234567890',
    jam_operasional: '08:00 - 22:00 WIB',
    alamat: 'Jl. Soekarno Hatta No. 9, Malang',
    deskripsi: 'Coworking space nyaman dan modern untuk freelancer dan startup.',
    foto: '',
};

export default function AdminProfilePage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const [formData, setFormData] = useState<ProfileData>(DEFAULT_PROFILE);
    const [editData, setEditData] = useState<ProfileData>(DEFAULT_PROFILE);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const BASE_URL = 'https://learn.smktelkom-mlg.sch.id/coworking/api/admin/profile';

    // 🔑 SOLUSI UTAMA: Membuat Key LocalStorage Unik per Akun / User
    const getStorageKey = (userIdFromApi?: string | number) => {
        if (typeof window === 'undefined') return 'admin_profile_default';

        // 1. Jika ada ID dari API
        if (userIdFromApi) {
            return `admin_profile_user_${userIdFromApi}`;
        }

        // 2. Jika ada data user tersimpan di LocalStorage saat login
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                if (parsed.id) return `admin_profile_user_${parsed.id}`;
                if (parsed.username) return `admin_profile_user_${parsed.username}`;
            } catch (e) {
                console.error('Gagal parse data user', e);
            }
        }

        // 3. Fallback: Gunakan potongan unik dari Token Auth
        const token = localStorage.getItem('token') || '';
        if (token) {
            const tokenHash = token.slice(-15); // Ambil 15 karakter terakhir token
            return `admin_profile_token_${tokenHash}`;
        }

        return 'admin_profile_default';
    };

    const getHeaders = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const makerKey = process.env.NEXT_PUBLIC_MAKER_KEY || 'app_key_siswa';
        return {
            'x-maker-key': makerKey,
            Authorization: `Bearer ${token}`,
        };
    };

    // Helper Kompresi Gambar
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 400;
                    const scaleFactor = MAX_WIDTH / img.width;
                    const width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
                    const height = img.width > MAX_WIDTH ? img.height * scaleFactor : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    // Fetch Profile Berdasarkan Akun Aktif
    const fetchProfile = async () => {
        setLoading(true);

        // Reset state awal agar tidak memuat sisa foto dari akun lain
        setPreviewImage(null);

        const storageKey = getStorageKey();
        let localData: ProfileData | null = null;
        
        // Ambil cache khusus akun ini dari LocalStorage
        const savedLocal = localStorage.getItem(storageKey);
        if (savedLocal) {
            try {
                localData = JSON.parse(savedLocal);
                if (localData) {
                    setFormData(localData);
                    setEditData(localData);
                    setPreviewImage(localData.foto || null);
                }
            } catch (e) {
                console.error('Error parsing local storage profile', e);
            }
        }

        try {
            const res = await axios.get(BASE_URL, { headers: getHeaders() });
            const data = res.data.data || res.data;

            if (data) {
                // Tentukan storage key berdasarkan ID user jika dikembalikan API
                const dynamicKey = getStorageKey(data.id_user || data.id);

                const fetchedData: ProfileData = {
                    nama_coworking: data.nama_coworking || data.nama_tempat || localData?.nama_coworking || DEFAULT_PROFILE.nama_coworking,
                    nama_pemilik: data.nama_pemilik || localData?.nama_pemilik || DEFAULT_PROFILE.nama_pemilik,
                    telp: data.telp || data.no_telepon || localData?.telp || DEFAULT_PROFILE.telp,
                    jam_operasional: data.jam_operasional || localData?.jam_operasional || DEFAULT_PROFILE.jam_operasional,
                    alamat: data.alamat || localData?.alamat || DEFAULT_PROFILE.alamat,
                    deskripsi: data.deskripsi || localData?.deskripsi || DEFAULT_PROFILE.deskripsi,
                    foto: data.foto || data.logo_url || localData?.foto || '',
                };

                setFormData(fetchedData);
                setEditData(fetchedData);
                setPreviewImage(fetchedData.foto || null);

                // Simpan ke LocalStorage khusus akun ini
                localStorage.setItem(dynamicKey, JSON.stringify(fetchedData));
            }
        } catch {
            console.warn('Gagal ambil API, menggunakan cache akun lokal.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleStartEditing = () => {
        setEditData(formData);
        setPreviewImage(formData.foto || null);
        setIsEditing(true);
    };

    const handleCancelEditing = () => {
        setEditData(formData);
        setPreviewImage(formData.foto || null);
        setIsEditing(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressedBase64 = await compressImage(file);
            setPreviewImage(compressedBase64);
            setEditData((prev) => ({ ...prev, foto: compressedBase64 }));
        } catch (err) {
            console.error('Gagal kompres foto:', err);
            alert('Gagal memproses foto.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const updatedProfile: ProfileData = {
            ...editData,
            foto: previewImage || editData.foto || '',
        };

        try {
            await axios.put(BASE_URL, updatedProfile, {
                headers: {
                    ...getHeaders(),
                    'Content-Type': 'application/json',
                },
            });
        } catch {
            console.warn('API Offline, menyimpan perubahan secara lokal.');
        }

        // Simpan perubahan ke Key unik akun aktif
        const storageKey = getStorageKey();
        try {
            localStorage.setItem(storageKey, JSON.stringify(updatedProfile));
        } catch (e) {
            console.error('Storage quota error', e);
        }

        setFormData(updatedProfile);
        alert('Profil berhasil disimpan!');
        setIsEditing(false);
        setSaving(false);
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 p-6 flex justify-center">
            <div className="max-w-3xl w-full space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Profil Lokasi & Pengelola</h1>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Identitas tempat kerja dan kontak resmi pengelola coworking space.
                        </p>
                    </div>
                    {!isEditing && !loading && (
                        <button
                            type="button"
                            onClick={handleStartEditing}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-200"
                        >
                            Edit Profil
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200/80 shadow-sm">
                        Memuat profil pengelola...
                    </div>
                ) : !isEditing ? (
                    <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-6">
                            <div className="group relative w-28 h-28 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-sm flex-shrink-0">
                                {formData.foto ? (
                                    <img
                                        src={formData.foto}
                                        alt="Logo Tempat"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[11px] text-slate-400 font-medium">
                                        Tidak ada foto
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 text-center sm:text-left">
                                <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase tracking-wider rounded-md border border-slate-200">
                                    Lokasi Aktif
                                </span>
                                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{formData.nama_coworking}</h2>
                                <p className="text-xs text-slate-500">
                                    Pengelola: <span className="font-semibold text-slate-800">{formData.nama_pemilik}</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. WhatsApp / Kontak</span>
                                <p className="font-semibold text-slate-800">{formData.telp}</p>
                            </div>

                            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jam Operasional</span>
                                <p className="font-semibold text-slate-800">{formData.jam_operasional}</p>
                            </div>

                            <div className="md:col-span-2 bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Lengkap</span>
                                <p className="font-semibold text-slate-800 leading-relaxed">{formData.alamat}</p>
                            </div>

                            <div className="md:col-span-2 bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi Singkat</span>
                                <p className="text-slate-600 leading-relaxed">{formData.deskripsi}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-slate-900 text-sm">Edit Informasi Profil</h3>
                            <span className="text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium border border-slate-200">
                                Mode Pengeditan
                            </span>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Logo / Foto Tempat
                            </label>
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-xl border border-slate-300 overflow-hidden bg-slate-50 flex items-center justify-center shadow-sm">
                                    {previewImage ? (
                                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-[10px] text-slate-400 text-center px-1">Belum Ada</span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-300 file:text-[11px] file:font-semibold file:bg-white file:text-slate-700 hover:file:bg-slate-50 cursor-pointer"
                                    />
                                    <p className="text-[10px] text-slate-400">Otomatis dikompres agar terpisah & ringan.</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Nama Tempat / Branding
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editData.nama_coworking}
                                    onChange={(e) => setEditData({ ...editData, nama_coworking: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Nama Pemilik / Pengelola
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editData.nama_pemilik}
                                    onChange={(e) => setEditData({ ...editData, nama_pemilik: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    No. WhatsApp / Kontak
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editData.telp}
                                    onChange={(e) => setEditData({ ...editData, telp: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Jam Operasional
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editData.jam_operasional}
                                    onChange={(e) => setEditData({ ...editData, jam_operasional: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Alamat Lengkap Lokasi
                            </label>
                            <textarea
                                rows={2}
                                required
                                value={editData.alamat}
                                onChange={(e) => setEditData({ ...editData, alamat: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Deskripsi Singkat
                            </label>
                            <textarea
                                rows={2}
                                value={editData.deskripsi}
                                onChange={(e) => setEditData({ ...editData, deskripsi: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-slate-900 focus:bg-white transition"
                            />
                        </div>

                        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 text-xs">
                            <button
                                type="button"
                                onClick={handleCancelEditing}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                            >
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}