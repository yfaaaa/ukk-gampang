// User & Authentication Types
export interface User {
    id?: string | number;
    nama?: string;
    name?: string;
    email: string;
    role: 'admin' | 'member';
    created_at?: string;
    updated_at?: string;
}

export interface RegisterPayload {
    nama?: string;
    name?: string;
    email: string;
    password: string;
    role?: 'admin' | 'member';
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AuthResponse {
    message?: string;
    token?: string;
    access_token?: string;
    role?: string;
    data?: {
        token?: string;
        role?: string;
        user?: User;
    };
}

// Space / Ruang Kerja Types
export interface Space {
    id: string | number;
    nama_space?: string;
    name?: string;
    kategori?: string;
    category?: string;
    deskripsi?: string;
    description?: string;
    kapasitas?: number;
    capacity?: number;
    fasilitas?: string;
    facilities?: string;
    harga_per_jam?: number;
    price_per_hour?: number;
    status?: string;
    foto?: string;
    image?: string;
    [key: string]: any;
}

// Booking / Transaksi Types
export interface BookingPayload {
    space_id: string | number;
    tanggal_pemesanan?: string;
    date?: string;
    jam_mulai?: string;
    start_time?: string;
    durasi?: number;
    duration?: number;
    total_harga?: number;
    total_price?: number;
}

export interface Booking {
    id: string | number;
    user_id?: string | number;
    space_id?: string | number;
    space?: Space;
    user?: User;
    tanggal_pemesanan?: string;
    date?: string;
    jam_mulai?: string;
    start_time?: string;
    durasi?: number;
    duration?: number;
    total_harga?: number;
    total_price?: number;
    status_pembayaran?: string;
    payment_status?: string;
    created_at?: string;
}

// Stats & General Response Types
export interface DashboardStats {
    total_spaces?: number;
    total_members?: number;
    total_bookings?: number;
    total_revenue?: number;
}

export interface ApiResponse<T = any> {
    status?: boolean | string;
    message?: string;
    data?: T;
}