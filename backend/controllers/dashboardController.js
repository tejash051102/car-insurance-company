import asyncHandler from "express-async-handler";
import Claim from "../models/Claim.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import Policy from "../models/Policy.js";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";

const getCustomerCountByUser = async (userIds = []) => {
  if (!userIds.length) {
    return new Map();
  }

  const rows = await Customer.aggregate([
    { $match: { createdBy: { $in: userIds } } },
    { $group: { _id: "$createdBy", count: { $sum: 1 } } }
  ]);

  return new Map(rows.map((row) => [String(row._id), row.count]));
};

const formatUser = (user, customerCount = 0, extra = {}) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  customerCount,
  ...extra
});

const getHierarchyStats = async (user) => {
  if (!user) {
    return { role: "guest" };
  }

  if (user.role === "admin") {
    const [managers, agents, directCounts, unassignedCustomers] = await Promise.all([
      User.find({ role: "manager" }).sort({ name: 1 }),
      User.find({ role: "agent" }).populate("manager", "name email").sort({ name: 1 }),
      Customer.aggregate([
        { $match: { createdBy: { $ne: null } } },
        { $group: { _id: "$createdBy", count: { $sum: 1 } } }
      ]),
      Customer.countDocuments({ createdBy: { $exists: false } })
    ]);

    const directCountMap = new Map(directCounts.map((row) => [String(row._id), row.count]));
    const managerList = managers.map((manager) => {
      const managerAgents = agents.filter((agent) => String(agent.manager?._id || "") === String(manager._id));
      const agentCustomerCount = managerAgents.reduce((sum, agent) => sum + (directCountMap.get(String(agent._id)) || 0), 0);

      return formatUser(manager, directCountMap.get(String(manager._id)) || 0, {
        agentCount: managerAgents.length,
        teamCustomerCount: agentCustomerCount + (directCountMap.get(String(manager._id)) || 0)
      });
    });

    return {
      role: "admin",
      totals: {
        managers: managers.length,
        agents: agents.length,
        customers: await Customer.countDocuments()
      },
      managers: managerList,
      agents: agents.map((agent) =>
        formatUser(agent, directCountMap.get(String(agent._id)) || 0, {
          managerName: agent.manager?.name || "Unassigned"
        })
      ),
      unassignedCustomers
    };
  }

  if (user.role === "manager") {
    const agents = await User.find({
      role: "agent",
      $or: [{ manager: user._id }, { createdBy: user._id }]
    }).sort({ name: 1 });
    const userIds = [user._id, ...agents.map((agent) => agent._id)];
    const countMap = await getCustomerCountByUser(userIds);
    const ownCustomerCount = countMap.get(String(user._id)) || 0;
    const agentList = agents.map((agent) => formatUser(agent, countMap.get(String(agent._id)) || 0));

    return {
      role: "manager",
      totals: {
        agents: agents.length,
        ownCustomers: ownCustomerCount,
        teamCustomers: ownCustomerCount + agentList.reduce((sum, agent) => sum + agent.customerCount, 0)
      },
      agents: agentList
    };
  }

  return {
    role: "agent",
    totals: {
      customers: await Customer.countDocuments({ createdBy: user._id })
    }
  };
};

export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const expiryWindow = new Date();
  expiryWindow.setDate(now.getDate() + 30);

  const [
    customers,
    vehicles,
    policies,
    activePolicies,
    claims,
    pendingClaims,
    paidPayments,
    recentPolicies,
    recentClaims,
    policyStatus,
    claimStatus,
    monthlyRevenue,
    monthlyClaims,
    claimApprovalRate,
    topVehicleTypes,
    expiringPolicies,
    hierarchy
  ] = await Promise.all([
    Customer.countDocuments(),
    Vehicle.countDocuments(),
    Policy.countDocuments(),
    Policy.countDocuments({ status: "active" }),
    Claim.countDocuments(),
    Claim.countDocuments({ status: { $in: ["submitted", "under-review"] } }),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]),
    Policy.find().populate("customer").populate("vehicle").sort({ createdAt: -1 }).limit(5),
    Claim.find().populate("customer").populate("policy").sort({ createdAt: -1 }).limit(5),
    Policy.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Claim.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { year: { $year: "$paymentDate" }, month: { $month: "$paymentDate" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]),
    Claim.aggregate([
      {
        $group: {
          _id: { year: { $year: "$incidentDate" }, month: { $month: "$incidentDate" } },
          total: { $sum: "$claimAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]),
    Claim.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: {
            $sum: {
              $cond: [{ $in: ["$status", ["approved", "paid", "settled"]] }, 1, 0]
            }
          }
        }
      }
    ]),
    Vehicle.aggregate([
      { $group: { _id: "$vehicleType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]),
    Policy.find({
      status: { $in: ["active", "pending"] },
      endDate: { $gte: now, $lte: expiryWindow }
    })
      .populate("customer")
      .sort({ endDate: 1 })
      .limit(5),
    getHierarchyStats(req.user)
  ]);

  res.json({
    totals: {
      customers,
      vehicles,
      policies,
      activePolicies,
      claims,
      pendingClaims,
      revenue: paidPayments[0]?.total || 0
    },
    recentPolicies,
    recentClaims,
    policyStatus,
    claimStatus,
    monthlyRevenue,
    monthlyClaims,
    claimApprovalRate: claimApprovalRate[0]?.total
      ? Math.round((claimApprovalRate[0].approved / claimApprovalRate[0].total) * 100)
      : 0,
    topVehicleTypes,
    expiringPolicies,
    hierarchy
  });
});
