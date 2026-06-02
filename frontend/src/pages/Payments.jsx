import { BadgeIndianRupee, Download, Edit3, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Pagination from "../components/Pagination.jsx";
import { getItems, getMeta } from "../utils/apiData.js";
import { canManageRecords } from "../utils/auth.js";
import { downloadBlob, downloadReport } from "../utils/download.js";

const emptyForm = {
  policy: "",
  amount: "",
  method: "upi",
  paymentDate: "",
  status: "pending",
  transactionId: "",
  notes: ""
};

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canManage = canManageRecords();

  const loadData = async (page = 1, term = search) => {
    setError("");
    try {
      const [paymentsResponse, policiesResponse] = await Promise.all([
        api.get("/payments", { params: { page, limit: 10, ...(term ? { search: term } : {}) } }),
        api.get("/policies", { params: { limit: 100 } })
      ]);
      setPayments(getItems(paymentsResponse.data));
      setMeta(getMeta(paymentsResponse.data));
      setPolicies(getItems(policiesResponse.data));
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
      amount: Number(form.amount),
      paymentDate: form.paymentDate || undefined
    };

    try {
      if (editingId) {
        await api.put(`/payments/${editingId}`, payload);
      } else {
        await api.post("/payments", payload);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editPayment = (payment) => {
    setEditingId(payment._id);
    setForm({
      policy: payment.policy?._id || "",
      amount: payment.amount || "",
      method: payment.method || "upi",
      paymentDate: payment.paymentDate ? payment.paymentDate.slice(0, 10) : "",
      status: payment.status || "pending",
      transactionId: payment.transactionId || "",
      notes: payment.notes || ""
    });
  };

  const deletePayment = async (id) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      await api.delete(`/payments/${id}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const downloadInvoice = async (payment) => {
    try {
      const response = await api.get(`/payments/${payment._id}/invoice`, { responseType: "blob" });
      downloadBlob(response.data, `${payment.paymentNumber}-invoice.pdf`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Premium collection</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Payments</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <form
            className="flex w-full gap-2 sm:w-auto"
            onSubmit={(event) => {
              event.preventDefault();
              loadData(1, search);
            }}
          >
            <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search payment" />
            <button className="btn-secondary" type="submit" aria-label="Search payments">
              <Search size={16} />
            </button>
          </form>
          {canManage ? (
            <button className="btn-secondary" type="button" onClick={() => downloadReport("/payments/export/csv", "payments.csv")}>
              <Download size={16} />
              Export
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <BadgeIndianRupee size={20} className="text-mint" />
          <h3 className="text-lg font-bold text-ink">{editingId ? "Edit Payment" : "Record Payment"}</h3>
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
          <input className="field" name="amount" type="number" min="0" value={form.amount} onChange={updateField} placeholder="Amount" required />
          <select className="field" name="method" value={form.method} onChange={updateField}>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="bank-transfer">Bank transfer</option>
            <option value="cheque">Cheque</option>
          </select>
          <input className="field" name="paymentDate" type="date" value={form.paymentDate} onChange={updateField} />
          <select className="field" name="status" value={form.status} onChange={updateField}>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <input className="field" name="transactionId" value={form.transactionId} onChange={updateField} placeholder="Transaction ID" />
          <input className="field" name="notes" value={form.notes} onChange={updateField} placeholder="Notes" />
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
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Policy</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{payment.paymentNumber}</p>
                    <p className="text-xs text-slate-500">{payment.paymentDate?.slice(0, 10)}</p>
                  </td>
                  <td className="px-4 py-3">{payment.policy?.policyNumber || "N/A"}</td>
                  <td className="px-4 py-3">{payment.customer?.fullName || "N/A"}</td>
                  <td className="px-4 py-3">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3 capitalize">{payment.method}</td>
                  <td className="px-4 py-3 capitalize">{payment.status}</td>
                  <td className="px-4 py-3">
                    {payment.receiptIssuedAt ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Receipt {payment.receiptIssuedAt.slice(0, 10)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Not issued</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => editPayment(payment)} aria-label="Edit payment">
                        <Edit3 size={15} />
                      </button>
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => downloadInvoice(payment)} aria-label="Download invoice">
                        <Download size={15} />
                      </button>
                      {canManage ? (
                        <button className="btn-danger h-9 w-9 px-0" type="button" onClick={() => deletePayment(payment._id)} aria-label="Delete payment">
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!payments.length ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                    No payments found.
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

export default Payments;
