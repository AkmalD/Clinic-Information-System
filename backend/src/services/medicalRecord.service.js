const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

async function createMedicalRecord(data) {
  const registration = await prisma.registration.findUnique({
    where: { id: Number(data.registrationId) },
    include: { medicalRecord: true },
  });

  if (!registration) throw new AppError('Pendaftaran tidak ditemukan', 404);
  if (registration.medicalRecord) {
    throw new AppError('Pendaftaran ini sudah punya catatan pemeriksaan', 409);
  }
  if (registration.status !== 'PEMERIKSAAN') {
    throw new AppError(
      `Pendaftaran berstatus '${registration.status}', pasien belum dipanggil masuk pemeriksaan`,
      400
    );
  }

  return prisma.medicalRecord.create({
    data: {
      registrationId: registration.id,
      patientId: registration.patientId,
      doctorId: registration.doctorId,
      keluhan: data.keluhan,
      tekananDarah: data.tekananDarah,
      suhuTubuh: data.suhuTubuh,
      beratBadan: data.beratBadan,
      tinggiBadan: data.tinggiBadan,
      diagnosa: data.diagnosa,
      rencanaTerapi: data.rencanaTerapi,
      medicalActions: {
        create: (data.tindakanMedis || []).map((t) => ({
          namaTindakan: t.namaTindakan,
          keterangan: t.keterangan || null,
        })),
      },
    },
    include: { medicalActions: true, patient: true, doctor: true },
  });
}

async function getMedicalRecordsByPatient(patientId) {
  const patient = await prisma.patient.findUnique({ where: { id: Number(patientId) } });
  if (!patient) throw new AppError('Pasien tidak ditemukan', 404);

  return prisma.medicalRecord.findMany({
    where: { patientId: Number(patientId) },
    include: {
      doctor: true,
      medicalActions: true,
      prescriptions: { include: { items: { include: { medicine: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { createMedicalRecord, getMedicalRecordsByPatient };