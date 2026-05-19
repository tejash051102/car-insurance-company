import express from "express";
import {
  createClaim,
  deleteClaim,
  getClaimById,
  getClaims,
  updateClaim,
  updateClaimStatus
} from "../controllers/claimController.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getClaims).post(protect, upload.single("document"), createClaim);
router.patch("/:id/status", protect, updateClaimStatus);
router
  .route("/:id")
  .get(protect, getClaimById)
  .put(protect, upload.single("document"), updateClaim)
  .delete(protect, admin, deleteClaim);

export default router;
