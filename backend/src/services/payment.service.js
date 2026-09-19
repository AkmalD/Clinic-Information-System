const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

async function getInvoices({ status, jenisPembayaran, date } = {}) {
  const where = {
    ...(status && { status }),
    ...(jenisPembayaran && { jenisPembayaran }),
    ...(date && {
      createdAt: {
        gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
        lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
      },
    }),
  };

  return prisma.invoice.findMany({
    where,
    include: {
      registration: {
        include: {
          patient: true,
          doctor: true,
          poli: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getInvoiceByRegistrationId(registrationId) {
  const invoice = await prisma.invoice.findUnique({
    where: { registrationId: Number(registrationId) },
    include: {
      registration: {
        include: {
          patient: true,
          doctor: { include: { poli: true } },
          poli: true,
          medicalRecord: {
            include: {
              medicalActions: true,
              prescriptions: {
                include: {
                  items: { include: { medicine: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError('Tagihan / Invoice tidak ditemukan untuk pendaftaran ini', 404);
  }

  return invoice;
}

async function processPayment(data) {
  const { registrationId, invoiceId, metodePembayaran, paymentToken } = data;

  if (!registrationId && !invoiceId) {
    throw new AppError('registrationId atau invoiceId wajib disertakan', 400);
  }

  const where = invoiceId
    ? { id: Number(invoiceId) }
    : { registrationId: Number(registrationId) };

  const invoice = await prisma.invoice.findUnique({
    where,
    include: {
      registration: {
        include: {
          medicalRecord: {
            include: {
              prescriptions: {
                include: { items: true },
              },
            },
          },
        },
      },
    },
  });

  if (!invoice) {
    throw new AppError('Tagihan / Invoice tidak ditemukan', 404);
  }

  if (invoice.status === 'LUNAS') {
    throw new AppError('Tagihan ini sudah lunas sebelumnya', 400);
  }
  if (invoice.status === 'DITANGGUNG_BPJS' || invoice.status === 'DITANGGUNG_ASURANSI') {
    throw new AppError(`Tagihan ini telah dijamin oleh penjamin (${invoice.status}), tidak perlu pembayaran mandiri`, 400);
  }

  const prescriptions = invoice.registration?.medicalRecord?.prescriptions || [];
  const hasPrescription = prescriptions.some((p) => p.items && p.items.length > 0);
  const nextRegistrationStatus = hasPrescription ? 'FARMASI' : 'SELESAI';

  return prisma.$transaction(async (tx) => {
    const updatedInvoice = await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        status: 'LUNAS',
        metode: metodePembayaran || 'GATEWAY',
        paymentToken: paymentToken || `PAY-${Date.now()}-${invoice.id}`,
        paidAt: new Date(),
      },
    });

    const updatedRegistration = await tx.registration.update({
      where: { id: invoice.registrationId },
      data: { status: nextRegistrationStatus },
      include: {
        patient: true,
        doctor: true,
        poli: true,
        queue: true,
      },
    });

    return {
      invoice: updatedInvoice,
      registration: updatedRegistration,
    };
  });
}

module.exports = {
  getInvoices,
  getInvoiceByRegistrationId,
  processPayment,
};
