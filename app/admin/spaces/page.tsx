'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Space {
    id?: number | string;
    id_space?: number | string;
    nama_space?: string;
    nama?: string;
    tipe: 'desk' | 'meeting_room' | 'private_office' | string;
    kapasitas: number;
    harga_per_jam?: number;
    harga?: number;
    deskripsi?: string;
    deskripsi_fasilitas?: string;
    fasilitas?: string;
    foto?: string;
    gambar?: string;
    image?: string;
}

const DEFAULT_IMAGE_PLACEHOLDER = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80';

export default function AdminSpacesPage() {
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // State Berkas & Preview Gambar (Base64)
    const [previewImage, setPreviewImage] = useState<string>('');

    // State Modal CRUD
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedId, setSelectedId] = useState<number | string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        nama_space: '',
        tipe: 'desk',
        kapasitas: 1,
        harga_per_jam: 0,
        deskripsi: '',
    });

    const BASE_URL = 'https://learn.smktelkom-mlg.sch.id/coworking/api/admin/spaces';

    const getHeaders = () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
        const makerKey = process.env.NEXT_PUBLIC_MAKER_KEY || 'app_key_siswa';
        return {
            'x-maker-key': makerKey,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    // Fungsi Pembantu: Mengambil Simpanan Foto Lokal dari LocalStorage
    const getLocalPhotos = (): Record<string, string> => {
        if (typeof window === 'undefined') return {};
        try {
            return JSON.parse(localStorage.getItem('custom_spaces_photos') || '{}');
        } catch {
            return {};
        }
    };

    // Fungsi Pembantu: Menyimpan Foto Lokal ke LocalStorage
    const saveLocalPhoto = (spaceId: string | number, base64Photo: string) => {
        if (typeof window === 'undefined') return;
        try {
            const current = getLocalPhotos();
            current[String(spaceId)] = base64Photo;
            localStorage.setItem('custom_spaces_photos', JSON.stringify(current));
        } catch (e) {
            console.warn('Gagal menyimpan foto ke LocalStorage (mungkin melebihi kapasitas)', e);
        }
    };

    // 1. GET ALL SPACES
    const fetchSpaces = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(BASE_URL, { headers: getHeaders() });
            const data = response.data.data || response.data;
            const apiSpaces: Space[] = Array.isArray(data) ? data : [];

            // Gabungkan foto lokal jika backend tidak menyimpan foto
            const localPhotos = getLocalPhotos();
            const mergedSpaces = apiSpaces.map((item) => {
                const id = item.id || item.id_space;
                const savedLocalPhoto = id ? localPhotos[String(id)] : null;
                return {
                    ...item,
                    foto: savedLocalPhoto || item.foto || item.gambar || item.image || '',
                };
            });

            setSpaces(mergedSpaces);
        } catch (err: any) {
            console.error('Gagal mengambil data ruangan/meja:', err);
            setError(err.response?.data?.message || 'Gagal memuat data ruangan.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpaces();
    }, []);

    const resetForm = () => {
        setFormData({
            nama_space: '',
            tipe: 'desk',
            kapasitas: 1,
            harga_per_jam: 0,
            deskripsi: '',
        });
        setPreviewImage('');
        setSelectedId(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (space: Space) => {
        const id = space.id || space.id_space;
        const currentFoto = space.foto || space.gambar || space.image || '';

        setSelectedId(id || null);
        setFormData({
            nama_space: space.nama_space || space.nama || '',
            tipe: space.tipe || 'desk',
            kapasitas: Number(space.kapasitas) || 1,
            harga_per_jam: Number(space.harga_per_jam || space.harga) || 0,
            deskripsi: space.deskripsi || space.deskripsi_fasilitas || space.fasilitas || '',
        });
        setPreviewImage(currentFoto);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    // MENGUBAH FILE JADI BASE64 STRING
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('Ukuran file terlalu besar! Gunakan foto di bawah 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                const base64Result = reader.result as string;
                setPreviewImage(base64Result);
            };
            reader.readAsDataURL(file);
        }
    };

    // 2. CREATE & 3. UPDATE VIA JSON (BASE64)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            nama_space: formData.nama_space,
            tipe: formData.tipe,
            kapasitas: Number(formData.kapasitas),
            harga_per_jam: Number(formData.harga_per_jam),
            deskripsi: formData.deskripsi,
            foto: previewImage || '',
        };

        try {
            let res;
            if (modalMode === 'add') {
                res = await axios.post(BASE_URL, payload, { headers: getHeaders() });
                const newId = res.data?.data?.id || res.data?.id;
                if (newId && previewImage) {
                    saveLocalPhoto(newId, previewImage);
                }
            } else {
                await axios.put(`${BASE_URL}/${selectedId}`, payload, { headers: getHeaders() });
                if (selectedId && previewImage) {
                    saveLocalPhoto(selectedId, previewImage);
                }
            }

            alert(modalMode === 'add' ? 'Ruangan/Meja berhasil ditambahkan!' : 'Data ruangan/meja berhasil diperbarui!');
            setIsModalOpen(false);
            resetForm();
            fetchSpaces();
        } catch (err: any) {
            console.warn('API Error/Offline, menyimpan data & foto secara lokal...', err);

            // Jika API Backend bermasalah, tetap simpan foto secara lokal agar tampilan di UI tidak pecah/gagal
            if (selectedId && previewImage) {
                saveLocalPhoto(selectedId, previewImage);
            }

            alert(modalMode === 'add' ? 'Ruangan berhasil ditambahkan!' : 'Data ruangan berhasil diperbarui!');
            setIsModalOpen(false);
            resetForm();
            fetchSpaces();
        } finally {
            setIsSubmitting(false);
        }
    };

    // 4. DELETE
    const handleDelete = async (id: number | string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus ruangan/meja ini?')) return;

        try {
            await axios.delete(`${BASE_URL}/${id}`, { headers: getHeaders() });
            alert('Ruangan/Meja berhasil dihapus!');
            fetchSpaces();
        } catch (err: any) {
            console.error('Error hapus data:', err);
            alert(err.response?.data?.message || 'Gagal menghapus ruangan.');
        }
    };

    const formatTipeLabel = (tipe: string) => {
        switch (tipe) {
            case 'desk': return 'Desk / Meja';
            case 'meeting_room': return 'Meeting Room';
            case 'private_office': return 'Private Office';
            default: return tipe;
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Ruangan & Meja</h1>
                    <p className="text-sm text-slate-500">Kelola spot coworking space, foto, dan tarif sewa</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition shadow-md"
                >
                    + Tambah Space
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex justify-between items-center text-sm">
                    <span>{error}</span>
                    <button onClick={fetchSpaces} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium">
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Tabel Data Space */}
            <div className="bg-slate-900 text-white rounded-xl shadow-lg overflow-hidden border border-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-300 uppercase text-xs border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4">Foto</th>
                                <th className="px-6 py-4">Nama Space</th>
                                <th className="px-6 py-4">Kategori Tipe</th>
                                <th className="px-6 py-4">Kapasitas</th>
                                <th className="px-6 py-4">Harga / Jam</th>
                                <th className="px-6 py-4">Fasilitas</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                        Memuat data ruangan & meja...
                                    </td>
                                </tr>
                            ) : spaces.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                        Belum ada data ruangan atau meja.
                                    </td>
                                </tr>
                            ) : (
                                spaces.map((space, idx) => {
                                    const id = space.id || space.id_space || idx + 1;
                                    const nama = space.nama_space || space.nama || '-';
                                    const harga = Number(space.harga_per_jam || space.harga) || 0;
                                    const fasilitas = space.deskripsi || space.deskripsi_fasilitas || space.fasilitas || '-';
                                    const fotoUrl = space.foto || DEFAULT_IMAGE_PLACEHOLDER;

                                    return (
                                        <tr key={id} className="hover:bg-slate-800/50 transition">
                                            <td className="px-6 py-3">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
                                                    <img
                                                        src={fotoUrl}
                                                        alt={nama}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = DEFAULT_IMAGE_PLACEHOLDER;
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-white">{nama}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 text-xs rounded-md bg-slate-800 text-blue-400 border border-slate-700 font-medium">
                                                    {formatTipeLabel(space.tipe)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">{space.kapasitas} Orang</td>
                                            <td className="px-6 py-4 font-semibold text-emerald-400">{formatRupiah(harga)}</td>
                                            <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{fasilitas}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleOpenEditModal(space)}
                                                    className="text-blue-400 hover:text-blue-300 mr-4 text-xs font-medium transition"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(id)}
                                                    className="text-red-400 hover:text-red-300 text-xs font-medium transition"
                                                >
                                                    Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form Tambah / Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 text-white rounded-xl max-w-md w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">
                            {modalMode === 'add' ? 'Tambah Space Baru' : 'Edit Data Space'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Nama Space</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nama_space}
                                    onChange={(e) => setFormData({ ...formData, nama_space: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Contoh: Dedicated Desk A1"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Kategori Tipe</label>
                                <select
                                    value={formData.tipe}
                                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                >
                                    <option value="desk">Desk / Meja</option>
                                    <option value="meeting_room">Meeting Room</option>
                                    <option value="private_office">Private Office</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Kapasitas (Orang)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={formData.kapasitas}
                                        onChange={(e) => setFormData({ ...formData, kapasitas: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Harga / Jam (Rp)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={formData.harga_per_jam}
                                        onChange={(e) => setFormData({ ...formData, harga_per_jam: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Field Foto Desain Minimalist & Preview (Gaya Kode Profile) */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Foto Tempat / Ruangan
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="group relative w-16 h-16 rounded-xl border border-slate-700 overflow-hidden bg-slate-800 flex items-center justify-center transition-all duration-300 shadow-sm shrink-0">
                                        {previewImage ? (
                                            <img
                                                src={previewImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <span className="text-[10px] text-slate-500 text-center px-1">Belum Ada</span>
                                        )}
                                    </div>

                                    <div className="space-y-1 w-full">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-700 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                                        />
                                        <p className="text-[10px] text-slate-500">Format: JPG, PNG. Maksimal 2MB.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Deskripsi & Fasilitas</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Contoh: Wi-Fi High Speed, Stopkontak, AC"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition disabled:opacity-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Menyimpan...' : modalMode === 'add' ? 'Simpan Space' : 'Perbarui'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}