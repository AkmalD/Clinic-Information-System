const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const AppError = require('../utils/appError');

const prisma = new PrismaClient();

async function login(username, password) {
  if (!username || !password) {
    throw new AppError('Username dan password wajib diisi', 400, {
      ...(!username && { username: 'wajib diisi' }),
      ...(!password && { password: 'wajib diisi' }),
    });
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new AppError('Username atau password salah', 401);
  }

  if (!user.isActive) {
    throw new AppError('Akun tidak aktif, hubungi administrator', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Username atau password salah', 401);
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      namaLengkap: user.namaLengkap,
    },
  };
}

module.exports = { login };