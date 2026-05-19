import { Bell, Download, Edit3, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Pagination from "../components/Pagination.jsx";
import { getItems, getMeta } from "../utils/apiData.js";
import { canManageRecords } from "../utils/auth.js";
import { downloadBlob, downloadReport } from "../utils/download.js";

const emptyForm = {
  customer: "",
  vehicle: "",
  policyNumber: "",
  type: "comprehensive",
  coverageAmount: "",
  premiumAmount: "",
  startDate: "",
  endDate: "",
  status: "pending",
  notes: ""
};

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canManage = canManageRecords();

  const loadData = async (page = 1, term = search) => {
    setError("");
    try {
      const [policiesResponse, customersResponse, vehiclesResponse] = await Promise.all([
        api.get("/policies", { params: { page, limit: 10, ...(term ? { search: term } : {}) } }),
        api.get("/customers", { params: { limit: 100 } }),
        api.get("/vehicles", { params: { limit: 100 } })
      ]);
      setPolicies(getItems(policiesResponse.data));
      setMeta(getMeta(policiesResponse.data));
      setCustomers(getItems(customersResponse.data));
      setVehicles(getItems(vehiclesResponse.data));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      policyNumber: form.policyNumber || undefined,
      coverageAmount: Number(form.coverageAmount),
      premiumAmount: Number(form.premiumAmount)
    };

    try {
      if (editingId) {
        await api.put(`/policies/${editingId}`, payload);
      } else {
        await api.post("/policies", payload);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editPolicy = (policy) => {
    setEditingId(policy._id);
    setForm({
      customer: policy.customer?._id || "",
      vehicle: policy.vehicle?._id || "",
      policyNumber: policy.policyNumber || "",
      type: policy.type || "comprehensive",
      coverageAmount: policy.coverageAmount || "",
      premiumAmount: policy.premiumAmount || "",
      startDate: policy.startDate ? policy.startDate.slice(0, 10) : "",
      endDate: policy.endDate ? policy.endDate.slice(0, 10) : "",
      status: policy.status || "pending",
      notes: policy.notes || ""
    });
  };

  const deletePolicy = async (id) => {
    if (!window.confirm("Delete this policy?")) return;

    try {
      await api.delete(`/policies/${id}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadPdf = async (policy) => {
    try {
      const response = await api.get(`/policies/${policy._id}/pdf`, { responseType: "blob" });
      downloadBlob(response.data, `${policy.policyNumber}.pdf`);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendExpiryReminders = async () => {
    setError("");
    setNotice("");
    try {
      const { data } = await api.post("/policies/expiry-reminders", { days: 30 });
      setNotice(`${data.message}: ${data.count} policies checked`);
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredVehicles = form.customer
    ? vehicles.filter((vehicle) => vehicle.customer?._id === form.customer)
    : vehicles;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Policy administration</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Policies</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              loadData(1, search);
            }}
          >
            <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search policy" />
            <button className="btn-secondary" type="submit" aria-label="Search policies">
              <Search size={16} />
            </button>
          </form>
          {canManage ? (
            <>
              <button className="btn-secondary" type="button" onClick={() => downloadReport("/policies/export/csv", "policies.csv")}>
                <Download size={16} />
                Export
              </button>
              <button className="btn-secondary" type="button" onClick={sendExpiryReminders}>
                <Bell size={16} />
                Reminders
              </button>
            </>
          ) : null}
        </div>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck size={20} className="text-brand" />
          <h3 className="text-lg font-bold text-ink">{editingId ? "Edit Policy" : "Create Policy"}</h3>
        </div>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <select className="field" name="customer" value={form.customer} onChange={updateField} required>
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>
                {customer.fullName}
              </option>
            ))}
          </select>
          <select className="field" name="vehicle" value={form.vehicle} onChange={updateField} required>
            <option value="">Select vehicle</option>
            {filteredVehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
          <input className="field" name="policyNumber" value={form.policyNumber} onChange={updateField} placeholder="Policy number (auto if blank)" />
          <select className="field" name="type" value={form.type} onChange={updateField}>
            <option value="comprehensive">Comprehensive</option>
            <option value="third-party">Third-party</option>
            <option value="collision">Collision</option>
            <option value="liability">Liability</option>
          </select>
          <input className="field" name="coverageAmount" type="number" min="0" value={form.coverageAmount} onChange={updateField} placeholder="Coverage amount" required />
          <input className="field" name="premiumAmount" type="number" min="0" value={form.premiumAmount} onChange={updateField} placeholder="Premium amount" required />
          <input className="field" name="startDate" type="date" value={form.startDate} onChange={updateField} required />
          <input className="field" name="endDate" type="date" value={form.endDate} onChange={updateField} required />
          <select className="field" name="status" value={form.status} onChange={updateField}>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input className="field xl:col-span-2" name="notes" value={form.notes} onChange={updateField} placeholder="Notes" />
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
                <th className="px-4 py-3">Policy</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Premium</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy) => (
                <tr key={policy._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{policy.policyNumber}</p>
                    <p className="text-xs capitalize text-slate-500">{policy.type}</p>
                  </td>
                  <td className="px-4 py-3">{policy.customer?.fullName || "N/A"}</td>
                  <td className="px-4 py-3">{policy.vehicle?.registrationNumber || "N/A"}</td>
                  <td className="px-4 py-3">{formatCurrency(policy.premiumAmount)}</td>
                  <td className="px-4 py-3 capitalize">{policy.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => downloadPdf(policy)} aria-label="Download policy PDF">
                        <Download size={15} />
                      </button>
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => editPolicy(policy)} aria-label="Edit policy">
                        <Edit3 size={15} />
                      </button>
                      {canManage ? (
                        <button className="btn-danger h-9 w-9 px-0" type="button" onClick={() => deletePolicy(policy._id)} aria-label="Delete policy">
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!policies.length ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    No policies found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={(page) => loadData(page, search)} />
      </section>
    </div>
  );
};

export default Policies;
