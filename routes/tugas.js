const express = require('express');
const router = express.Router();
const prisma = require('../db');

router.get('/statistik', async (req, res) => {
  const { userId, role } = req.user;
  
  const whereCondition = role === 'admin' ? {} : { userId: userId };

  try {
    const todoCount = await prisma.tugas.count({ where: { ...whereCondition, status: 'todo' } });
    const inProgressCount = await prisma.tugas.count({ where: { ...whereCondition, status: 'in-progress' } });
    const selesaiCount = await prisma.tugas.count({ where: { ...whereCondition, status: 'selesai' } });

    return res.status(200).json({
      "todo": todoCount,
      "in-progress": inProgressCount,
      "selesai": selesaiCount
    });
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { judul, deskripsi, prioritas, status, deadline } = req.body;
  const { userId } = req.user;

  if (!judul || !prioritas || !status) {
    return res.status(400).json({ message: 'Field wajib kosong, prioritas tidak valid, atau status tidak valid' });
  }

  if (!['rendah', 'sedang', 'tinggi'].includes(prioritas)) {
    return res.status(400).json({ message: 'Field wajib kosong, prioritas tidak valid, atau status tidak valid' });
  }

  // Validasi nilai enum status
  if (!['todo', 'in-progress', 'selesai'].includes(status)) {
    return res.status(400).json({ message: 'Field wajib kosong, prioritas tidak valid, atau status tidak valid' });
  }

  try {
    const newTugas = await prisma.tugas.create({
      data: {
        judul,
        deskripsi: deskripsi || null,
        prioritas,
        status,
        deadline: deadline ? new Date(deadline) : null,
        userId: userId
      }
    });

    return res.status(201).json({
      message: 'Tugas berhasil ditambahkan',
      tugas: newTugas
    });
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// b) Lihat semua tugas — GET /api/tugas
router.get('/', async (req, res) => {
  const { userId, role } = req.user;
  
  // User biasa hanya mendapat tugasnya sendiri, Admin mendapat semua
  const whereCondition = role === 'admin' ? {} : { userId: userId };

  try {
    const daftarTugas = await prisma.tugas.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { id: true, nama: true, email: true }
        }
      },
      orderBy: [
        // Urutkan deadline terdekat ke terjauh, null diletakkan di akhir secara otomatis oleh SQLite/Prisma default asc
        { deadline: 'asc' }
      ]
    });

    return res.status(200).json(daftarTugas);
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// c) Lihat detail tugas — GET /api/tugas/:id
router.get('/:id', async (req, res) => {
  const idTugas = parseInt(req.params.id);
  const { userId, role } = req.user;

  try {
    const tugas = await prisma.tugas.findUnique({
      where: { id: idTugas },
      include: {
        user: {
          select: { id: true, nama: true, email: true }
        }
      }
    });

    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    // Jika bukan milik user dan user bukan admin, kembalikan 403
    if (tugas.userId !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Tugas bukan milik user dan bukan admin' });
    }

    return res.status(200).json(tugas);
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// d) Update tugas — PUT /api/tugas/:id
router.put('/:id', async (req, res) => {
  const idTugas = parseInt(req.params.id);
  const { userId, role } = req.user;
  const { judul, deskripsi, prioritas, status, deadline } = req.body;

  // Validasi nilai prioritas jika dikirimkan
  if (prioritas && !['rendah', 'sedang', 'tinggi'].includes(prioritas)) {
    return res.status(400).json({ message: 'prioritas tidak valid atau status tidak valid' });
  }

  // Validasi nilai status jika dikirimkan
  if (status && !['todo', 'in-progress', 'selesai'].includes(status)) {
    return res.status(400).json({ message: 'prioritas tidak valid atau status tidak valid' });
  }

  try {
    const tugas = await prisma.tugas.findUnique({ where: { id: idTugas } });

    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    if (tugas.userId !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Tugas bukan milik user dan bukan admin' });
    }

    const updatedTugas = await prisma.tugas.update({
      where: { id: idTugas },
      data: {
        judul: judul !== undefined ? judul : tugas.judul,
        deskripsi: deskripsi !== undefined ? deskripsi : tugas.deskripsi,
        prioritas: prioritas !== undefined ? prioritas : tugas.prioritas,
        status: status !== undefined ? status : tugas.status,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : tugas.deadline
      }
    });

    return res.status(200).json({
      message: 'Tugas berhasil diupdate',
      tugas: updatedTugas
    });
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// e) Hapus tugas — DELETE /api/tugas/:id
router.delete('/:id', async (req, res) => {
  const idTugas = parseInt(req.params.id);
  const { userId, role } = req.user;

  try {
    const tugas = await prisma.tugas.findUnique({ where: { id: idTugas } });

    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    if (tugas.userId !== userId && role !== 'admin') {
      return res.status(403).json({ message: 'Tugas bukan milik user dan bukan admin' });
    }

    await prisma.tugas.delete({ where: { id: idTugas } });

    return res.status(200).json({ message: 'Tugas berhasil dihapus' });
  } catch (error) {
    return res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;