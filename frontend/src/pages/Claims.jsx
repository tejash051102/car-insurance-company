import { ClipboardCheck, Download, Edit3, Eye, Plus, Search, ShieldAlert, Stamp, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import api, { getAssetUrl } from "../api/axios.js";
import ClaimTrackingTimeline from "../components/ClaimTrackingTimeline.jsx";
import DragDropUpload from "../components/DragDropUpload.jsx";
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
  document: null,
  accidentPhotos: [],
  repairBills: [],
  firReports: []
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
  const [decision, setDecision] = useState({
    status: "approved",
    approvedAmount: "",
    decisionNote: "",
    assignedAgent: "",
    inspectionDate: "",
    inspector: "",
    inspectionResult: "pending",
    inspectionReport: ""
  });
  const [deciding, setDeciding] = useState(false);
  const [teamUsers, setTeamUsers] = useState({ agents: [], managers: [] });
  const [garages, setGarages] = useState([]);
  const canManage = canManageRecords();

  const loadData = async (page = 1, term = search) => {
    setError("");
    try {
      const [claimsResponse, policiesResponse, garagesResponse] = await Promise.all([
        api.get("/claims", { params: { page, limit: 10, ...(term ? { search: term } : {}) } }),
        api.get("/policies", { params: { limit: 100 } }),
        api.get("/garages").catch(() => ({ data: [] }))
      ]);
      setClaims(getItems(claimsResponse.data));
      setMeta(getMeta(claimsResponse.data));
      setPolicies(getItems(policiesResponse.data));
      setGarages(garagesResponse.data);
      if (canManage) {
        try {
          const { data } = await api.get("/users/team");
          setTeamUsers(data);
        } catch {
          setTeamUsers({ agents: [], managers: [] });
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (event) => {
    const { name, value, files } = event.target;
    setForm((current) => ({ ...current, [name]: files ? (event.target.multiple ? Array.from(files) : files[0]) : value }));
  };

  const updateFiles = (name, files) => {
    setForm((current) => ({ ...current, [name]: files }));
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
    form.accidentPhotos.forEach((file) => data.append("accidentPhotos", file));
    form.repairBills.forEach((file) => data.append("repairBills", file));
    form.firReports.forEach((file) => data.append("firReports", file));

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
      document: null,
      accidentPhotos: [],
      repairBills: [],
      firReports: []
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
      decisionNote: claim.decisionNote || "",
      assignedAgent: claim.assignedAgent?._id || "",
      inspectionDate: claim.inspection?.scheduledAt ? claim.inspection.scheduledAt.slice(0, 16) : "",
      inspector: claim.inspection?.inspector?._id || "",
      inspectionResult: claim.inspection?.result || "pending",
      inspectionReport: claim.inspection?.report || "",
      garage: claim.repair?.garage?._id || "",
      repairEstimate: claim.repair?.estimateAmount || "",
      repairStatus: claim.repair?.status || "not-started",
      repairNotes: claim.repair?.notes || ""
    });
  };

  const refreshFraudScore = async (claim) => {
    setError("");
    try {
      await api.patch(`/claims/${claim._id}/fraud-score`);
      await loadData(meta.page, search);
    } catch (err) {
      setError(err.message);
    }
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
            <option value="survey-scheduled">Survey scheduled</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
            <option value="settled">Settled</option>
          </select>
          <div className="grid gap-3 md:col-span-2 xl:col-span-4 md:grid-cols-2 xl:grid-cols-4">
            <DragDropUpload label="Main document" name="document" files={form.document} onFilesChange={updateFiles} />
            <DragDropUpload label="Accident photos" name="accidentPhotos" files={form.accidentPhotos} multiple onFilesChange={updateFiles} />
            <DragDropUpload label="Repair bills" name="repairBills" files={form.repairBills} multiple onFilesChange={updateFiles} />
            <DragDropUpload label="FIR or reports" name="firReports" files={form.firReports} multiple onFilesChange={updateFiles} />
          </div>
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
                  <td colSpan="6" className="px-4 py-4">
                    <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr_auto] xl:items-start">
                      <div>
                        <p className="font-semibold text-ink">{claim.claimNumber}</p>
                        <p className="text-xs text-slate-500">{claim.incidentDate?.slice(0, 10)}</p>
                        <p className="mt-2 text-sm text-slate-500">{claim.policy?.policyNumber || "N/A"} | {claim.customer?.fullName || "N/A"}</p>
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span>{formatCurrency(claim.claimAmount)}</span>
                          <span className="capitalize">{claim.status}</span>
                          {claim.approvedAmount ? <span>Approved {formatCurrency(claim.approvedAmount)}</span> : null}
                          {claim.fraud?.score ? (
                            <span className={claim.fraud.level === "high" ? "text-red-600" : claim.fraud.level === "medium" ? "text-amber-600" : "text-emerald-600"}>
                              Fraud {claim.fraud.score}/100 {claim.fraud.level}
                            </span>
                          ) : null}
                          {claim.repair?.garage?.name ? <span>{claim.repair.garage.name}</span> : null}
                        </div>
                        <ClaimTrackingTimeline claim={claim} />
                      </div>
                      <div className="flex justify-end gap-2">
                        {canManage ? (
                          <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => openDecision(claim)} aria-label="Decide claim">
                            <Stamp size={15} />
                          </button>
                        ) : null}
                        {canManage ? (
                          <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => refreshFraudScore(claim)} aria-label="Refresh fraud score">
                            <ShieldAlert size={15} />
                          </button>
                        ) : null}
                        {claim.documentUrl || claim.documents?.length ? (
                          <a className="btn-secondary h-9 w-9 px-0" href={getAssetUrl(claim.documentUrl || claim.documents[0]?.url)} target="_blank" rel="noreferrer" aria-label="View evidence">
                            <Eye size={15} />
                          </a>
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
              <option value="survey-scheduled">Survey scheduled</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="paid">Paid</option>
              <option value="settled">Settled</option>
            </select>
            <input className="field" type="number" min="0" value={decision.approvedAmount} onChange={(event) => setDecision((current) => ({ ...current, approvedAmount: event.target.value }))} placeholder="Approved amount" />
            <select className="field" value={decision.assignedAgent} onChange={(event) => setDecision((current) => ({ ...current, assignedAgent: event.target.value }))}>
              <option value="">Assign agent</option>
              {teamUsers.agents.map((agent) => (
                <option key={agent._id} value={agent._id}>{agent.name}</option>
              ))}
            </select>
            <input className="field" type="datetime-local" value={decision.inspectionDate} onChange={(event) => setDecision((current) => ({ ...current, inspectionDate: event.target.value }))} />
            <select className="field" value={decision.inspector} onChange={(event) => setDecision((current) => ({ ...current, inspector: event.target.value }))}>
              <option value="">Surveyor / inspector</option>
              {[...teamUsers.managers, ...teamUsers.agents].map((user) => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            <select className="field" value={decision.inspectionResult} onChange={(event) => setDecision((current) => ({ ...current, inspectionResult: event.target.value }))}>
              <option value="pending">Inspection pending</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="needs-review">Needs review</option>
            </select>
            <textarea className="field md:col-span-2" value={decision.inspectionReport} onChange={(event) => setDecision((current) => ({ ...current, inspectionReport: event.target.value }))} placeholder="Inspection report" rows="2" />
            <select className="field" value={decision.garage} onChange={(event) => setDecision((current) => ({ ...current, garage: event.target.value }))}>
              <option value="">Repair garage</option>
              {garages.map((garage) => (
                <option key={garage._id} value={garage._id}>{garage.name}</option>
              ))}
            </select>
            <select className="field" value={decision.repairStatus} onChange={(event) => setDecision((current) => ({ ...current, repairStatus: event.target.value }))}>
              <option value="not-started">Repair not started</option>
              <option value="estimate-requested">Estimate requested</option>
              <option value="repairing">Repairing</option>
              <option value="completed">Completed</option>
              <option value="billed">Billed</option>
            </select>
            <input className="field" type="number" min="0" value={decision.repairEstimate} onChange={(event) => setDecision((current) => ({ ...current, repairEstimate: event.target.value }))} placeholder="Repair estimate" />
            <input className="field" value={decision.repairNotes} onChange={(event) => setDecision((current) => ({ ...current, repairNotes: event.target.value }))} placeholder="Repair notes" />
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
