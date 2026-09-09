const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

// Hanya boleh maju 1 langkah, sesuai state machine di planning
const VALID_TRANSITIONS = {
  MENUNGGU: ['CHECK_IN'],
  CHECK_IN: ['PEMERIKSAAN'],
  PEMERIKSAAN: ['SELESAI'],
  SELESAI: [],
};

async function ensureExists(model, id, label) {
  const record = await prisma[model].findUnique({ where: { id: Number(id) } });
  if (!record) {
    throw new AppError(`${label} tidak ditemukan`, 404);
  }
  return record;
}

async function createRegistration(data, userId) {
  const doctor = await ensureExists('doctor', data.doctorId, 'Dokter');
  await ensureExists('patient', data.patientId, 'Pasien');
  await ensureExists('poli', data.poliId, 'Poli');

  if (doctor.poliId !== Number(data.poliId)) {
    throw new AppError('Dokter yang dipilih tidak berpraktik di poli tersebut', 422, {
      doctorId: 'Dokter tidak terdaftar di poli ini',
    });
  }

  return prisma.$transaction(async (tx) => {
    const created = await tx.registration.create({
      data: {
        noRegistrasi: `TEMP-${Date.now()}`,
        patientId: Number(data.patientId),
        doctorId: Number(data.doctorId),
        poliId: Number(data.poliId),
        tanggalKunjungan: new Date(data.tanggalKunjungan),
        jenisPembayaran: data.jenisPembayaran,
        keluhanAwal: data.keluhanAwal || null,
        status: 'MENUNGGU',
        createdById: userId,
      },
    });

    const tahun = created.createdAt.getFullYear();
    const noRegistrasi = `REG-${tahun}-${String(created.id).padStart(6, '0')}`;

    return tx.registration.update({
      where: { id: created.id },
      data: { noRegistrasi },
      include: { patient: true, doctor: true, poli: true },
    });
  });
}

async function getRegistrations({ date, status } = {}) {
  const where = {
    ...(date && { tanggalKunjungan: new Date(date) }),
    ...(status && { status }),
  };

  return prisma.registration.findMany({
    where,
    include: { patient: true, doctor: true, poli: true, queue: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getRegistrationById(id) {
  const registration = await prisma.registration.findUnique({
    where: { id: Number(id) },
    include: { patient: true, doctor: true, poli: true, queue: true, medicalRecord: true },
  });
  if (!registration) throw new AppError('Pendaftaran tidak ditemukan', 404);
  return registration;
}

async function updateRegistration(id, data) {
  const registration = await getRegistrationById(id);

  if (data.status && data.status !== registration.status) {
    const allowed = VALID_TRANSITIONS[registration.status] || [];
    if (!allowed.includes(data.status)) {
      throw new AppError(
        `Transisi status tidak valid: dari '${registration.status}' ke '${data.status}'`,
        400,
        { status: `Hanya bisa diubah ke: ${allowed.join(', ') || '(sudah final)'}` }
      );
    }
    if (data.status === 'SELESAI' && !registration.medicalRecord) {
      throw new AppError('Belum ada catatan pemeriksaan (SOAP), kunjungan belum bisa diselesaikan', 400);
    }
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.registration.update({
      where: { id: Number(id) },
      data: {
        ...(data.jenisPembayaran && { jenisPembayaran: data.jenisPembayaran }),
        ...(data.keluhanAwal !== undefined && { keluhanAwal: data.keluhanAwal || null }),
        ...(data.status && { status: data.status }),
      },
      include: { patient: true, doctor: true, poli: true, queue: true },
    });

    // Cascade: kalau kunjungan Selesai, antreannya juga ikut Selesai
    if (data.status === 'SELESAI' && registration.queue?.status === 'DIPANGGIL') {
      await tx.queue.update({ where: { id: registration.queue.id }, data: { status: 'SELESAI' } });
      updated.queue.status = 'SELESAI';
    }

    return updated;
  });
}

module.exports = { createRegistration, getRegistrations, getRegistrationById, updateRegistration };