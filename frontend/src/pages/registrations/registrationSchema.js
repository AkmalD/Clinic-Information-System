import { z } from 'zod';

export const registrationSchema = z.object({
  patientId: z.number({ invalid_type_error: 'Pasien wajib dipilih' }),
  poliId: z.number({ invalid_type_error: 'Poli wajib dipilih' }),
  doctorId: z.number({ invalid_type_error: 'Dokter wajib dipilih' }),
  tanggalKunjungan: z.string().min(1, 'Tanggal kunjungan wajib diisi'),
  jenisPembayaran: z.enum(['UMUM', 'BPJS', 'ASURANSI'], { errorMap: () => ({ message: 'Pilih jenis pembayaran' }) }),
  keluhanAwal: z.string().optional(),
});