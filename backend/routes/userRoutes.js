import express from "express";
import { assignAgentManager, getTeamUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/team", protect, getTeamUsers);
router.patch("/agents/:id/manager", protect, assignAgentManager);

export default router;
