const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

// Jangan pernah kirim balik field password ke response
function sanitize(user) {
  const { password, ...rest } = user;
  return rest;
}

async function createUser(data) {
  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) {
    throw new AppError('Username sudah digunakan', 409, { username: 'Username sudah dipakai' });
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: { username: data.username, password: hashed, role: data.role, namaLengkap: data.namaLengkap },
  });

  return sanitize(user);
}

async function getUsers({ role } = {}) {
  // ?role=DOKTER berguna buat dropdown "pilih akun dokter" saat link di modul Doctor
  const users = await prisma.user.findMany({
    where: { ...(role && { role }) },
    orderBy: { createdAt: 'desc' },
  });
  return users.map(sanitize);
}

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) throw new AppError('User tidak ditemukan', 404);
  return sanitize(user);
}

async function updateUser(id, data) {
  await getUserById(id);

  const updateData = {
    ...(data.namaLengkap && { namaLengkap: data.namaLengkap }),
    ...(data.role && { role: data.role }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const user = await prisma.user.update({ where: { id: Number(id) }, data: updateData });
  return sanitize(user);
}

// Soft delete: nonaktifkan, BUKAN hapus permanen.
// Alasan: user.id dipakai sebagai referensi historis (Registration.createdBy, Doctor.userId) -
// hard delete akan gagal kena foreign key constraint, atau merusak jejak data lama.
async function deactivateUser(id) {
  await getUserById(id);
  const user = await prisma.user.update({ where: { id: Number(id) }, data: { isActive: false } });
  return sanitize(user);
}

module.exports = { createUser, getUsers, getUserById, updateUser, deactivateUser };