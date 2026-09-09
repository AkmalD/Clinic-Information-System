import { z } from 'zod';

export const doctorSchema = z.object({
  nama: z.string().min(3, 'Nama dokter minimal 3 karakter').max(100, 'Nama dokter maksimal 100 karakter'),
  poliId: z.number({ invalid_type_error: 'Poli wajib dipilih' }).int().positive('Poli wajib dipilih'),
  noSip: z.string().max(50, 'No. SIP maksimal 50 karakter').optional(),
  // Opsional: dokter ini ditautkan ke akun login (User.role = DOKTER) atau tidak (null)
  userId: z.number().int().positive().nullable(),
});
