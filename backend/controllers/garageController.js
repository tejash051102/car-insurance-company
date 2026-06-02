import asyncHandler from "express-async-handler";
import Garage from "../models/Garage.js";

export const getGarages = asyncHandler(async (_req, res) => {
  res.json(await Garage.find().sort({ createdAt: -1 }));
});

export const createGarage = asyncHandler(async (req, res) => {
  res.status(201).json(await Garage.create(req.body));
});

export const updateGarage = asyncHandler(async (req, res) => {
  const garage = await Garage.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!garage) {
    res.status(404);
    throw new Error("Garage not found");
  }
  res.json(garage);
});

export const deleteGarage = asyncHandler(async (req, res) => {
  const garage = await Garage.findByIdAndDelete(req.params.id);
  if (!garage) {
    res.status(404);
    throw new Error("Garage not found");
  }
  res.json({ message: "Garage deleted successfully" });
});
