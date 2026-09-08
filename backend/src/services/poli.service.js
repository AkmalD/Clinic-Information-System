const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

async function createPoli(data) {
  const existing = await prisma.poli.findFirst({
    where: { namaPoli: { equals: data.namaPoli, mode: 'insensitive' } },
  });
  if (existing) {
    throw new AppError('Nama poli sudah terdaftar', 409, {
      namaPoli: 'Nama poli sudah digunakan',
    });
  }

  return prisma.poli.create({ data: { namaPoli: data.namaPoli } });
}

async function getPolis({ search = '' } = {}) {
  // Master data poli biasanya sedikit (dipakai untuk dropdown pendaftaran/antrean),
  // jadi sengaja tidak dipaginasi seperti modul Patients — cukup search saja.
  const where = search ? { namaPoli: { contains: search, mode: 'insensitive' } } : {};

  return prisma.poli.findMany({ where, orderBy: { namaPoli: 'asc' } });
}

async function getPoliById(id) {
  const poli = await prisma.poli.findUnique({ where: { id: Number(id) } });
  if (!poli) {
    throw new AppError('Poli tidak ditemukan', 404);
  }
  return poli;
}

async function updatePoli(id, data) {
  await getPoliById(id); // lempar 404 kalau tidak ada

  if (data.namaPoli) {
    const existing = await prisma.poli.findFirst({
      where: {
        namaPoli: { equals: data.namaPoli, mode: 'insensitive' },
        NOT: { id: Number(id) },
      },
    });
    if (existing) {
      throw new AppError('Nama poli sudah digunakan poli lain', 409, {
        namaPoli: 'Nama poli sudah terdaftar',
      });
    }
  }

  return prisma.poli.update({
    where: { id: Number(id) },
    data: {
      ...(data.namaPoli && { namaPoli: data.namaPoli }),
    },
  });
}

async function deletePoli(id) {
  await getPoliById(id);
  // Kalau poli masih dipakai doctor/registration/queue -> P2003, ditangani errorHandler global
  return prisma.poli.delete({ where: { id: Number(id) } });
}

module.exports = { createPoli, getPolis, getPoliById, updatePoli, deletePoli };