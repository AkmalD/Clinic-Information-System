// prisma/seed.js

const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function upsertPoli(kodePoli, namaPoli) {
  const existing = await prisma.poli.findFirst({
    where: {
      OR: [{ kodePoli }, { namaPoli }],
    },
  });
  if (existing) {
    return prisma.poli.update({
      where: { id: existing.id },
      data: { kodePoli, namaPoli },
    });
  }
  return prisma.poli.create({ data: { kodePoli, namaPoli } });
}

async function upsertMedicine(namaObat, satuan, harga) {
  const existing = await prisma.medicine.findFirst({ where: { namaObat } });
  if (existing) {
    return prisma.medicine.update({
      where: { id: existing.id },
      data: { satuan, harga },
    });
  }
  return prisma.medicine.create({ data: { namaObat, satuan, harga } });
}

async function main() {
  console.log('Seeding master data poli...');
  const poliUmum = await upsertPoli('UMU', 'Poli Umum');
  const poliGigi = await upsertPoli('GGI', 'Poli Gigi');
  await upsertPoli('ANK', 'Poli Anak');
  await upsertPoli('KIA', 'Poli KIA');

  console.log('Seeding master data obat...');
  await upsertMedicine('Paracetamol 500mg', 'Tablet', 5000);
  await upsertMedicine('Amoxicillin 500mg', 'Kapsul', 12000);
  await upsertMedicine('Vitamin C', 'Tablet', 4000);
  await upsertMedicine('Antasida Doen', 'Tablet', 6000);
  await upsertMedicine('Ibuprofen 400mg', 'Tablet', 8000);
  await upsertMedicine('Obat Batuk Hitam (OBH)', 'Botol', 15000);

  console.log('Seeding akun default & dokter...');

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
      namaLengkap: 'Petugas Pendaftaran & Kasir',
    },
  });

  const farmasiPassword = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { username: 'farmasi' },
    update: {},
    create: {
      username: 'farmasi',
      password: farmasiPassword,
      role: Role.FARMASI,
      namaLengkap: 'Petugas Farmasi',
    },
  });

  const dokterPassword = await bcrypt.hash('dokter123', 10);
  const dokter1User = await prisma.user.upsert({
    where: { username: 'dokter1' },
    update: {},
    create: {
      username: 'dokter1',
      password: dokterPassword,
      role: Role.DOKTER,
      namaLengkap: 'dr. Andi Wijaya',
    },
  });

  const existingDoctor1 = await prisma.doctor.findFirst({ where: { userId: dokter1User.id } });
  if (!existingDoctor1) {
    await prisma.doctor.create({
      data: {
        userId: dokter1User.id,
        nama: 'dr. Andi Wijaya',
        poliId: poliUmum.id,
        noSip: '123/SIP/2026',
        biayaKonsultasi: 50000,
      },
    });
  } else {
    await prisma.doctor.update({
      where: { id: existingDoctor1.id },
      data: {
        poliId: poliUmum.id,
        biayaKonsultasi: 50000,
      },
    });
  }

  const dokter2User = await prisma.user.upsert({
    where: { username: 'dokter2' },
    update: {},
    create: {
      username: 'dokter2',
      password: dokterPassword,
      role: Role.DOKTER,
      namaLengkap: 'drg. Siti Aminah',
    },
  });

  const existingDoctor2 = await prisma.doctor.findFirst({ where: { userId: dokter2User.id } });
  if (!existingDoctor2) {
    await prisma.doctor.create({
      data: {
        userId: dokter2User.id,
        nama: 'drg. Siti Aminah',
        poliId: poliGigi.id,
        noSip: '456/SIP/2026',
        biayaKonsultasi: 60000,
      },
    });
  } else {
    await prisma.doctor.update({
      where: { id: existingDoctor2.id },
      data: {
        poliId: poliGigi.id,
        biayaKonsultasi: 60000,
      },
    });
  }

  const dokter3User = await prisma.user.upsert({
    where: { username: 'dokter3' },
    update: {},
    create: {
      username: 'dokter3',
      password: dokterPassword,
      role: Role.DOKTER,
      namaLengkap: 'dr. Sarah Melati, Sp.A',
    },
  });

  const existingDoctor3 = await prisma.doctor.findFirst({ where: { userId: dokter3User.id } });
  if (!existingDoctor3) {
    await prisma.doctor.create({
      data: {
        userId: dokter3User.id,
        nama: 'dr. Sarah Melati, Sp.A',
        poliId: (await prisma.poli.findFirst({ where: { kodePoli: 'ANK' } })).id,
        noSip: '789/SIP/2026',
        biayaKonsultasi: 75000,
      },
    });
  }

  const dokter4User = await prisma.user.upsert({
    where: { username: 'dokter4' },
    update: {},
    create: {
      username: 'dokter4',
      password: dokterPassword,
      role: Role.DOKTER,
      namaLengkap: 'dr. Ratna Dewi, Sp.OG',
    },
  });

  const existingDoctor4 = await prisma.doctor.findFirst({ where: { userId: dokter4User.id } });
  if (!existingDoctor4) {
    await prisma.doctor.create({
      data: {
        userId: dokter4User.id,
        nama: 'dr. Ratna Dewi, Sp.OG',
        poliId: (await prisma.poli.findFirst({ where: { kodePoli: 'KIA' } })).id,
        noSip: '321/SIP/2026',
        biayaKonsultasi: 70000,
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