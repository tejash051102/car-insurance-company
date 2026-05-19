import asyncHandler from "express-async-handler";
import crypto from "crypto";
import ActivityLog from "../models/ActivityLog.js";
import BackupSnapshot from "../models/BackupSnapshot.js";
import Claim from "../models/Claim.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import Policy from "../models/Policy.js";
import SecurityAlert from "../models/SecurityAlert.js";
import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";

const generateBackupNumber = () => `BKP-${Date.now().toString().slice(-8)}`;

const collectCounts = async () => {
  const [
    users,
    customers,
    vehicles,
    policies,
    claims,
    payments,
    tickets,
    alerts,
    auditLogs
  ] = await Promise.all([
    User.countDocuments(),
    Customer.countDocuments(),
    Vehicle.countDocuments(),
    Policy.countDocuments(),
    Claim.countDocuments(),
    Payment.countDocuments(),
    SupportTicket.countDocuments(),
    SecurityAlert.countDocuments(),
    ActivityLog.countDocuments()
  ]);

  return { users, customers, vehicles, policies, claims, payments, tickets, alerts, auditLogs };
};

export const listBackups = asyncHandler(async (_req, res) => {
  const backups = await BackupSnapshot.find()
    .populate("createdBy", "name email role")
    .populate("restoredBy", "name email role")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(backups);
});

export const createBackup = asyncHandler(async (req, res) => {
  const collections = await collectCounts();
  const checksum = crypto.createHash("sha256").update(JSON.stringify(collections)).digest("hex");

  const backup = await BackupSnapshot.create({
    backupNumber: generateBackupNumber(),
    collections,
    checksum,
    createdBy: req.user._id,
    notes: req.body.notes || "Simulation backup snapshot"
  });

  res.status(201).json(backup);
});

export const restoreBackup = asyncHandler(async (req, res) => {
  const backup = await BackupSnapshot.findById(req.params.id);

  if (!backup) {
    res.status(404);
    throw new Error("Backup snapshot not found");
  }

  backup.status = "restored";
  backup.restoredBy = req.user._id;
  backup.restoredAt = new Date();
  await backup.save();

  res.json({
    message: "Restore simulation completed. No real data was overwritten.",
    backup
  });
});
