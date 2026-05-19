import asyncHandler from "express-async-handler";
import Vehicle from "../models/Vehicle.js";
import Policy from "../models/Policy.js";
import { sendCsv } from "../utils/csvExporter.js";
import { getPagination, sendPaginated } from "../utils/pagination.js";

export const getVehicles = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { registrationNumber: { $regex: req.query.search, $options: "i" } },
          { make: { $regex: req.query.search, $options: "i" } },
          { model: { $regex: req.query.search, $options: "i" } }
        ]
      }
    : {};

  const { page, limit, skip } = getPagination(req.query);
  await sendPaginated(
    res,
    Vehicle.find(keyword).populate("customer").sort({ createdAt: -1 }),
    Vehicle.countDocuments(keyword),
    { page, limit, skip }
  );
});

export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id).populate("customer");

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  res.json(vehicle);
});

export const exportVehicles = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().populate("customer").sort({ createdAt: -1 });

  sendCsv(
    res,
    "vehicles.csv",
    [
      { label: "Registration", value: (vehicle) => vehicle.registrationNumber },
      { label: "Make", value: (vehicle) => vehicle.make },
      { label: "Model", value: (vehicle) => vehicle.model },
      { label: "Year", value: (vehicle) => vehicle.year },
      { label: "Owner", value: (vehicle) => vehicle.customer?.fullName },
      { label: "Fuel", value: (vehicle) => vehicle.fuelType },
      { label: "Value", value: (vehicle) => vehicle.value }
    ],
    vehicles
  );
});

export const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.create(req.body);
  const populatedVehicle = await vehicle.populate("customer");
  res.status(201).json(populatedVehicle);
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate("customer");

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  res.json(vehicle);
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  const linkedPolicyCount = await Policy.countDocuments({ vehicle: req.params.id });

  if (linkedPolicyCount) {
    res.status(400);
    throw new Error("Cannot delete a vehicle with linked policies");
  }

  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);

  if (!vehicle) {
    res.status(404);
    throw new Error("Vehicle not found");
  }

  res.json({ message: "Vehicle deleted successfully" });
});
