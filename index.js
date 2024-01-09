// entry point
// Import modul dan pustaka yang dibutuhkan
import express from "express"; // Framework Express untuk mengatur server
import fileUpload from "express-fileupload"; // Middleware untuk mengelola unggahan file
import cors from "cors"; // Middleware untuk mengizinkan akses lintas domain (CORS)
import dotenv from "dotenv";
dotenv.config();
// Import file rute khusus
import PengaduanRoute from "./routes/pengaduanRoute.js";
import MasyarakatRoute from "./routes/masyarakatRoute.js";
import PetugasRoute from "./routes/petugasRoute.js";
import TanggapanRoute from "./routes/tanggapanRoute.js";

const app = express(); // Inisialisasi aplikasi Express
const PORT = 5000; // Port server yang digunakan

// Middleware
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);
app.use(express.json()); //  Menggunakan middleware untuk menangani data JSON
app.use(fileUpload());
app.use(express.static("public")); // Menyediakan akses ke file statis dalam folder 'public'

// Routes
app.use(PengaduanRoute);
app.use(MasyarakatRoute);
app.use(PetugasRoute);
app.use(TanggapanRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
