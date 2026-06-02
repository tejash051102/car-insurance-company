import express from "express";
import {
  createClaim,
  decideClaim,
  deleteClaim,
  exportClaims,
  getClaimById,
  getClaims,
  refreshClaimFraudScore,
  updateClaim
} from "../controllers/claimController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

const claimUpload = upload.fields([
  { name: "document", maxCount: 1 },
  { name: "accidentPhotos", maxCount: 5 },
  { name: "repairBills", maxCount: 5 },
  { name: "firReports", maxCount: 3 }
]);

router.route("/").get(protect, getClaims).post(protect, claimUpload, createClaim);
router.get("/export/csv", protect, authorize("admin", "manager"), exportClaims);
router.patch("/:id/decision", protect, authorize("admin", "manager"), decideClaim);
router.patch("/:id/fraud-score", protect, authorize("admin", "manager"), refreshClaimFraudScore);
router
  .route("/:id")
  .get(protect, getClaimById)
  .put(protect, claimUpload, updateClaim)
  .delete(protect, authorize("admin", "manager"), deleteClaim);

export default router;
