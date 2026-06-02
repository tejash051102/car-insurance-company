import { BadgeIndianRupee, Bot, ClipboardCheck, Download, LogOut, Plus, Save, Send, ShieldCheck, Upload, UserCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api, { getAssetUrl } from "../api/axios.js";
import AnimatedAuthBackground from "../components/AnimatedAuthBackground.jsx";
import { clearCustomerUser, getCustomerUser, saveCustomerUser } from "../utils/authStorage.js";
import { downloadBlob } from "../utils/download.js";

const emptyClaim = {
  policy: "",
  incidentDate: "",
  claimAmount: "",
  description: ""
};

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const statusClass = (status = "") => {
  if (["active", "paid", "approved", "settled"].includes(status)) return "bg-emerald-50 text-emerald-700";
  if (["pending", "submitted", "under-review"].includes(status)) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
};

const customerAssistantReply = (message = "") => {
  const text = message.toLowerCase();

  if (text.includes("policy") || text.includes("pdf") || text.includes("document")) {
    return "Open My Policies to view your assigned policies. Use the PDF button on the right side of a policy row to download the policy document.";
  }

  if (text.includes("claim") || text.includes("accident") || text.includes("incident")) {
    return "Use Submit Claim to choose your policy, enter incident date, claim amount, and description. After submission, track it in My Claims.";
  }

  if (text.includes("payment") || text.includes("receipt") || text.includes("invoice") || text.includes("premium")) {
    return "Open My Payments to see premium payments. Use the download button to get your receipt or invoice PDF.";
  }

  if (text.includes("ticket") || text.includes("support") || text.includes("help")) {
    return "Use Support Ticket to send a request about policy, claim, payment, document, security, or general support.";
  }

  if (text.includes("profile") || text.includes("password") || text.includes("otp")) {
    return "Use My Profile to update details or upload your image. For password change, enter a new password, request OTP, then save.";
  }

  return "I can help with policies, claims, payments, receipts, profile updates, OTP, and support tickets. Ask about any customer portal feature.";
};

const CustomerPortalChatBot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I am your DriveSure customer assistant. Ask me about policy PDF, claims, payments, receipts, profile, or support tickets." }
  ]);

  const sendMessage = (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "assistant", text: customerAssistantReply(question) }
    ]);
    setInput("");
  };

  return (
    <div className="customer-chat fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {open ? (
        <section className="w-[min(380px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-white/14 bg-[#08172f]/82 shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/14 text-cyan-100">
                <Bot size={19} />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Customer Assistant</p>
                <p className="text-xs text-white/45">Policy, claim, payment help</p>
              </div>
            </div>
            <button className="btn-secondary h-8 w-8 px-0" type="button" onClick={() => setOpen(false)} aria-label="Close customer assistant">
              <X size={15} />
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[84%] rounded-2xl px-3 py-2 text-sm leading-6 ${message.role === "user" ? "bg-cyan-500 text-white" : "bg-white/[0.08] text-white/72"}`}>
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <form className="flex gap-2 border-t border-white/10 p-3" onSubmit={sendMessage}>
            <input className="field customer-chat-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask your query" />
            <button className="btn-primary px-3" type="submit" aria-label="Send customer query">
              <Send size={16} />
            </button>
          </form>
        </section>
      ) : (
        <button className="btn-primary h-12 rounded-full px-4 shadow-2xl shadow-cyan-950/40 sm:h-14 sm:px-5" type="button" onClick={() => setOpen(true)}>
          <Bot size={18} />
          Help
        </button>
      )}
    </div>
  );
};

const CustomerPortal = () => {
  const navigate = useNavigate();
  const customer = getCustomerUser();
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [claimForm, setClaimForm] = useState(emptyClaim);
  const [ticketForm, setTicketForm] = useState({ subject: "", category: "general", priority: "medium", message: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: customer?.firstName || "",
    lastName: customer?.lastName || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    street: customer?.address?.street || "",
    city: customer?.address?.city || "",
    state: customer?.address?.state || "",
    zipCode: customer?.address?.zipCode || "",
    password: "",
    passwordOtp: "",
    avatar: null
  });
  const [profilePreview, setProfilePreview] = useState(customer?.avatarUrl ? getAssetUrl(customer.avatarUrl) : "");

  const loadPortal = async () => {
    setError("");

    try {
      const [policiesResponse, claimsResponse, paymentsResponse, ticketResponse] = await Promise.all([
        api.get("/customer-portal/policies"),
        api.get("/customer-portal/claims"),
        api.get("/customer-portal/payments"),
        api.get("/customer-portal/tickets")
      ]);
      setPolicies(policiesResponse.data || []);
      setClaims(claimsResponse.data || []);
      setPayments(paymentsResponse.data || []);
      setTickets(ticketResponse.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (customer) {
      loadPortal();
    }
  }, [customer?._id]);

  if (!customer) {
    return <Navigate to="/customer-login" replace />;
  }

  const logout = () => {
    clearCustomerUser();
    navigate("/customer-login", { replace: true });
  };

  const updateClaim = (event) => {
    setClaimForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateProfileField = (event) => {
    const { name, value, files } = event.target;

    if (files) {
      const file = files[0];
      setProfileForm((current) => ({ ...current, [name]: file }));
      setProfilePreview(file ? URL.createObjectURL(file) : "");
      return;
    }

    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const data = new FormData();
    Object.entries(profileForm).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });

    try {
      const response = await api.put("/customer-portal/me", data);
      saveCustomerUser(response.data);
      setProfileForm((current) => ({ ...current, password: "", passwordOtp: "", avatar: null }));
      setProfilePreview(response.data.avatarUrl ? getAssetUrl(response.data.avatarUrl) : "");
      setNotice("Profile updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordOtp = async () => {
    setError("");
    setNotice("");

    if (!profileForm.password) {
      setError("Enter a new password before requesting OTP");
      return;
    }

    try {
      const { data } = await api.post("/customer-portal/me/password-otp");
      setNotice(data.otp ? `${data.message} OTP: ${data.otp}` : data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  const submitClaim = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      await api.post("/customer-portal/claims", {
        ...claimForm,
        claimAmount: Number(claimForm.claimAmount)
      });
      setClaimForm(emptyClaim);
      setNotice("Claim submitted successfully");
      await loadPortal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    try {
      await api.post("/customer-portal/tickets", ticketForm);
      setTicketForm({ subject: "", category: "general", priority: "medium", message: "" });
      setNotice("Support ticket created successfully");
      await loadPortal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPolicy = async (policy) => {
    try {
      const response = await api.get(`/customer-portal/policies/${policy._id}/pdf`, { responseType: "blob" });
      downloadBlob(response.data, `${policy.policyNumber}.pdf`);
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadInvoice = async (payment) => {
    try {
      const response = await api.get(`/customer-portal/payments/${payment._id}/invoice`, { responseType: "blob" });
      downloadBlob(response.data, `${payment.paymentNumber}-receipt.pdf`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="customer-portal-page auth-visual-shell relative min-h-screen overflow-x-hidden text-white">
      <AnimatedAuthBackground />
      <main className="app-main relative z-10 mx-auto max-w-7xl space-y-5 px-4 pb-28 pt-5 sm:space-y-6 sm:py-6 sm:pb-28 lg:px-8">
        <div className="customer-glass customer-portal-hero flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/25 bg-cyan-300/10 shadow-lg shadow-cyan-950/30">
              <img src="/favicon.svg" alt="DriveSure Customer Portal" className="h-14 w-14 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="label">Customer portal</p>
              <h1 className="mt-1 truncate text-2xl font-bold text-ink">Welcome, {customer.fullName}</h1>
              <p className="mt-1 truncate text-sm text-slate-500">{customer.email}</p>
            </div>
          </div>
          <button className="btn-secondary shrink-0" type="button" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {notice ? <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <section className="panel customer-glass customer-stat-card p-5">
            <ShieldCheck className="mb-3 text-cyan-300" size={24} />
            <p className="text-sm text-slate-500">Policies</p>
            <p className="mt-1 text-2xl font-bold text-ink">{policies.length}</p>
          </section>
          <section className="panel customer-glass customer-stat-card p-5">
            <ClipboardCheck className="mb-3 text-orange-300" size={24} />
            <p className="text-sm text-slate-500">Claims</p>
            <p className="mt-1 text-2xl font-bold text-ink">{claims.length}</p>
          </section>
          <section className="panel customer-glass customer-stat-card p-5">
            <BadgeIndianRupee className="mb-3 text-emerald-300" size={24} />
            <p className="text-sm text-slate-500">Paid Premium</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {formatCurrency(payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0))}
            </p>
          </section>
        </div>

        <section className="panel customer-glass p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserCircle size={20} className="text-cyan-300" />
            <h2 className="text-lg font-bold text-ink">My Profile</h2>
          </div>
          <form onSubmit={submitProfile} className="grid gap-5 xl:grid-cols-[220px_1fr]">
            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-300">
                {profilePreview ? <img src={profilePreview} alt="Customer profile" className="h-full w-full object-cover" /> : <UserCircle size={54} strokeWidth={1.5} />}
              </div>
              <label className="btn-secondary mt-4 cursor-pointer">
                <Upload size={16} />
                Upload Image
                <input className="hidden" name="avatar" type="file" accept=".jpg,.jpeg,.png" onChange={updateProfileField} />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input className="field" name="firstName" value={profileForm.firstName} onChange={updateProfileField} placeholder="First name" required />
              <input className="field" name="lastName" value={profileForm.lastName} onChange={updateProfileField} placeholder="Last name" required />
              <input className="field" name="email" type="email" value={profileForm.email} onChange={updateProfileField} placeholder="Gmail / Email" required />
              <input className="field" name="phone" value={profileForm.phone} onChange={updateProfileField} placeholder="Mobile number" required />
              <input className="field" name="street" value={profileForm.street} onChange={updateProfileField} placeholder="Street" />
              <input className="field" name="city" value={profileForm.city} onChange={updateProfileField} placeholder="City" />
              <input className="field" name="state" value={profileForm.state} onChange={updateProfileField} placeholder="State" />
              <input className="field" name="zipCode" value={profileForm.zipCode} onChange={updateProfileField} placeholder="Zip code" />
              <input className="field" name="password" type="password" value={profileForm.password} onChange={updateProfileField} placeholder="New password (leave blank to keep current)" />
              {profileForm.password ? (
                <div>
                  <div className="flex gap-2">
                    <input className="field" name="passwordOtp" value={profileForm.passwordOtp} onChange={updateProfileField} placeholder="Password OTP" />
                    <button className="btn-secondary shrink-0" type="button" onClick={requestPasswordOtp}>
                      Send OTP
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">OTP is sent to your email and registered mobile number when configured.</p>
                </div>
              ) : null}
              <div className="md:col-span-2 flex justify-end">
                <button className="btn-primary" type="submit" disabled={loading}>
                  <Save size={16} />
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="panel customer-glass p-5">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={20} className="text-brand" />
            <h2 className="text-lg font-bold text-ink">My Policies</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Policy</th>
                  <th className="px-3 py-2">Vehicle</th>
                  <th className="px-3 py-2">Premium</th>
                  <th className="px-3 py-2">Ends</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">PDF</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((policy) => (
                  <tr key={policy._id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-semibold text-ink">{policy.policyNumber}</td>
                    <td className="px-3 py-3">{policy.vehicle?.registrationNumber || "N/A"}</td>
                    <td className="px-3 py-3">{formatCurrency(policy.premiumAmount)}</td>
                    <td className="px-3 py-3">{policy.endDate?.slice(0, 10)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${statusClass(policy.status)}`}>{policy.status}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => downloadPolicy(policy)} aria-label="Download policy PDF">
                        <Download size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!policies.length ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-slate-500" colSpan="6">
                      No policies assigned yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel customer-glass p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plus size={20} className="text-coral" />
            <h2 className="text-lg font-bold text-ink">Submit Claim</h2>
          </div>
          <form onSubmit={submitClaim} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <select className="field xl:col-span-2" name="policy" value={claimForm.policy} onChange={updateClaim} required>
              <option value="">Select policy</option>
              {policies.map((policy) => (
                <option key={policy._id} value={policy._id}>
                  {policy.policyNumber} - {policy.vehicle?.registrationNumber || "Vehicle"}
                </option>
              ))}
            </select>
            <input className="field" name="incidentDate" type="date" value={claimForm.incidentDate} onChange={updateClaim} required />
            <input className="field" name="claimAmount" type="number" min="0" value={claimForm.claimAmount} onChange={updateClaim} placeholder="Claim amount" required />
            <textarea className="field md:col-span-2 xl:col-span-4" name="description" value={claimForm.description} onChange={updateClaim} placeholder="Incident description" rows="3" required />
            <button className="btn-primary" type="submit" disabled={loading}>
              <Plus size={16} />
              {loading ? "Submitting..." : "Submit claim"}
            </button>
          </form>
        </section>

        <section className="panel customer-glass p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plus size={20} className="text-cyan-300" />
            <h2 className="text-lg font-bold text-ink">Support Ticket</h2>
          </div>
          <form onSubmit={submitTicket} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input className="field xl:col-span-2" value={ticketForm.subject} onChange={(event) => setTicketForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Ticket subject" required />
            <select className="field" value={ticketForm.category} onChange={(event) => setTicketForm((current) => ({ ...current, category: event.target.value }))}>
              {["policy", "claim", "payment", "document", "security", "general"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className="field" value={ticketForm.priority} onChange={(event) => setTicketForm((current) => ({ ...current, priority: event.target.value }))}>
              {["low", "medium", "high", "urgent"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <textarea className="field md:col-span-2 xl:col-span-4" value={ticketForm.message} onChange={(event) => setTicketForm((current) => ({ ...current, message: event.target.value }))} placeholder="Write your request" rows="3" required />
            <button className="btn-primary" type="submit" disabled={loading}>
              <Plus size={16} />
              {loading ? "Creating..." : "Create ticket"}
            </button>
          </form>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="panel customer-glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck size={20} className="text-coral" />
              <h2 className="text-lg font-bold text-ink">My Claims</h2>
            </div>
            <div className="space-y-3">
              {claims.map((claim) => (
                <div key={claim._id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{claim.claimNumber}</p>
                      <p className="text-xs text-slate-500">{claim.policy?.policyNumber || "Policy"} · {claim.incidentDate?.slice(0, 10)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${statusClass(claim.status)}`}>{claim.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{formatCurrency(claim.claimAmount)}</p>
                </div>
              ))}
              {!claims.length ? <p className="text-sm text-slate-500">No claims submitted yet.</p> : null}
            </div>
          </section>

          <section className="panel customer-glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck size={20} className="text-cyan-300" />
              <h2 className="text-lg font-bold text-ink">My Tickets</h2>
            </div>
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{ticket.ticketNumber}</p>
                      <p className="text-xs text-slate-500">{ticket.subject} · {ticket.category}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${statusClass(ticket.status)}`}>{ticket.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{ticket.messages?.at(-1)?.message}</p>
                </div>
              ))}
              {!tickets.length ? <p className="text-sm text-slate-500">No support tickets yet.</p> : null}
            </div>
          </section>

          <section className="panel customer-glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <BadgeIndianRupee size={20} className="text-mint" />
              <h2 className="text-lg font-bold text-ink">My Payments</h2>
            </div>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment._id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3">
                  <div>
                    <p className="font-semibold text-ink">{payment.paymentNumber}</p>
                    <p className="text-xs text-slate-500">{payment.policy?.policyNumber || "Policy"} · {payment.paymentDate?.slice(0, 10)}</p>
                    <p className="mt-1 text-sm text-slate-500">{formatCurrency(payment.amount)}</p>
                  </div>
                  <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => downloadInvoice(payment)} aria-label="Download payment receipt">
                    <Download size={15} />
                  </button>
                </div>
              ))}
              {!payments.length ? <p className="text-sm text-slate-500">No payment records yet.</p> : null}
            </div>
          </section>
        </div>
      </main>
      <CustomerPortalChatBot />
    </div>
  );
};

export default CustomerPortal;
