import express from "express";
import {
  createBackup,
  listBackups,
  restoreBackup
} from "../controllers/backupController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, authorize("admin"), listBackups).post(protect, authorize("admin"), createBackup);
router.patch("/:id/restore", protect, authorize("admin"), restoreBackup);

export default router;
