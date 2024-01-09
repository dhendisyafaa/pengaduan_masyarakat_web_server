import express from "express";
import {
  getTanggapan,
  getTanggapanById,
  getTanggapanByIdPengaduan,
  createTanggapan,
  updateTanggapan,
  deleteTanggapan,
} from "../controllers/tanggapanController.js";

const router = express.Router();

router.get("/tanggapan", getTanggapan);
router.get("/tanggapan/:idTanggapan", getTanggapanById);
router.get("/tanggapan-pengaduan/:id_pengaduan", getTanggapanByIdPengaduan);
router.post("/tanggapan/", createTanggapan);
router.patch("/tanggapan/:id_tanggapan", updateTanggapan);
router.delete("/tanggapan/:id_tanggapan", deleteTanggapan);

export default router;
