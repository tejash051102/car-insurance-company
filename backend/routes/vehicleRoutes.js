import express from "express";
import {
  createVehicle,
  deleteVehicle,
  exportVehicles,
  getVehicleById,
  getVehicles,
  updateVehicle
} from "../controllers/vehicleController.js";
<<<<<<< HEAD
import { admin, protect } from "../middleware/authMiddleware.js";
=======
import { authorize, protect } from "../middleware/authMiddleware.js";
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

const router = express.Router();

router.route("/").get(protect, getVehicles).post(protect, createVehicle);
<<<<<<< HEAD
router.route("/:id").get(protect, getVehicleById).put(protect, updateVehicle).delete(protect, admin, deleteVehicle);
=======
router.get("/export/csv", protect, authorize("admin", "manager"), exportVehicles);
router
  .route("/:id")
  .get(protect, getVehicleById)
  .put(protect, updateVehicle)
  .delete(protect, authorize("admin", "manager"), deleteVehicle);
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

export default router;
