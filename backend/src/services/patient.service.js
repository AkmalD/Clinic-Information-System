const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

async function createPatient(data) {
  const existingNik = await prisma.patient.findUnique({ where: { nik: data.nik } });
  if (existingNik) {
    throw new AppError('NIK sudah terdaftar', 409, { nik: 'NIK sudah digunakan pasien lain' });
  }

  return prisma.$transaction(async (tx) => {
    // Placeholder sementara (unik by timestamp) karena no_rm butuh id yang baru di-generate DB
    const created = await tx.patient.create({
      data: {
        noRm: `TEMP-${Date.now()}`,
        nik: data.nik,
        nama: data.nama,
        jenisKelamin: data.jenisKelamin,
        tanggalLahir: new Date(data.tanggalLahir),
        noTelp: data.noTelp,
        alamat: data.alamat,
      },
    });

    const tahun = created.createdAt.getFullYear();
    const noRm = `${tahun}-${String(created.id).padStart(6, '0')}`;

    return tx.patient.update({
      where: { id: created.id },
      data: { noRm },
    });
  });
}

async function getPatients({ search = '', page = 1, limit = 10 }) {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const skip = (pageNum - 1) * limitNum;

  const where = search
    ? {
        OR: [
          { nama: { contains: search, mode: 'insensitive' } },
          { nik: { contains: search } },
          { noRm: { contains: search } },
        ],
      }
    : {};

  const [total, patients] = await prisma.$transaction([
    prisma.patient.count({ where }),
    prisma.patient.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' } }),
  ]);

  return {
    patients,
    pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
  };
}

async function getPatientById(id) {
  const patient = await prisma.patient.findUnique({ where: { id: Number(id) } });
  if (!patient) {
    throw new AppError('Pasien tidak ditemukan', 404);
  }
  return patient;
}

async function updatePatient(id, data) {
  await getPatientById(id); // lempar 404 kalau tidak ada

  if (data.nik) {
    const existingNik = await prisma.patient.findFirst({
      where: { nik: data.nik, NOT: { id: Number(id) } },
    });
    if (existingNik) {
      throw new AppError('NIK sudah digunakan pasien lain', 409, { nik: 'NIK sudah terdaftar' });
    }
  }

  return prisma.patient.update({
    where: { id: Number(id) },
    data: {
      ...(data.nik && { nik: data.nik }),
      ...(data.nama && { nama: data.nama }),
      ...(data.jenisKelamin && { jenisKelamin: data.jenisKelamin }),
      ...(data.tanggalLahir && { tanggalLahir: new Date(data.tanggalLahir) }),
      ...(data.noTelp && { noTelp: data.noTelp }),
      ...(data.alamat && { alamat: data.alamat }),
    },
  });
}

async function deletePatient(id) {
  await getPatientById(id);
  return prisma.patient.delete({ where: { id: Number(id) } });
}

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };