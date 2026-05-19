import express from "express";
import {
  createClaim,
  decideClaim,
  deleteClaim,
  exportClaims,
  getClaimById,
  getClaims,
  updateClaim,
  updateClaimStatus
} from "../controllers/claimController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getClaims).post(protect, upload.single("document"), createClaim);
router.get("/export/csv", protect, authorize("admin", "manager"), exportClaims);
router.patch("/:id/decision", protect, authorize("admin", "manager"), decideClaim);
router
  .route("/:id")
  .get(protect, getClaimById)
  .put(protect, upload.single("document"), updateClaim)
  .delete(protect, authorize("admin", "manager"), deleteClaim);

export default router;
