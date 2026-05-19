import asyncHandler from "express-async-handler";
import Customer from "../models/Customer.js";
import Notification from "../models/Notification.js";
import SupportTicket from "../models/SupportTicket.js";

const generateTicketNumber = () => `TKT-${Date.now().toString().slice(-8)}`;

export const getTickets = asyncHandler(async (_req, res) => {
  const tickets = await SupportTicket.find()
    .populate("customer", "firstName lastName email")
    .populate("assignedTo", "name email role")
    .sort({ updatedAt: -1 })
    .limit(100);

  res.json(tickets);
});

export const createTicket = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.body.customer);

  if (!customer) {
    res.status(404);
    throw new Error("Customer not found");
  }

  const ticket = await SupportTicket.create({
    ticketNumber: generateTicketNumber(),
    customer: customer._id,
    assignedTo: req.body.assignedTo || req.user?._id,
    subject: req.body.subject,
    category: req.body.category,
    priority: req.body.priority,
    messages: [
      {
        senderModel: "User",
        sender: req.user._id,
        senderName: req.user.name,
        message: req.body.message || req.body.subject
      }
    ]
  });

  await Notification.create({
    title: "New support ticket",
    message: `${ticket.ticketNumber} created for ${customer.fullName}`,
    type: "ticket",
    severity: ticket.priority === "urgent" ? "critical" : "info",
    audience: "staff",
    metadata: { ticketId: ticket._id }
  });

  res.status(201).json(await ticket.populate("customer", "firstName lastName email"));
});

export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.status = req.body.status ?? ticket.status;
  ticket.priority = req.body.priority ?? ticket.priority;
  ticket.assignedTo = req.body.assignedTo || ticket.assignedTo;

  if (req.body.message) {
    ticket.messages.push({
      senderModel: "User",
      sender: req.user._id,
      senderName: req.user.name,
      message: req.body.message
    });
  }

  await ticket.save();
  res.json(await ticket.populate(["customer", "assignedTo"]));
});

export const getCustomerTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ customer: req.customer._id })
    .populate("assignedTo", "name email role")
    .sort({ updatedAt: -1 });

  res.json(tickets);
});

export const createCustomerTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.create({
    ticketNumber: generateTicketNumber(),
    customer: req.customer._id,
    subject: req.body.subject,
    category: req.body.category,
    priority: req.body.priority || "medium",
    messages: [
      {
        senderModel: "Customer",
        sender: req.customer._id,
        senderName: req.customer.fullName,
        message: req.body.message || req.body.subject
      }
    ]
  });

  await Notification.create({
    title: "Customer support request",
    message: `${req.customer.fullName} opened ${ticket.ticketNumber}`,
    type: "ticket",
    severity: ticket.priority === "urgent" ? "critical" : "info",
    audience: "staff",
    metadata: { ticketId: ticket._id }
  });

  res.status(201).json(ticket);
});

export const replyCustomerTicket = asyncHandler(async (req, res) => {
  const ticket = await SupportTicket.findOne({ _id: req.params.id, customer: req.customer._id });

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  ticket.messages.push({
    senderModel: "Customer",
    sender: req.customer._id,
    senderName: req.customer.fullName,
    message: req.body.message
  });
  ticket.status = "open";
  await ticket.save();

  res.json(ticket);
});
