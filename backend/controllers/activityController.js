import asyncHandler from "express-async-handler";
import ActivityLog from "../models/ActivityLog.js";
import { getPagination, sendPaginated } from "../utils/pagination.js";

export const getActivityLogs = asyncHandler(async (req, res) => {
  const filter = req.query.search
    ? {
        $or: [
          { action: { $regex: req.query.search, $options: "i" } },
          { entityType: { $regex: req.query.search, $options: "i" } },
          { message: { $regex: req.query.search, $options: "i" } },
          { actorName: { $regex: req.query.search, $options: "i" } }
        ]
      }
    : {};

  const { page, limit, skip } = getPagination(req.query);
  await sendPaginated(
    res,
    ActivityLog.find(filter).populate("actor", "name email role").sort({ createdAt: -1 }),
    ActivityLog.countDocuments(filter),
    { page, limit, skip }
  );
});
