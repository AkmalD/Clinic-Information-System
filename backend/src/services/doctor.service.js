const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

async function ensurePoliExists(poliId) {
  const poli = await prisma.poli.findUnique({ where: { id: Number(poliId) } });
  if (!poli) {
    throw new AppError('Poli tidak ditemukan', 404, { poliId: 'Poli yang dipilih tidak ada' });
  }
}

// Validasi kalau doctor mau ditautkan ke sebuah akun User (opsional)
async function ensureUserLinkable(userId, excludeDoctorId = null) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) {
    throw new AppError('User tidak ditemukan', 404, { userId: 'User yang dipilih tidak ada' });
  }
  if (user.role !== 'DOKTER') {
    throw new AppError('User yang dipilih bukan akun dengan role Dokter', 422, {
      userId: 'Role user harus DOKTER',
    });
  }

  const existingDoctor = await prisma.doctor.findFirst({
    where: {
      userId: Number(userId),
      ...(excludeDoctorId && { NOT: { id: excludeDoctorId } }),
    },
  });
  if (existingDoctor) {
    throw new AppError('User ini sudah terhubung ke data dokter lain', 409, {
      userId: 'User sudah memiliki data dokter',
    });
  }
}

async function createDoctor(data) {
  await ensurePoliExists(data.poliId);
  if (data.userId) {
    await ensureUserLinkable(data.userId);
  }

  return prisma.doctor.create({
    data: {
      nama: data.nama,
      poliId: Number(data.poliId),
      noSip: data.noSip || null,
      userId: data.userId ? Number(data.userId) : null,
    },
    include: { poli: true },
  });
}

async function getDoctors({ search = '', poliId } = {}) {
  // Master data dokter juga tidak dipaginasi (dipakai sebagai dropdown di Pendaftaran),
  // tapi mendukung filter ?poliId= supaya FE bisa "pilih poli dulu -> munculkan dokternya"
  const where = {
    ...(search && { nama: { contains: search, mode: 'insensitive' } }),
    ...(poliId && { poliId: Number(poliId) }),
  };

  return prisma.doctor.findMany({
    where,
    include: { poli: true },
    orderBy: { nama: 'asc' },
  });
}

async function getDoctorById(id) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: Number(id) },
    include: { poli: true },
  });
  if (!doctor) {
    throw new AppError('Dokter tidak ditemukan', 404);
  }
  return doctor;
}

async function updateDoctor(id, data) {
  await getDoctorById(id); // lempar 404 kalau tidak ada

  if (data.poliId) {
    await ensurePoliExists(data.poliId);
  }
  if (data.userId) {
    await ensureUserLinkable(data.userId, Number(id));
  }

  return prisma.doctor.update({
    where: { id: Number(id) },
    data: {
      ...(data.nama && { nama: data.nama }),
      ...(data.poliId && { poliId: Number(data.poliId) }),
      ...(data.noSip !== undefined && { noSip: data.noSip || null }),
      ...(data.userId !== undefined && { userId: data.userId ? Number(data.userId) : null }),
    },
    include: { poli: true },
  });
}

async function deleteDoctor(id) {
  await getDoctorById(id);
  // Kalau dokter masih dipakai registration/medical record -> P2003, ditangani errorHandler global
  return prisma.doctor.delete({ where: { id: Number(id) } });
}

module.exports = { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor };