import { z } from 'zod';

export const patientSchema = z.object({
  nik: z.string().regex(/^\d{16}$/, 'NIK harus 16 digit angka'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  jenisKelamin: z.enum(['L', 'P'], { errorMap: () => ({ message: 'Pilih jenis kelamin' }) }),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  noTelp: z.string().regex(/^[0-9+]{8,15}$/, 'Nomor telepon tidak valid (8-15 digit)'),
  alamat: z.string().min(5, 'Alamat minimal 5 karakter'),
});