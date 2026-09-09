import { z } from 'zod';

export const ROLE_OPTIONS = ['ADMIN', 'PETUGAS', 'DOKTER'];
export const ROLE_LABELS = { ADMIN: 'Admin', PETUGAS: 'Petugas', DOKTER: 'Dokter' };

export const userCreateSchema = z.object({
  username: z.string()
    .min(4, 'Username minimal 4 karakter')
    .max(30, 'Username maksimal 30 karakter')
    .regex(/^[a-zA-Z0-9]+$/, 'Username hanya boleh huruf dan angka'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(100, 'Nama lengkap maksimal 100 karakter'),
  role: z.enum(ROLE_OPTIONS, { errorMap: () => ({ message: 'Pilih role' }) }),
});

// Update: username immutable (tidak dikirim), password opsional (kosong = tidak diganti)
export const userUpdateSchema = z.object({
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
  namaLengkap: z.string().min(3, 'Nama lengkap minimal 3 karakter').max(100, 'Nama lengkap maksimal 100 karakter'),
  role: z.enum(ROLE_OPTIONS, { errorMap: () => ({ message: 'Pilih role' }) }),
  isActive: z.boolean(),
});
