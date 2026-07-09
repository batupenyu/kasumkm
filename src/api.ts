import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Opsional: isi dengan IPv4 LAN komputer kamu (jalankan `ipconfig` di Windows,
// cari "IPv4 Address" di adapter yang terhubung ke HP) jika ingin override otomatis.
// Biarkan '' agar Expo mendeteksi sendiri: emulator -> 10.0.2.2, HP fisik -> IP LAN PC.
const ANDROID_DEVICE_HOST = '192.168.1.9';

function getApiBaseUrl(): string {
  if (Platform.OS === 'android') {
    const host =
      ANDROID_DEVICE_HOST ||
      Constants.expoConfig?.hostUri?.split(':')[0] ||
      '10.0.2.2';
    return `http://${host}:8000/api`;
  }
  return 'http://localhost:8000/api';
}

export type TxType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  type: TxType;
  icon: string;
  is_default: boolean;
};

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  category_id: string;
  category_name: string;
  note: string;
  date: string;
  created_at: string;
};

export type Summary = {
  income: number;
  expense: number;
  balance: number;
  count: number;
};

export type StoreProfile = {
  id: string;
  name: string;
  address: string;
  phone: string;
  footer: string;
  logo_base64: string;
};

const defaultHeaders = {
  'Content-Type': 'application/json',
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: { ...defaultHeaders, ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || 'Request failed');
  }
  return res.json() as Promise<T>;
}

export const api = {
  listCategories: (type?: TxType) => request<Category[]>(`/categories${type ? `?type=${type}` : ''}`),
  createCategory: (payload: Partial<Category>) => request<Category>('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  deleteCategory: (id: string) => request<{ ok: boolean }>(`/categories/${id}`, { method: 'DELETE' }),
  listTransactions: () => request<Transaction[]>('/transactions'),
  getTransaction: (id: string) => request<Transaction>(`/transactions/${id}`),
  createTransaction: (payload: Omit<Transaction, 'id' | 'created_at'>) => request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(payload) }),
  updateTransaction: (id: string, payload: Partial<Omit<Transaction, 'id' | 'created_at'>>) => request<Transaction>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTransaction: (id: string) => request<{ ok: boolean }>(`/transactions/${id}`, { method: 'DELETE' }),
  summary: ({ start, end }: { start?: string; end?: string }) => request<Summary>(`/summary${start || end ? `?${new URLSearchParams({ ...(start ? { start } : {}), ...(end ? { end } : {}) }).toString()}` : ''}`),
  monthlySummary: () => request<Array<{ month: string; income: number; expense: number }>>('/summary/monthly'),
  getStoreProfile: () => request<StoreProfile>('/store-profile'),
  updateStoreProfile: (payload: Partial<StoreProfile>) => request<StoreProfile>('/store-profile', { method: 'PUT', body: JSON.stringify(payload) }),
};

export function fmtIDR(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

export function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function monthStartISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export function monthEndISO() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
}

