const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

async function ensurePoliExists(poliId) {
  const poli = await prisma.poli.findUnique({ where: { id: Number(poliId) } });
  if (!poli) {
    throw new AppError('Poli tidak ditemukan', 404, { poliId: 'Poli yang dipilih tidak ada' });
  }
  return poli;
}

// Validasi kalau doctor mau ditautkan ke sebuah akun User
async function ensureUserLinkable(userId, excludeDoctorId = null) {
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  if (!user) {
    throw new AppError('User tidak ditemukan', 404, { userId: 'User yang dipilih tidak ada' });
  }
  if (user.role !== 'DOKTER') {
    throw new AppError('User yang dipilih bukan akun dengan role Dokter', 422, {
      userId: 'Role user harus DOKTER',
    });
  }

  const existingDoctor = await prisma.doctor.findFirst({
    where: {
      userId: Number(userId),
      ...(excludeDoctorId && { NOT: { id: Number(excludeDoctorId) } }),
    },
  });
  if (existingDoctor) {
    throw new AppError('User ini sudah terhubung ke data dokter lain', 409, {
      userId: 'User sudah memiliki data dokter',
    });
  }
  return user;
}

async function createDoctor(data) {
  await ensurePoliExists(data.poliId);

  return prisma.$transaction(async (tx) => {
    let doctorUserId = data.userId ? Number(data.userId) : null;

    if (doctorUserId) {
      await ensureUserLinkable(doctorUserId);
    } else {
      if (!data.username || !data.password) {
        throw new AppError('Username dan password wajib diisi untuk membuat akun login dokter', 422, {
          username: 'Username wajib diisi jika tidak menyertakan userId',
          password: 'Password wajib diisi jika tidak menyertakan userId',
        });
      }

      const existingUser = await tx.user.findUnique({ where: { username: data.username } });
      if (existingUser) {
        throw new AppError('Username sudah digunakan', 409, { username: 'Username sudah dipakai' });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newUser = await tx.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          role: 'DOKTER',
          namaLengkap: data.nama,
          isActive: true,
        },
      });

      doctorUserId = newUser.id;
    }

    return tx.doctor.create({
      data: {
        nama: data.nama,
        poliId: Number(data.poliId),
        noSip: data.noSip || null,
        biayaKonsultasi: data.biayaKonsultasi !== undefined ? Number(data.biayaKonsultasi) : 50000,
        userId: doctorUserId,
      },
      include: {
        poli: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  });
}

async function getDoctors({ search = '', poliId } = {}) {
  const where = {
    ...(search && { nama: { contains: search, mode: 'insensitive' } }),
    ...(poliId && { poliId: Number(poliId) }),
  };

  return prisma.doctor.findMany({
    where,
    include: {
      poli: true,
      user: {
        select: {
          id: true,
          username: true,
          role: true,
          isActive: true,
        },
      },
    },
    orderBy: { nama: 'asc' },
  });
}

async function getDoctorById(id) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: Number(id) },
    include: {
      poli: true,
      user: {
        select: {
          id: true,
          username: true,
          role: true,
          isActive: true,
        },
      },
    },
  });
  if (!doctor) {
    throw new AppError('Dokter tidak ditemukan', 404);
  }
  return doctor;
}

async function updateDoctor(id, data) {
  const doctor = await getDoctorById(id);

  if (data.poliId) {
    await ensurePoliExists(data.poliId);
  }
  if (data.userId && Number(data.userId) !== doctor.userId) {
    await ensureUserLinkable(data.userId, Number(id));
  }

  return prisma.$transaction(async (tx) => {
    if (data.isActive !== undefined || data.password || data.nama) {
      const userUpdate = {};
      if (data.isActive !== undefined) userUpdate.isActive = Boolean(data.isActive);
      if (data.password) userUpdate.password = await bcrypt.hash(data.password, 10);
      if (data.nama) userUpdate.namaLengkap = data.nama;

      await tx.user.update({
        where: { id: doctor.userId },
        data: userUpdate,
      });
    }

    return tx.doctor.update({
      where: { id: Number(id) },
      data: {
        ...(data.nama && { nama: data.nama }),
        ...(data.poliId && { poliId: Number(data.poliId) }),
        ...(data.noSip !== undefined && { noSip: data.noSip || null }),
        ...(data.biayaKonsultasi !== undefined && { biayaKonsultasi: Number(data.biayaKonsultasi) }),
        ...(data.userId && { userId: Number(data.userId) }),
      },
      include: {
        poli: true,
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            isActive: true,
          },
        },
      },
    });
  });
}

async function deleteDoctor(id) {
  const doctor = await getDoctorById(id);
  return prisma.$transaction(async (tx) => {
    const deleted = await tx.doctor.delete({ where: { id: Number(id) } });
    if (doctor.userId) {
      await tx.user.update({
        where: { id: doctor.userId },
        data: { isActive: false },
      });
    }
    return deleted;
  });
}

module.exports = { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor };