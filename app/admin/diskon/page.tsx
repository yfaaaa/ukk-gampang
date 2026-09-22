'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Diskon {
    id?: number | string;
    id_diskon?: number | string;
    nama_diskon: string;
    persentase_diskon: number;
    tanggal_awal: string;
    tanggal_akhir: string;
}

export default function AdminDiskonPage() {
    const [diskonList, setDiskonList] = useState<Diskon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedId, setSelectedId] = useState<number | string | null>(null);

    const getTodayString = () => new Date().toISOString().split('T')[0];
    const getNextMonthString = () => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
    };

    const [formData, setFormData] = useState({
        nama_diskon: '',
        persentase_diskon: 10,
        tanggal_awal: getTodayString(),
        tanggal_akhir: getNextMonthString(),
    });

    const BASE_ADMIN_URL = 'https://learn.smktelkom-mlg.sch.id/coworking/api/admin/diskon';
    const BASE_PUBLIC_URL = 'https://learn.smktelkom-mlg.sch.id/coworking/api/diskon/active';

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        const makerKey = process.env.NEXT_PUBLIC_MAKER_KEY || 'app_key_siswa';
        return {
            'x-maker-key': makerKey,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    // 1. GET ALL DISCOUNTS
    const fetchDiscounts = async () => {
        setLoading(true);
        setError(null);
        try {
            // Coba ambil dari endpoint Admin
            const response = await axios.get(BASE_ADMIN_URL, { headers: getHeaders() });
            const data = response.data.data || response.data;
            setDiskonList(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.warn('Endpoint admin diskon gagal, mencoba endpoint publik...');
            try {
                // Fallback ke endpoint promo aktif jika endpoint admin belum dibuka
                const pubRes = await axios.get(BASE_PUBLIC_URL, { headers: getHeaders() });
                const data = pubRes.data.data || pubRes.data;
                setDiskonList(Array.isArray(data) ? data : []);
            } catch (pubErr: any) {
                console.error('Gagal mengambil data diskon:', pubErr);
                setError('Gagal memuat daftar diskon dari server.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const resetForm = () => {
        setFormData({
            nama_diskon: '',
            persentase_diskon: 10,
            tanggal_awal: getTodayString(),
            tanggal_akhir: getNextMonthString(),
        });
        setSelectedId(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: Diskon) => {
        const id = item.id || item.id_diskon;
        setSelectedId(id || null);

        // Formatting tanggal untuk HTML Input type="date" (YYYY-MM-DD)
        const tglAwal = item.tanggal_awal ? item.tanggal_awal.split('T')[0] : getTodayString();
        const tglAkhir = item.tanggal_akhir ? item.tanggal_akhir.split('T')[0] : getNextMonthString();

        setFormData({
            nama_diskon: item.nama_diskon || '',
            persentase_diskon: Number(item.persentase_diskon) || 0,
            tanggal_awal: tglAwal,
            tanggal_akhir: tglAkhir,
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    // 2. CREATE & 3. UPDATE (EDIT)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            nama_diskon: formData.nama_diskon,
            persentase_diskon: Number(formData.persentase_diskon),
            tanggal_awal: `${formData.tanggal_awal}T00:00:00.000Z`,
            tanggal_akhir: `${formData.tanggal_akhir}T23:59:59.000Z`,
        };

        try {
            if (modalMode === 'add') {
                await axios.post(BASE_ADMIN_URL, payload, { headers: getHeaders() });
                alert('Voucher diskon berhasil ditambahkan!');
            } else {
                await axios.put(`${BASE_ADMIN_URL}/${selectedId}`, payload, { headers: getHeaders() });
                alert('Voucher diskon berhasil diperbarui!');
            }
            setIsModalOpen(false);
            resetForm();
            fetchDiscounts();
        } catch (err: any) {
            console.error('Error simpan diskon:', err);
            const msg = err.response?.data?.message;
            alert(Array.isArray(msg) ? msg.join(', ') : msg || 'Gagal menyimpan voucher diskon.');
        }
    };

    // 4. DELETE
    const handleDelete = async (id: number | string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus voucher diskon ini?')) return;

        try {
            await axios.delete(`${BASE_ADMIN_URL}/${id}`, { headers: getHeaders() });
            alert('Voucher berhasil dihapus!');
            fetchDiscounts();
        } catch (err: any) {
            console.error('Error hapus diskon:', err);
            alert(err.response?.data?.message || 'Gagal menghapus voucher.');
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Voucher Diskon</h1>
                    <p className="text-sm text-slate-500">Kelola kode promo dan potongan harga untuk member</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition"
                >
                    + Tambah Promo
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex justify-between items-center text-sm">
                    <span>{error}</span>
                    <button onClick={fetchDiscounts} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium">
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Tabel Daftar Promo */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-300 uppercase text-xs border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Nama / Kode Diskon</th>
                                <th className="px-6 py-4">Persentase Diskon</th>
                                <th className="px-6 py-4">Tanggal Awal</th>
                                <th className="px-6 py-4">Tanggal Akhir</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                        Memuat daftar promo...
                                    </td>
                                </tr>
                            ) : diskonList.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                        Belum ada promo aktif.
                                    </td>
                                </tr>
                            ) : (
                                diskonList.map((item, idx) => {
                                    const id = item.id || item.id_diskon || idx + 1;
                                    return (
                                        <tr key={id} className="hover:bg-slate-800/50">
                                            <td className="px-6 py-4 font-medium text-slate-400">{id}</td>
                                            <td className="px-6 py-4 font-mono font-bold text-blue-400">{item.nama_diskon}</td>
                                            <td className="px-6 py-4 text-emerald-400 font-semibold">{item.persentase_diskon}%</td>
                                            <td className="px-6 py-4 text-slate-300">{formatDate(item.tanggal_awal)}</td>
                                            <td className="px-6 py-4 text-slate-300">{formatDate(item.tanggal_akhir)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleOpenEditModal(item)}
                                                    className="text-blue-400 hover:text-blue-300 mr-4 text-xs font-medium"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(id)}
                                                    className="text-red-400 hover:text-red-300 text-xs font-medium"
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
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-800 text-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">
                            {modalMode === 'add' ? 'Tambah Voucher Promo' : 'Edit Voucher Promo'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Nama Diskon / Kode Promo</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nama_diskon}
                                    onChange={(e) => setFormData({ ...formData, nama_diskon: e.target.value.toUpperCase() })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 uppercase font-bold tracking-wider"
                                    placeholder="Contoh: CAIRBOS"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Persentase Diskon (%)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    required
                                    value={formData.persentase_diskon}
                                    onChange={(e) => setFormData({ ...formData, persentase_diskon: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Tanggal Mulai</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.tanggal_awal}
                                        onChange={(e) => setFormData({ ...formData, tanggal_awal: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Tanggal Berakhir</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.tanggal_akhir}
                                        onChange={(e) => setFormData({ ...formData, tanggal_akhir: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                                >
                                    {modalMode === 'add' ? 'Simpan Promo' : 'Perbarui'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}