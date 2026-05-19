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
<<<<<<< HEAD
import { admin, protect } from "../middleware/authMiddleware.js";
=======
import { authorize, protect } from "../middleware/authMiddleware.js";
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getClaims).post(protect, upload.single("document"), createClaim);
<<<<<<< HEAD
router.patch("/:id/status", protect, updateClaimStatus);
=======
router.get("/export/csv", protect, authorize("admin", "manager"), exportClaims);
router.patch("/:id/decision", protect, authorize("admin", "manager"), decideClaim);
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
router
  .route("/:id")
  .get(protect, getClaimById)
  .put(protect, upload.single("document"), updateClaim)
<<<<<<< HEAD
  .delete(protect, admin, deleteClaim);
=======
  .delete(protect, authorize("admin", "manager"), deleteClaim);
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

export default router;
