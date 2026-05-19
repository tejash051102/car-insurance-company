import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer
} from "../controllers/customerController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getCustomers).post(protect, createCustomer);
router.route("/:id").get(protect, getCustomerById).put(protect, updateCustomer).delete(protect, admin, deleteCustomer);

export default router;
