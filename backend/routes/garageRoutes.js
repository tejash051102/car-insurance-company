import express from "express";
import { createGarage, deleteGarage, getGarages, updateGarage } from "../controllers/garageController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getGarages).post(protect, authorize("admin", "manager"), createGarage);
router.route("/:id").put(protect, authorize("admin", "manager"), updateGarage).delete(protect, authorize("admin", "manager"), deleteGarage);

export default router;
