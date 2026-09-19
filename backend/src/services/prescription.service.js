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
      status: 'MENUNGGU',
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
    include: {
      items: { include: { medicine: true } },
      medicalRecord: {
        include: {
          patient: true,
          doctor: { include: { poli: true } },
          registration: { include: { invoice: true } },
        },
      },
      dispensedBy: {
        select: { id: true, namaLengkap: true, username: true },
      },
    },
  });
  if (!prescription) throw new AppError('Resep tidak ditemukan', 404);
  return prescription;
}

async function getPrescriptionQueue({ status = 'MENUNGGU' } = {}) {
  const prescriptions = await prisma.prescription.findMany({
    where: {
      ...(status && { status }),
      medicalRecord: {
        registration: {
          invoice: {
            status: {
              in: ['LUNAS', 'DITANGGUNG_BPJS', 'DITANGGUNG_ASURANSI'],
            },
          },
        },
      },
    },
    include: {
      items: {
        include: { medicine: true },
      },
      medicalRecord: {
        include: {
          patient: true,
          doctor: { include: { poli: true } },
          registration: {
            include: { invoice: true },
          },
        },
      },
      dispensedBy: {
        select: { id: true, namaLengkap: true, username: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return prescriptions;
}

async function dispensePrescription(prescriptionId, dispensedByUserId) {
  const prescription = await prisma.prescription.findUnique({
    where: { id: Number(prescriptionId) },
    include: {
      medicalRecord: {
        include: {
          registration: {
            include: { invoice: true },
          },
        },
      },
    },
  });

  if (!prescription) {
    throw new AppError('Resep tidak ditemukan', 404);
  }

  if (prescription.status === 'DISERAHKAN') {
    throw new AppError('Resep ini sudah pernah diserahkan sebelumnya', 400);
  }

  const invoice = prescription.medicalRecord?.registration?.invoice;
  if (!invoice) {
    throw new AppError('Tagihan untuk kunjungan ini belum diterbitkan', 400);
  }

  const VALID_PAYMENT_STATUSES = ['LUNAS', 'DITANGGUNG_BPJS', 'DITANGGUNG_ASURANSI'];
  if (!VALID_PAYMENT_STATUSES.includes(invoice.status)) {
    throw new AppError(
      `Obat tidak dapat diserahkan: Tagihan pasien belum lunas (Status: ${invoice.status})`,
      403,
      { invoiceStatus: invoice.status }
    );
  }

  const registrationId = prescription.medicalRecord.registrationId;

  return prisma.$transaction(async (tx) => {
    const updatedPrescription = await tx.prescription.update({
      where: { id: Number(prescriptionId) },
      data: {
        status: 'DISERAHKAN',
        dispensedAt: new Date(),
        dispensedById: dispensedByUserId ? Number(dispensedByUserId) : null,
      },
      include: {
        items: { include: { medicine: true } },
        dispensedBy: {
          select: { id: true, namaLengkap: true, username: true },
        },
      },
    });

    const updatedRegistration = await tx.registration.update({
      where: { id: Number(registrationId) },
      data: { status: 'SELESAI' },
      include: { patient: true, doctor: true, poli: true },
    });

    return {
      prescription: updatedPrescription,
      registration: updatedRegistration,
    };
  });
}

module.exports = {
  createPrescription,
  getPrescriptionById,
  getPrescriptionQueue,
  dispensePrescription,
};