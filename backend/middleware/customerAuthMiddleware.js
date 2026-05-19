import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import Customer from "../models/Customer.js";

export const protectCustomer = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Customer login required");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer || decoded.type !== "customer") {
      res.status(401);
      throw new Error("Customer login required");
    }

    req.customer = customer;
    next();
  } catch (error) {
    res.status(401);
    throw new Error("Customer login expired or invalid");
  }
});
