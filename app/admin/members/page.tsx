'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Member {
    id?: number | string;
    id_member?: number | string;
    nama?: string;
    nama_member?: string;
    name?: string;
    username?: string;
    email?: string;
    email_member?: string;
    no_hp?: string;
    nomor_telepon?: string;
    role?: string;
}

export default function AdminMembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State Modal CRUD
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedId, setSelectedId] = useState<number | string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        no_hp: '',
        role: 'member',
    });

    const BASE_URL = 'https://learn.smktelkom-mlg.sch.id/coworking/api/admin/members';

    const getHeaders = () => {
        const token = localStorage.getItem('token');
        const makerKey = process.env.NEXT_PUBLIC_MAKER_KEY || 'app_key_siswa';
        return {
            'x-maker-key': makerKey,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    // 1. READ (Get All Members)
    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(BASE_URL, { headers: getHeaders() });
            const data = response.data.data || response.data;

            // Log data ke konsol browser untuk memverifikasi kunci field dari backend
            console.log('Data Members dari API:', data);

            setMembers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Gagal mengambil data member:', err);
            setError(err.response?.data?.message || 'Gagal memuat data member.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // Reset Form Modal
    const resetForm = () => {
        setFormData({ nama: '', email: '', password: '', no_hp: '', role: 'member' });
        setSelectedId(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setModalMode('add');
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (member: Member) => {
        const id = member.id || member.id_member;
        setSelectedId(id || null);
        setFormData({
            nama: member.nama || member.nama_member || member.name || member.username || '',
            email: member.email || member.email_member || '',
            password: '', // Kosongkan saat edit jika tidak diubah
            no_hp: member.no_hp || member.nomor_telepon || '',
            role: member.role || 'member',
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    // 2. CREATE & 3. UPDATE
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await axios.post(BASE_URL, formData, { headers: getHeaders() });
                alert('Member berhasil ditambahkan!');
            } else {
                await axios.put(`${BASE_URL}/${selectedId}`, formData, { headers: getHeaders() });
                alert('Data member berhasil diperbarui!');
            }
            setIsModalOpen(false);
            resetForm();
            fetchMembers();
        } catch (err: any) {
            console.error('Error simpan data:', err);
            alert(err.response?.data?.message || 'Gagal menyimpan data member.');
        }
    };

    // 4. DELETE
    const handleDelete = async (id: number | string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus member ini?')) return;

        try {
            await axios.delete(`${BASE_URL}/${id}`, { headers: getHeaders() });
            alert('Member berhasil dihapus!');
            fetchMembers();
        } catch (err: any) {
            console.error('Error hapus data:', err);
            alert(err.response?.data?.message || 'Gagal menghapus member.');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Kelola Member</h1>
                    <p className="text-sm text-slate-500">Daftar pengguna dan pengelola sistem</p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition"
                >
                    + Tambah Member
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg flex justify-between items-center text-sm">
                    <span>{error}</span>
                    <button onClick={fetchMembers} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium">
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* Tabel Data Member */}
            <div className="bg-slate-900 text-white rounded-xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-300 uppercase text-xs border-b border-slate-700">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Nama</th>
                                <th className="px-6 py-4">Email / Kontak</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        Memuat data member...
                                    </td>
                                </tr>
                            ) : members.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        Belum ada data member terdaftar.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member, idx) => {
                                    const id = member.id || member.id_member || idx + 1;
                                    const nama = member.nama || member.nama_member || member.name || member.username || '-';
                                    const email = member.email || member.email_member || member.no_hp || member.nomor_telepon || '-';
                                    const role = member.role || 'member';

                                    return (
                                        <tr key={id} className="hover:bg-slate-800/50">
                                            <td className="px-6 py-4 font-medium">{id}</td>
                                            <td className="px-6 py-4">{nama}</td>
                                            <td className="px-6 py-4">{email}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs rounded bg-slate-700 text-slate-200 uppercase">
                                                    {role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleOpenEditModal(member)}
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
                            {modalMode === 'add' ? 'Tambah Member Baru' : 'Edit Data Member'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="Masukkan nama"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="nama@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Password {modalMode === 'edit' && '(Kosongkan jika tidak diubah)'}
                                </label>
                                <input
                                    type="password"
                                    required={modalMode === 'add'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="******"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Nomor Telepon / WhatsApp</label>
                                <input
                                    type="text"
                                    value={formData.no_hp}
                                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                                    placeholder="08123456789"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
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
                                    {modalMode === 'add' ? 'Simpan Member' : 'Perbarui'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}