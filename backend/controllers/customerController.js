import asyncHandler from "express-async-handler";
import Customer from "../models/Customer.js";
import Vehicle from "../models/Vehicle.js";
import Policy from "../models/Policy.js";
import { getPagination, sendPaginated } from "../utils/pagination.js";

export const getCustomers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { firstName: { $regex: req.query.search, $options: "i" } },
          { lastName: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
          { phone: { $regex: req.query.search, $options: "i" } }
        ]
      }
    : {};

  const { page, limit, skip } = getPagination(req.query);
  await sendPaginated(
    res,
    Customer.find(keyword).sort({ createdAt: -1 }),
    Customer.countDocuments(keyword),
    { page, limit, skip }
  );
});

export const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  const [vehicles, policies] = await Promise.all([
    Vehicle.find({ customer: customer._id }).sort({ createdAt: -1 }),
    Policy.find({ customer: customer._id }).populate("vehicle").sort({ createdAt: -1 })
  ]);

  res.json({ ...customer.toObject(), vehicles, policies });
});

export const createCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.create({
    ...req.body,
    createdBy: req.user?._id
  });

  res.status(201).json(customer);
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  res.json(customer);
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const linkedVehicleCount = await Vehicle.countDocuments({ customer: req.params.id });
  const linkedPolicyCount = await Policy.countDocuments({ customer: req.params.id });

  if (linkedVehicleCount || linkedPolicyCount) {
    res.status(400);
    throw new Error("Cannot delete a customer with linked vehicles or policies");
  }

  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  res.json({ message: "Customer deleted successfully" });
});
