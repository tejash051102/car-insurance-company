import express from "express";
import {
  createCustomerClaim,
  downloadCustomerPaymentInvoice,
  downloadCustomerPolicyPdf,
  getCustomerClaims,
  getCustomerPayments,
  getCustomerPolicies,
  getCustomerProfile,
  loginCustomer,
  sendCustomerPasswordOtp,
  updateCustomerProfile
} from "../controllers/customerPortalController.js";
import { protectCustomer } from "../middleware/customerAuthMiddleware.js";
import { authRateLimit } from "../middleware/securityMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/login", authRateLimit, loginCustomer);
router.get("/me", protectCustomer, getCustomerProfile);
router.put("/me", protectCustomer, upload.single("avatar"), updateCustomerProfile);
router.post("/me/password-otp", protectCustomer, sendCustomerPasswordOtp);
router.get("/policies", protectCustomer, getCustomerPolicies);
router.get("/claims", protectCustomer, getCustomerClaims);
router.post("/claims", protectCustomer, createCustomerClaim);
router.get("/payments", protectCustomer, getCustomerPayments);
router.get("/policies/:id/pdf", protectCustomer, downloadCustomerPolicyPdf);
router.get("/payments/:id/invoice", protectCustomer, downloadCustomerPaymentInvoice);

export default router;
