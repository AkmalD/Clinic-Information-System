const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getMedicines({ search = '' } = {}) {
  return prisma.medicine.findMany({
    where: search ? { namaObat: { contains: search, mode: 'insensitive' } } : {},
    orderBy: { namaObat: 'asc' },
  });
}

module.exports = { getMedicines };