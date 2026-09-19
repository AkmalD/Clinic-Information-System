const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

async function createMedicalRecord(data) {
  const registration = await prisma.registration.findUnique({
    where: { id: Number(data.registrationId) },
    include: {
      medicalRecord: true,
      doctor: true,
      queue: true,
    },
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

  // 1. Hitung biaya resep obat
  let biayaObat = 0;
  const resepItems = Array.isArray(data.resep) ? data.resep : [];
  const hasPrescription = resepItems.length > 0;

  if (hasPrescription) {
    const medicineIds = resepItems.map((i) => Number(i.medicineId));
    const medicines = await prisma.medicine.findMany({
      where: { id: { in: medicineIds } },
    });

    if (medicines.length !== new Set(medicineIds).size) {
      throw new AppError('Ada obat yang tidak ditemukan di master data', 404);
    }

    const medicineMap = new Map(medicines.map((m) => [m.id, m]));
    for (const item of resepItems) {
      const med = medicineMap.get(Number(item.medicineId));
      biayaObat += (med.harga || 0) * Number(item.jumlah);
    }
  }

  // 2. Hitung biaya tindakan
  let biayaTindakan = Number(data.biayaTindakan || 0);
  if (Array.isArray(data.tindakanMedis)) {
    for (const tindakan of data.tindakanMedis) {
      if (tindakan.biaya) {
        biayaTindakan += Number(tindakan.biaya);
      }
    }
  }

  // 3. Biaya konsultasi dokter
  const biayaKonsultasi = registration.doctor?.biayaKonsultasi || 50000;
  const totalBiaya = biayaKonsultasi + biayaTindakan + biayaObat;

  // 4. Logika Billing & Transisi Status Berdasarkan Jenis Pembayaran
  let totalPasienBayar = 0;
  let statusPembayaran = 'MENUNGGU_PEMBAYARAN';
  let nextRegistrationStatus = 'PEMBAYARAN';
  let metodePembayaran = null;
  let paidAt = null;

  if (registration.jenisPembayaran === 'UMUM') {
    totalPasienBayar = totalBiaya;
    statusPembayaran = 'MENUNGGU_PEMBAYARAN';
    nextRegistrationStatus = 'PEMBAYARAN';
    metodePembayaran = null;
    paidAt = null;
  } else if (registration.jenisPembayaran === 'BPJS') {
    totalPasienBayar = 0;
    statusPembayaran = 'DITANGGUNG_BPJS';
    metodePembayaran = 'BPJS';
    paidAt = new Date();
    nextRegistrationStatus = hasPrescription ? 'FARMASI' : 'SELESAI';
  } else if (registration.jenisPembayaran === 'ASURANSI') {
    totalPasienBayar = 0;
    statusPembayaran = 'DITANGGUNG_ASURANSI';
    metodePembayaran = 'ASURANSI';
    paidAt = new Date();
    nextRegistrationStatus = hasPrescription ? 'FARMASI' : 'SELESAI';
  }

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const noInvoice = `INV-${dateStr}-${String(registration.id).padStart(6, '0')}`;

  return prisma.$transaction(async (tx) => {
    // A. Simpan Catatan Pemeriksaan (SOAP) + Tindakan + Resep
    const medicalRecord = await tx.medicalRecord.create({
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
        ...(hasPrescription && {
          prescriptions: {
            create: {
              status: 'MENUNGGU',
              items: {
                create: resepItems.map((r) => ({
                  medicineId: Number(r.medicineId),
                  dosis: r.dosis,
                  jumlah: Number(r.jumlah),
                  aturanPakai: r.aturanPakai,
                })),
              },
            },
          },
        }),
      },
      include: {
        medicalActions: true,
        prescriptions: {
          include: {
            items: {
              include: { medicine: true },
            },
          },
        },
        patient: true,
        doctor: true,
      },
    });

    // B. Terbitkan Invoice otomatis
    const invoice = await tx.invoice.create({
      data: {
        registrationId: registration.id,
        noInvoice,
        totalBiaya,
        biayaKonsultasi,
        biayaTindakan,
        biayaObat,
        totalPasienBayar,
        jenisPembayaran: registration.jenisPembayaran,
        status: statusPembayaran,
        metode: metodePembayaran,
        nomorPenjamin: data.nomorPenjamin || null,
        paidAt,
      },
    });

    // C. Update status Registrasi sesuai jenis pembayaran
    const updatedRegistration = await tx.registration.update({
      where: { id: registration.id },
      data: { status: nextRegistrationStatus },
      include: { queue: true },
    });

    // D. Selesaikan antrean dokter
    if (registration.queue && registration.queue.status !== 'SELESAI') {
      await tx.queue.update({
        where: { id: registration.queue.id },
        data: { status: 'SELESAI' },
      });
    }

    return {
      ...medicalRecord,
      invoice,
      registration: updatedRegistration,
    };
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
      registration: { include: { invoice: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = { createMedicalRecord, getMedicalRecordsByPatient };