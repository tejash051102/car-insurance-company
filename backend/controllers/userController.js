import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Customer from "../models/Customer.js";

const countCustomersByCreator = async (userIds = []) => {
  const rows = await Customer.aggregate([
    { $match: { createdBy: { $in: userIds } } },
    { $group: { _id: "$createdBy", count: { $sum: 1 } } }
  ]);

  return new Map(rows.map((row) => [String(row._id), row.count]));
};

const userSummary = (user, countMap = new Map()) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatarUrl: user.avatarUrl,
  role: user.role,
  manager: user.manager,
  customerCount: countMap.get(String(user._id)) || 0
});

export const getTeamUsers = asyncHandler(async (req, res) => {
  if (!["admin", "manager"].includes(req.user.role)) {
    res.status(403);
    throw new Error("Only admin and managers can view team assignment");
  }

  const managerFilter = req.user.role === "admin" ? { role: "manager" } : { _id: req.user._id };
  const agentFilter =
    req.user.role === "admin"
      ? { role: "agent" }
      : { role: "agent", $or: [{ manager: req.user._id }, { manager: { $exists: false } }, { manager: null }] };

  const [managers, agents] = await Promise.all([
    User.find(managerFilter).sort({ name: 1 }),
    User.find(agentFilter).populate("manager", "name email").sort({ name: 1 })
  ]);
  const countMap = await countCustomersByCreator([...managers, ...agents].map((user) => user._id));

  res.json({
    managers: managers.map((manager) => userSummary(manager, countMap)),
    agents: agents.map((agent) => userSummary(agent, countMap))
  });
});

export const assignAgentManager = asyncHandler(async (req, res) => {
  const { manager } = req.body;
  const agent = await User.findOne({ _id: req.params.id, role: "agent" });

  if (!agent) {
    res.status(404);
    throw new Error("Agent not found");
  }

  if (req.user.role === "manager" && manager && String(manager) !== String(req.user._id)) {
    res.status(403);
    throw new Error("Managers can only assign agents to themselves");
  }

  if (manager) {
    const managerUser = await User.findOne({ _id: manager, role: "manager" });

    if (!managerUser) {
      res.status(404);
      throw new Error("Manager not found");
    }

    agent.manager = managerUser._id;
  } else {
    agent.manager = undefined;
  }

  await agent.save();
  const populatedAgent = await agent.populate("manager", "name email");
  res.json(userSummary(populatedAgent));
});
