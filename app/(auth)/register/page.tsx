'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/axios';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama: '',
    telp: '',
    instansi: '',
    alamat: '',
    nama_coworking: '', // Khusus Admin
    role: 'member',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.role === 'member') {
        // PERMINTAAN: Bagian member TIDAK DIUBAH SAMA SEKALI
        const payloadMember = {
          username: formData.username,
          password: formData.password,
          nama_member: formData.nama,
          instansi: formData.instansi || '-',
          alamat: formData.alamat || '-',
          telp: formData.telp,
          foto: '',
        };
        await api.post('/auth/register/member', payloadMember);
      } else {
        // PERBAIKAN KHUSUS ADMIN (Sesuai APIdog)
        const payloadAdmin = {
          username: formData.username,
          password: formData.password,
          nama_coworking: formData.nama_coworking,
          nama_pemilik: formData.nama,
          telp: formData.telp,
        };
        await api.post('/auth/register/admin-space', payloadAdmin);
      }

      alert('Pendaftaran berhasil! Silakan login.');
      router.push('/login');
    } catch (err: any) {
      console.error('Error Register:', err);
      const resMsg = err?.response?.data?.message || 'Terjadi kesalahan saat pendaftaran.';
      setError(resMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-50/60 overflow-hidden p-4 sm:p-6 md:p-8">
      {/* Ambient Glass Spheres */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-1/3 w-64 h-64 bg-sky-100/50 rounded-full blur-2xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xl shadow-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 transition-all duration-300">
        
        {/* Header Section */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Buat Akun Baru
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Pilih jenis akses untuk mulai memesan space
          </p>
        </div>

        {/* Soft Pill Role Switcher */}
        <div className="grid grid-cols-2 bg-slate-200/50 p-1.5 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'member' })}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 ${
              formData.role === 'member'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Member / Pelanggan
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'admin' })}
            className={`py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 ${
              formData.role === 'admin'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Admin / Pengelola
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50/90 border border-red-200/80 text-red-600 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Masukkan username"
              className="w-full px-4 py-2.5 bg-white/80 border border-slate-200/90 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 transition-all duration-200 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              className="w-full px-4 py-2.5 bg-white/80 border border-slate-200/90 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 transition-all duration-200 shadow-sm"
            />
          </div>

          {/* Input Khusus Admin (Nama Coworking Space) */}
          {formData.role === 'admin' && (
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Nama Coworking Space
              </label>
              <input
                name="nama_coworking"
                type="text"
                required
                value={formData.nama_coworking}
                onChange={handleChange}
                placeholder="Contoh: Moklet Hub Coworking"
                className="w-full px-4 py-2.5 bg-white/80 border border-slate-200/90 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 transition-all duration-200 shadow-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              {formData.role === 'member' ? 'Nama Lengkap' : 'Nama Pemilik / Admin'}
            </label>
            <input
              name="nama"
              type="text"
              required
              value={formData.nama}
              onChange={handleChange}
              placeholder={formData.role === 'member' ? 'Contoh: Ahmad Subagja' : 'Contoh: Ahmad Subagja'}
              className="w-full px-4 py-2.5 bg-white/80 border border-slate-200/90 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 transition-all duration-200 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
              Nomor WhatsApp / Telp
            </label>
            <input
              name="telp"
              type="text"
              required
              value={formData.telp}
              onChange={handleChange}
              placeholder="Contoh: 081234567890"
              className="w-full px-4 py-2.5 bg-white/80 border border-slate-200/90 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 transition-all duration-200 shadow-sm"
            />
          </div>

          {formData.role === 'member' && (
            <>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Instansi / Kampus
                </label>
                <input
                  name="instansi"
                  type="text"
                  value={formData.instansi}
                  onChange={handleChange}
                  placeholder="Contoh: Universitas Brawijaya / Freelancer"
                  className="w-full px-4 py-2.5 bg-white/80 border border-slate-200/90 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 transition-all duration-200 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                  Alamat Lengkap
                </label>
                <textarea
                  name="alamat"
                  rows={2}
                  value={formData.alamat}
                  onChange={handleChange}
                  placeholder="Masukkan alamat domisili"
                  className="w-full px-4 py-2.5 bg-white/80 border border-slate-200/90 rounded-xl text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 transition-all duration-200 shadow-sm resize-none"
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Memproses...' : `Daftar sebagai ${formData.role === 'member' ? 'Member' : 'Admin'}`}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs sm:text-sm text-slate-500 font-medium pt-2">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold underline-offset-4 hover:underline transition-colors">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}