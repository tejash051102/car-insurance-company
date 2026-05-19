import express from "express";
import {
  getProfile,
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
  resendVerification,
  sendProfilePasswordOtp,
  updateProfile,
  verifyEmail
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile);
router.post("/profile/password-otp", protect, sendProfilePasswordOtp);

export default router;
