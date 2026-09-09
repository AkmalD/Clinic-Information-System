const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function getToday() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function getSummary() {
  const today = getToday();

  const [totalPasien, totalPasienHariIni, totalAntreanHariIni, totalMenunggu, totalSelesai] =
    await prisma.$transaction([
      prisma.patient.count(),
      prisma.registration.count({ where: { tanggalKunjungan: today } }),
      prisma.queue.count({ where: { tanggal: today } }),
      prisma.registration.count({ where: { tanggalKunjungan: today, status: 'MENUNGGU' } }),
      prisma.registration.count({ where: { tanggalKunjungan: today, status: 'SELESAI' } }),
    ]);

  return {
    totalPasien,
    totalPasienHariIni,
    totalAntreanHariIni,
    totalPasienMenunggu: totalMenunggu,
    totalPasienSelesaiDilayani: totalSelesai,
  };
}

module.exports = { getSummary };