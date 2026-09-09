const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

async function createPrescription(data) {
  const medicalRecord = await prisma.medicalRecord.findUnique({ where: { id: Number(data.medicalRecordId) } });
  if (!medicalRecord) throw new AppError('Catatan pemeriksaan tidak ditemukan', 404);

  const medicineIds = data.items.map((i) => Number(i.medicineId));
  const foundMedicines = await prisma.medicine.findMany({ where: { id: { in: medicineIds } } });
  if (foundMedicines.length !== new Set(medicineIds).size) {
    throw new AppError('Ada obat yang tidak ditemukan di master data', 404);
  }

  return prisma.prescription.create({
    data: {
      medicalRecordId: medicalRecord.id,
      items: {
        create: data.items.map((i) => ({
          medicineId: Number(i.medicineId),
          dosis: i.dosis,
          jumlah: Number(i.jumlah),
          aturanPakai: i.aturanPakai,
        })),
      },
    },
    include: { items: { include: { medicine: true } } },
  });
}

async function getPrescriptionById(id) {
  const prescription = await prisma.prescription.findUnique({
    where: { id: Number(id) },
    include: { items: { include: { medicine: true } }, medicalRecord: { include: { patient: true, doctor: true } } },
  });
  if (!prescription) throw new AppError('Resep tidak ditemukan', 404);
  return prescription;
}

module.exports = { createPrescription, getPrescriptionById };