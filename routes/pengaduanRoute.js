import express from "express";
import {
  getPengaduan,
  getPengaduanById,
  createPengaduan,
  updatePengaduan,
  getPengaduanByNIK,
  deletePengaduan,
} from "../controllers/pengaduanController.js";

const router = express.Router();

router.get("/pengaduan", getPengaduan);
router.get("/pengaduan/:idPengaduan", getPengaduanById);
router.post("/pengaduan", createPengaduan);
router.patch("/pengaduan/:id", updatePengaduan);
router.get("/Pengaduan-nik/:nik", getPengaduanByNIK);
router.delete("/pengaduan/:id", deletePengaduan);

export default router;
