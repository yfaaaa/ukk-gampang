import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://learn.smktelkom-mlg.sch.id/coworking/api',
});

api.interceptors.request.use(
  (config) => {
    // 1. Header Multi-Tenancy Wajib
    const makerKey = process.env.NEXT_PUBLIC_MAKER_KEY || 'mk_de079ccd154a44658f5b95a16fedecb8';
    config.headers['x-maker-key'] = makerKey;

    // 2. Header Authorization Wajib jika token tersedia
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);