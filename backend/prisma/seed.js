// prisma/seed.js

const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function upsertPoli(namaPoli) {
  const existing = await prisma.poli.findFirst({ where: { namaPoli } });
  if (existing) return existing;
  return prisma.poli.create({ data: { namaPoli } });
}

async function upsertMedicine(namaObat, satuan) {
  const existing = await prisma.medicine.findFirst({ where: { namaObat } });
  if (existing) return existing;
  return prisma.medicine.create({ data: { namaObat, satuan } });
}

async function main() {
  console.log('Seeding master data poli...');
  const poliUmum = await upsertPoli('Poli Umum');
  await upsertPoli('Poli Gigi');
  await upsertPoli('Poli Anak');
  await upsertPoli('Poli KIA');

  console.log('Seeding master data obat...');
  await upsertMedicine('Paracetamol 500mg', 'Tablet');
  await upsertMedicine('Amoxicillin 500mg', 'Kapsul');
  await upsertMedicine('Vitamin C', 'Tablet');
  await upsertMedicine('Antasida Doen', 'Tablet');
  await upsertMedicine('Ibuprofen 400mg', 'Tablet');
  await upsertMedicine('Obat Batuk Hitam (OBH)', 'Botol');

  console.log('Seeding akun default...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: Role.ADMIN,
      namaLengkap: 'Administrator',
    },
  });

  const petugasPassword = await bcrypt.hash('petugas123', 10);
  await prisma.user.upsert({
    where: { username: 'petugas1' },
    update: {},
    create: {
      username: 'petugas1',
      password: petugasPassword,
      role: Role.PETUGAS,
      namaLengkap: 'Petugas Pendaftaran',
    },
  });

  const dokterPassword = await bcrypt.hash('dokter123', 10);
  const dokterUser = await prisma.user.upsert({
    where: { username: 'dokter1' },
    update: {},
    create: {
      username: 'dokter1',
      password: dokterPassword,
      role: Role.DOKTER,
      namaLengkap: 'dr. Andi Wijaya',
    },
  });

  const existingDoctor = await prisma.doctor.findFirst({ where: { userId: dokterUser.id } });
  if (!existingDoctor) {
    await prisma.doctor.create({
      data: {
        userId: dokterUser.id,
        nama: 'dr. Andi Wijaya',
        poliId: poliUmum.id,
        noSip: '123/SIP/2026',
      },
    });
  }

  console.log('Seeding selesai.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });