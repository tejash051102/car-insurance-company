import express from "express";
import {
  createTicket,
  getTickets,
  updateTicket
} from "../controllers/ticketController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getTickets).post(protect, createTicket);
router.patch("/:id", protect, updateTicket);

export default router;
