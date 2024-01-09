import express from "express";
import {
  getMasyarakat,
  getMasyarakatByUUID,
  createMasyarakat,
  updateMasyarakat,
  deleteMasyarakat,
} from "../controllers/masyarakatController.js";

const router = express.Router();

router.get("/masyarakat", getMasyarakat);
router.get("/masyarakat/:uuid", getMasyarakatByUUID);
router.post("/masyarakat", createMasyarakat);
router.patch("/masyarakat/:uuid", updateMasyarakat);
router.delete("/masyarakat/:nik", deleteMasyarakat);

export default router;
