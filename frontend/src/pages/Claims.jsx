import { ClipboardCheck, Download, Edit3, Plus, Search, Stamp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Pagination from "../components/Pagination.jsx";
import { getItems, getMeta } from "../utils/apiData.js";
import { canManageRecords } from "../utils/auth.js";
import { downloadReport } from "../utils/download.js";

const emptyForm = {
  policy: "",
  incidentDate: "",
  claimAmount: "",
  approvedAmount: "",
  status: "submitted",
  description: "",
  document: null
};

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [decisionClaim, setDecisionClaim] = useState(null);
  const [decision, setDecision] = useState({ status: "approved", approvedAmount: "", decisionNote: "" });
  const [deciding, setDeciding] = useState(false);
  const canManage = canManageRecords();

  const loadData = async (page = 1, term = search) => {
    setError("");
    try {
      const [claimsResponse, policiesResponse] = await Promise.all([
        api.get("/claims", { params: { page, limit: 10, ...(term ? { search: term } : {}) } }),
        api.get("/policies", { params: { limit: 100 } })
      ]);
      setClaims(getItems(claimsResponse.data));
      setMeta(getMeta(claimsResponse.data));
      setPolicies(getItems(policiesResponse.data));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({ ...current, [name]: files ? files[0] : value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const data = new FormData();
    data.append("policy", form.policy);
    data.append("incidentDate", form.incidentDate);
    data.append("claimAmount", Number(form.claimAmount));
    data.append("approvedAmount", Number(form.approvedAmount || 0));
    data.append("status", form.status);
    data.append("description", form.description);

    if (form.document) {
      data.append("document", form.document);
    }

    try {
      if (editingId) {
        await api.put(`/claims/${editingId}`, data);
      } else {
        await api.post("/claims", data);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editClaim = (claim) => {
    setEditingId(claim._id);
    setForm({
      policy: claim.policy?._id || "",
      incidentDate: claim.incidentDate ? claim.incidentDate.slice(0, 10) : "",
      claimAmount: claim.claimAmount || "",
      approvedAmount: claim.approvedAmount || "",
      status: claim.status || "submitted",
      description: claim.description || "",
      document: null
    });
  };

  const deleteClaim = async (id) => {
    if (!window.confirm("Delete this claim?")) return;

    try {
      await api.delete(`/claims/${id}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const openDecision = (claim) => {
    setDecisionClaim(claim);
    setDecision({
      status: claim.status === "submitted" ? "approved" : claim.status,
      approvedAmount: claim.approvedAmount || claim.claimAmount || "",
      decisionNote: claim.decisionNote || ""
    });
  };

  const submitDecision = async (event) => {
    event.preventDefault();

    if (!decisionClaim) return;

    setDeciding(true);
    setError("");

    try {
      await api.patch(`/claims/${decisionClaim._id}/decision`, {
        ...decision,
        approvedAmount: Number(decision.approvedAmount || 0)
      });
      setDecisionClaim(null);
      await loadData(meta.page, search);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Claims workflow</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Claims</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <form
            className="flex w-full gap-2 sm:w-auto"
            onSubmit={(event) => {
              event.preventDefault();
              loadData(1, search);
            }}
          >
            <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search claim" />
            <button className="btn-secondary" type="submit" aria-label="Search claims">
              <Search size={16} />
            </button>
          </form>
          {canManage ? (
            <button className="btn-secondary" type="button" onClick={() => downloadReport("/claims/export/csv", "claims.csv")}>
              <Download size={16} />
              Export
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardCheck size={20} className="text-coral" />
          <h3 className="text-lg font-bold text-ink">{editingId ? "Edit Claim" : "Register Claim"}</h3>
        </div>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <select className="field xl:col-span-2" name="policy" value={form.policy} onChange={updateField} required>
            <option value="">Select policy</option>
            {policies.map((policy) => (
              <option key={policy._id} value={policy._id}>
                {policy.policyNumber} - {policy.customer?.fullName || "Customer"}
              </option>
            ))}
          </select>
          <input className="field" name="incidentDate" type="date" value={form.incidentDate} onChange={updateField} required />
          <input className="field" name="claimAmount" type="number" min="0" value={form.claimAmount} onChange={updateField} placeholder="Claim amount" required />
          <input className="field" name="approvedAmount" type="number" min="0" value={form.approvedAmount} onChange={updateField} placeholder="Approved amount" />
          <select className="field" name="status" value={form.status} onChange={updateField}>
            <option value="submitted">Submitted</option>
            <option value="under-review">Under review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="settled">Settled</option>
          </select>
          <input className="field" name="document" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={updateField} />
          <textarea className="field md:col-span-2 xl:col-span-4" name="description" value={form.description} onChange={updateField} placeholder="Incident description" rows="3" required />
          <div className="flex gap-2">
            <button className="btn-primary" type="submit" disabled={loading}>
              <Plus size={16} />
              {editingId ? "Update" : "Create"}
            </button>
            {editingId ? (
              <button className="btn-secondary" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Claim</th>
                <th className="px-4 py-3">Policy</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{claim.claimNumber}</p>
                    <p className="text-xs text-slate-500">{claim.incidentDate?.slice(0, 10)}</p>
                  </td>
                  <td className="px-4 py-3">{claim.policy?.policyNumber || "N/A"}</td>
                  <td className="px-4 py-3">{claim.customer?.fullName || "N/A"}</td>
                  <td className="px-4 py-3">{formatCurrency(claim.claimAmount)}</td>
                  <td className="px-4 py-3">
                    <p className="capitalize">{claim.status}</p>
                    {claim.approvedAmount ? (
                      <p className="text-xs text-slate-500">Approved {formatCurrency(claim.approvedAmount)}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {canManage ? (
                        <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => openDecision(claim)} aria-label="Decide claim">
                          <Stamp size={15} />
                        </button>
                      ) : null}
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => editClaim(claim)} aria-label="Edit claim">
                        <Edit3 size={15} />
                      </button>
                      {canManage ? (
                        <button className="btn-danger h-9 w-9 px-0" type="button" onClick={() => deleteClaim(claim._id)} aria-label="Delete claim">
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!claims.length ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No claims found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={(page) => loadData(page, search)} />
      </section>

      {decisionClaim ? (
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="label">Claim decision</p>
              <h3 className="text-lg font-bold text-ink">{decisionClaim.claimNumber}</h3>
            </div>
            <button className="btn-secondary" type="button" onClick={() => setDecisionClaim(null)}>
              Close
            </button>
          </div>
          <form onSubmit={submitDecision} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <select className="field" value={decision.status} onChange={(event) => setDecision((current) => ({ ...current, status: event.target.value }))}>
              <option value="under-review">Under review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="settled">Settled</option>
            </select>
            <input className="field" type="number" min="0" value={decision.approvedAmount} onChange={(event) => setDecision((current) => ({ ...current, approvedAmount: event.target.value }))} placeholder="Approved amount" />
            <textarea className="field md:col-span-2" value={decision.decisionNote} onChange={(event) => setDecision((current) => ({ ...current, decisionNote: event.target.value }))} placeholder="Decision note" rows="2" />
            <button className="btn-primary" type="submit" disabled={deciding}>
              <Stamp size={16} />
              {deciding ? "Saving..." : "Save decision"}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
};

export default Claims;
