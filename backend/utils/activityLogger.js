import ActivityLog from "../models/ActivityLog.js";
import { getRequestContext } from "./securityAudit.js";

export const logActivity = async ({ req, action, entityType, entityId, message }) => {
  try {
    await ActivityLog.create({
      action,
      entityType,
      entityId,
      message,
      actor: req.user?._id,
      actorName: req.user?.name,
      ...getRequestContext(req)
    });
  } catch (error) {
    console.error("Activity log failed:", error.message);
  }
};
