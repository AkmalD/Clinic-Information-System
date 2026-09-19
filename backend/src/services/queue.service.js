const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

const VALID_TRANSITIONS = {
  MENUNGGU: ['DIPANGGIL'],
  DIPANGGIL: ['SELESAI'],
  SELESAI: [],
};

async function generateNextQueueNumber(txOrPrisma, poliId, tanggal) {
  const client = txOrPrisma || prisma;
  const poli = await client.poli.findUnique({
    where: { id: Number(poliId) },
    select: { kodePoli: true },
  });

  const prefix = poli?.kodePoli || 'POL';
  const targetDate = new Date(tanggal);

  const count = await client.queue.count({
    where: {
      poliId: Number(poliId),
      tanggal: targetDate,
    },
  });

  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

async function createQueue(registrationId) {
  const registration = await prisma.registration.findUnique({
    where: { id: Number(registrationId) },
    include: { queue: true },
  });

  if (!registration) throw new AppError('Pendaftaran tidak ditemukan', 404);
  if (registration.queue) throw new AppError('Pendaftaran ini sudah punya nomor antrean', 409);

  return prisma.$transaction(async (tx) => {
    const nomorAntrean = await generateNextQueueNumber(tx, registration.poliId, registration.tanggalKunjungan);

    return tx.queue.create({
      data: {
        registrationId: registration.id,
        nomorAntrean,
        poliId: registration.poliId,
        tanggal: registration.tanggalKunjungan,
        status: 'MENUNGGU',
      },
      include: { registration: { include: { patient: true, doctor: true } }, poli: true },
    });
  });
}

async function getQueues({ tanggal, poliId, status } = {}) {
  const where = {
    tanggal: tanggal ? new Date(tanggal) : new Date(new Date().toISOString().slice(0, 10)),
    ...(poliId && { poliId: Number(poliId) }),
    ...(status && { status }),
  };

  return prisma.queue.findMany({
    where,
    include: { registration: { include: { patient: true, doctor: true } }, poli: true },
    orderBy: { nomorAntrean: 'asc' },
  });
}

async function getQueueById(id) {
  const queue = await prisma.queue.findUnique({
    where: { id: Number(id) },
    include: { registration: true, poli: true },
  });
  if (!queue) throw new AppError('Antrean tidak ditemukan', 404);
  return queue;
}

async function callQueue(id) {
  const queue = await getQueueById(id);

  if (queue.status !== 'MENUNGGU') {
    throw new AppError(`Antrean dengan status '${queue.status}' tidak bisa dipanggil`, 400);
  }
  if (queue.registration.status !== 'CHECK_IN') {
    throw new AppError('Pasien belum check-in, tidak bisa dipanggil', 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.registration.update({
      where: { id: queue.registrationId },
      data: { status: 'PEMERIKSAAN' },
    });

    return tx.queue.update({
      where: { id: Number(id) },
      data: { status: 'DIPANGGIL', calledAt: new Date() },
      include: { registration: true, poli: true },
    });
  });
}

async function updateQueueStatus(id, status) {
  const queue = await getQueueById(id);

  const allowed = VALID_TRANSITIONS[queue.status] || [];
  if (!allowed.includes(status)) {
    throw new AppError(
      `Transisi status tidak valid: dari '${queue.status}' ke '${status}'`,
      400,
      { status: `Hanya bisa diubah ke: ${allowed.join(', ') || '(sudah final)'}` }
    );
  }

  return prisma.queue.update({
    where: { id: Number(id) },
    data: { status },
    include: { registration: true, poli: true },
  });
}

module.exports = {
  createQueue,
  getQueues,
  getQueueById,
  callQueue,
  updateQueueStatus,
  generateNextQueueNumber,
};