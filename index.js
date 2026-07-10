const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const tugasRoutes = require('./routes/tugas');
const authGuard = require('./middleware/authGuard');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global untuk parse JSON body
app.use(express.json());

// Route halaman utama '/' agar tidak memunculkan "Cannot GET /" lagi di browser
app.get('/', (req, res) => {
  res.json({ message: "API Manajemen Tugas berjalan dengan baik" });
});

// Pemasangan Routes API
app.use('/api/auth', authRoutes);

// Semua endpoint di routes/tugas memerlukan autentikasi
app.use('/api/tugas', authGuard, tugasRoutes);

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server backend berjalan dengan aman di http://localhost:${PORT}`);
});