import { BadgeIndianRupee, ClipboardCheck, Download, LogOut, Plus, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import AnimatedAuthBackground from "../components/AnimatedAuthBackground.jsx";
import { clearCustomerUser, getCustomerUser } from "../utils/authStorage.js";
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

const CustomerPortal = () => {
  const navigate = useNavigate();
  const customer = getCustomerUser();
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);
  const [claimForm, setClaimForm] = useState(emptyClaim);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPortal = async () => {
    setError("");

    try {
      const [policiesResponse, claimsResponse, paymentsResponse] = await Promise.all([
        api.get("/customer-portal/policies"),
        api.get("/customer-portal/claims"),
        api.get("/customer-portal/payments")
      ]);
      setPolicies(policiesResponse.data || []);
      setClaims(claimsResponse.data || []);
      setPayments(paymentsResponse.data || []);
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
    <div className="auth-visual-shell relative min-h-screen overflow-hidden text-white">
      <AnimatedAuthBackground />
      <main className="app-main relative z-10 mx-auto max-w-7xl space-y-6 px-4 py-6 lg:px-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="label">Customer portal</p>
            <h1 className="mt-1 text-2xl font-bold text-ink">Welcome, {customer.fullName}</h1>
            <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
          </div>
          <button className="btn-secondary" type="button" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {notice ? <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <section className="panel p-5">
            <ShieldCheck className="mb-3 text-cyan-300" size={24} />
            <p className="text-sm text-slate-500">Policies</p>
            <p className="mt-1 text-2xl font-bold text-ink">{policies.length}</p>
          </section>
          <section className="panel p-5">
            <ClipboardCheck className="mb-3 text-orange-300" size={24} />
            <p className="text-sm text-slate-500">Claims</p>
            <p className="mt-1 text-2xl font-bold text-ink">{claims.length}</p>
          </section>
          <section className="panel p-5">
            <BadgeIndianRupee className="mb-3 text-emerald-300" size={24} />
            <p className="text-sm text-slate-500">Paid Premium</p>
            <p className="mt-1 text-2xl font-bold text-ink">
              {formatCurrency(payments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + Number(payment.amount || 0), 0))}
            </p>
          </section>
        </div>

        <section className="panel p-5">
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

        <section className="panel p-5">
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

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="panel p-5">
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

          <section className="panel p-5">
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
    </div>
  );
};

export default CustomerPortal;
