const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../db');

router.post('/register', async (req, res) => {
  const { email, nama, password } = req.body;

  if (!email || !nama || !password) {
    return res.status(400).json({ message: 'Field wajib kosong' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'Password minimal 8 karakter' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        nama,
        password: hashedPassword,
        role: 'user' 
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'Registrasi berhasil',
      user: userWithoutPassword
    });
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Field wajib kosong' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, nama: user.nama, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Login berhasil',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;