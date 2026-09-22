'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let token = '';
      let role = 'user';
      let userObj: any = null;

      try {
        // 1. Coba Login via API Server
        const res = await api.post('/auth/login', {
          username,
          password,
        });

        console.log('Response Login:', res.data);

        token =
          res.data?.token ||
          res.data?.data?.token ||
          res.data?.access_token ||
          res.data?.data?.access_token ||
          '';

        role =
          res.data?.role ||
          res.data?.data?.role ||
          res.data?.user?.role ||
          res.data?.data?.user?.role ||
          'user';

        userObj =
          res.data?.user ||
          res.data?.data?.user ||
          res.data?.data ||
          null;
      } catch (apiErr: any) {
        console.warn('API Login gagal / Mencari di akun terdaftar lokal:', apiErr);

        // 2. Jika API Offline/Error, CEK DATA USER DARI REGISTRATION LOKAL
        const rawRegistered = localStorage.getItem('registered_users') || '[]';
        const registeredUsers: any[] = JSON.parse(rawRegistered);

        // Cari user yang match username DAN password
        const foundUser = registeredUsers.find(
          (u) =>
            u.username.toLowerCase() === username.toLowerCase() &&
            u.password === password
        );

        if (foundUser) {
          token = `token_local_${Date.now()}`;
          role = foundUser.role;
          userObj = foundUser;
        } else {
          // Akun default bawaan untuk pengujian cepat (opsional)
          if (username === 'admin' && password === 'admin123') {
            token = `token_admin_${Date.now()}`;
            role = 'admin';
            userObj = { id: '99', nama: 'Admin Utama', username: 'admin', email: 'admin@coworkluxe.com' };
          } else {
            // JIKA AKUN TIDAK DITEMUKAN / BELUM REGISTRASI
            throw new Error('Akun belum terdaftar atau Password salah! Silakan daftar terlebih dahulu.');
          }
        }
      }

      if (token) {
        let namaLengkap = userObj?.nama || userObj?.name || userObj?.username;
        if (!namaLengkap || namaLengkap === '1' || username === '1') {
          namaLengkap = 'Fahmi User';
        }

        const emailUser =
          userObj?.email ||
          (username.includes('@') ? username : `${username}@coworkluxe.com`);

        const userId = userObj?.id || String(Date.now());

        const userData = {
          id: userId,
          nama: namaLengkap,
          email: emailUser,
          telepon: userObj?.telepon || userObj?.phone || '081234567890',
          role: role,
        };

        const isAdmin = role === 'admin' || role === 'admin_space' || role === 'ADMIN';

        // Simpan Sesi Login ke LocalStorage
        localStorage.setItem('token', token);
        localStorage.setItem('role', role);
        localStorage.setItem('user_role', isAdmin ? 'admin' : 'user');
        localStorage.setItem('user', JSON.stringify(userData));

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('members-updated'));

        if (isAdmin) {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/spaces';
        }
      } else {
        setError('Respons server berhasil, tetapi token tidak ditemukan.');
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      setError(
        err.message ||
        err.response?.data?.message ||
        'Login gagal. Periksa kembali username dan password kamu.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 p-4 font-sans text-slate-800">
      {/* Glassmorphism White Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-xl shadow-slate-400/20 space-y-6">

        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="text-2xl font-black text-slate-900 tracking-wider">
            COWORK<span className="text-blue-600">LUXE</span>
          </Link>
          <h1 className="text-lg font-bold text-slate-800 pt-1">Masuk ke Akun</h1>
          <p className="text-xs text-slate-500">
            Masukkan kredensial kamu untuk mengakses layanan coworking
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium text-center animate-in fade-in zoom-in-95 duration-200">
            {error}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 mt-2 active:scale-[0.99]"
          >
            {loading ? 'Memproses Login...' : 'Masuk Sekarang'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-200/80">
          Belum punya akun?{' '}
          <Link href="/register" className="text-blue-600 font-semibold hover:underline">
            Daftar disini
          </Link>
        </div>

      </div>
    </div>
  );
}