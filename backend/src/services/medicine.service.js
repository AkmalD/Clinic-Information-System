const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

async function getMedicines({ search = '' } = {}) {
  return prisma.medicine.findMany({
    where: search ? { namaObat: { contains: search, mode: 'insensitive' } } : {},
    orderBy: { namaObat: 'asc' },
  });
}

async function getMedicineById(id) {
  const medicine = await prisma.medicine.findUnique({
    where: { id: Number(id) },
  });
  if (!medicine) throw new AppError('Obat tidak ditemukan', 404);
  return medicine;
}

async function createMedicine(data) {
  const existing = await prisma.medicine.findFirst({
    where: { namaObat: { equals: data.namaObat, mode: 'insensitive' } },
  });
  if (existing) {
    throw new AppError('Obat dengan nama tersebut sudah ada di katalog', 409, {
      namaObat: 'Nama obat sudah terdaftar',
    });
  }

  return prisma.medicine.create({
    data: {
      namaObat: data.namaObat,
      satuan: data.satuan,
      harga: Number(data.harga || 0),
    },
  });
}

async function updateMedicine(id, data) {
  await getMedicineById(id);

  if (data.namaObat) {
    const existing = await prisma.medicine.findFirst({
      where: {
        namaObat: { equals: data.namaObat, mode: 'insensitive' },
        NOT: { id: Number(id) },
      },
    });
    if (existing) {
      throw new AppError('Obat dengan nama tersebut sudah ada di katalog', 409, {
        namaObat: 'Nama obat sudah terdaftar',
      });
    }
  }

  return prisma.medicine.update({
    where: { id: Number(id) },
    data: {
      ...(data.namaObat && { namaObat: data.namaObat }),
      ...(data.satuan && { satuan: data.satuan }),
      ...(data.harga !== undefined && { harga: Number(data.harga) }),
    },
  });
}

async function deleteMedicine(id) {
  await getMedicineById(id);

  // Cek apakah obat sudah pernah diresepkan
  const usedCount = await prisma.prescriptionItem.count({
    where: { medicineId: Number(id) },
  });

  if (usedCount > 0) {
    throw new AppError(
      'Obat tidak dapat dihapus karena sudah memiliki riwayat peresepan pasien',
      400
    );
  }

  return prisma.medicine.delete({
    where: { id: Number(id) },
  });
}

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
};