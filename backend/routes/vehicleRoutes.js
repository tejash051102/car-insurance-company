import express from "express";
import {
  createVehicle,
  deleteVehicle,
  exportVehicles,
  getVehicleById,
  getVehicles,
  updateVehicle
} from "../controllers/vehicleController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getVehicles).post(protect, createVehicle);
router.get("/export/csv", protect, authorize("admin", "manager"), exportVehicles);
router
  .route("/:id")
  .get(protect, getVehicleById)
  .put(protect, updateVehicle)
  .delete(protect, authorize("admin", "manager"), deleteVehicle);

export default router;
