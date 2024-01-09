import express from "express";
import {
  getPetugas,
  getPetugasById,
  createPetugas,
  updatePetugas,
  deletePetugas,
} from "../controllers/petugasController.js";

const router = express.Router();

router.get("/petugas", getPetugas);
router.get("/petugas/:id_petugas", getPetugasById);
router.post("/petugas", createPetugas);
router.patch("/petugas/:id_petugas", updatePetugas);
router.delete("/petugas/:id_petugas", deletePetugas);

export default router;
