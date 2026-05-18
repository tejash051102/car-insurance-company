import { CheckCircle2, Download, Edit3, Eye, EyeOff, FileText, KeyRound, Plus, Search, Trash2, Upload, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api, { getAssetUrl } from "../api/axios.js";
import Pagination from "../components/Pagination.jsx";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter.jsx";
import { getItems, getMeta } from "../utils/apiData.js";
import { canManageRecords } from "../utils/auth.js";
import { downloadReport } from "../utils/download.js";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  status: "active",
  password: ""
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentCustomer, setDocumentCustomer] = useState(null);
  const [documentLabel, setDocumentLabel] = useState("");
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [verificationCustomer, setVerificationCustomer] = useState(null);
  const [customerOtp, setCustomerOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const canManage = canManageRecords();

  const loadCustomers = async (term = search, page = 1) => {
    setError("");
    try {
      const { data } = await api.get("/customers", {
        params: { page, limit: 10, ...(term ? { search: term } : {}) }
      });
      setCustomers(getItems(data));
      setMeta(getMeta(data));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadCustomers("");
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
    setNotice("");

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth || undefined,
      status: form.status,
      ...(form.password ? { password: form.password } : {}),
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode
      }
    };

    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, payload);
      } else {
        const { data } = await api.post("/customers", payload);
        setNotice(data.verificationOtp ? `${data.message} OTP: ${data.verificationOtp}` : data.message || "Customer created");
        setVerificationCustomer(data.customer || null);
      }

      resetForm();
      await loadCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editCustomer = (customer) => {
    setEditingId(customer._id);
    setForm({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.slice(0, 10) : "",
      street: customer.address?.street || "",
      city: customer.address?.city || "",
      state: customer.address?.state || "",
      zipCode: customer.address?.zipCode || "",
      status: customer.status || "active",
      password: ""
    });
  };

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await api.delete(`/customers/${id}`);
      await loadCustomers();
    } catch (err) {
      setError(err.message);
    }
  };

  const uploadDocuments = async (event) => {
    event.preventDefault();

    if (!documentCustomer || !documents.length) {
      setError("Choose a customer and at least one document");
      return;
    }

    const data = new FormData();
    data.append("label", documentLabel || "Customer document");
    Array.from(documents).forEach((document) => data.append("documents", document));

    setUploading(true);
    setError("");

    try {
      await api.post(`/customers/${documentCustomer._id}/documents`, data);
      setDocumentCustomer(null);
      setDocumentLabel("");
      setDocuments([]);
      await loadCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const openVerification = (customer) => {
    setVerificationCustomer(customer);
    setCustomerOtp("");
    setNotice("");
    setError("");
  };

  const resendCustomerOtp = async () => {
    if (!verificationCustomer) return;

    setVerifying(true);
    setError("");
    setNotice("");

    try {
      const { data } = await api.post(`/customers/${verificationCustomer._id}/send-otp`);
      setNotice(data.verificationOtp ? `${data.message} OTP: ${data.verificationOtp}` : data.message || "Verification code sent to customer email");
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  const verifyCustomerOtp = async (event) => {
    event.preventDefault();

    if (!verificationCustomer) return;

    setVerifying(true);
    setError("");
    setNotice("");

    try {
      await api.post(`/customers/${verificationCustomer._id}/verify-otp`, { otp: customerOtp });
      setNotice("Customer contact verified successfully");
      setVerificationCustomer(null);
      setCustomerOtp("");
      await loadCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Customer registry</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Customers</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
        <form
          className="flex w-full gap-2 sm:w-auto"
          onSubmit={(event) => {
            event.preventDefault();
            loadCustomers(search, 1);
          }}
        >
          <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer" />
          <button className="btn-secondary" type="submit" aria-label="Search customers">
            <Search size={16} />
          </button>
        </form>
        {canManage ? (
          <button className="btn-secondary" type="button" onClick={() => downloadReport("/customers/export/csv", "customers.csv")}>
            <Download size={16} />
            Export
          </button>
        ) : null}
        </div>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users size={20} className="text-brand" />
          <h3 className="text-lg font-bold text-ink">{editingId ? "Edit Customer" : "Add Customer"}</h3>
        </div>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input className="field" name="firstName" value={form.firstName} onChange={updateField} placeholder="First name" required />
          <input className="field" name="lastName" value={form.lastName} onChange={updateField} placeholder="Last name" required />
          <input className="field" name="email" type="email" value={form.email} onChange={updateField} placeholder="Email" required />
          <input className="field" name="phone" value={form.phone} onChange={updateField} placeholder="Phone" required />
          <input className="field" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={updateField} />
          <input className="field" name="street" value={form.street} onChange={updateField} placeholder="Street" />
          <input className="field" name="city" value={form.city} onChange={updateField} placeholder="City" />
          <input className="field" name="state" value={form.state} onChange={updateField} placeholder="State" />
          <input className="field" name="zipCode" value={form.zipCode} onChange={updateField} placeholder="Zip code" />
          <select className="field" name="status" value={form.status} onChange={updateField}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="relative">
            <input
              className="field pr-12"
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={6}
              value={form.password}
              onChange={updateField}
              placeholder={editingId ? "New portal password (optional)" : "Customer portal password"}
              required={!editingId}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-cyan-400/25 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/20 hover:text-cyan-200"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} strokeWidth={1.8} /> : <Eye size={18} strokeWidth={1.8} />}
            </button>
          </div>
          <div>
            <PasswordStrengthMeter password={form.password} />
          </div>
          <div className="flex gap-2 xl:col-span-2">
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
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Added By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-ink">{customer.fullName}</td>
                  <td className="px-4 py-3">
                    <p>{customer.email}</p>
                    <p className="text-xs text-slate-500">{customer.phone}</p>
                  </td>
                  <td className="px-4 py-3">{customer.address?.city || "N/A"}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink">{customer.createdBy?.name || "N/A"}</p>
                    <p className="text-xs capitalize text-slate-500">{customer.createdBy?.role || ""}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{customer.status}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${customer.contactVerified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {customer.contactVerified ? "Verified" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => openVerification(customer)} aria-label="Verify customer contact">
                        {customer.contactVerified ? <CheckCircle2 size={15} /> : <KeyRound size={15} />}
                      </button>
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => editCustomer(customer)} aria-label="Edit customer">
                        <Edit3 size={15} />
                      </button>
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => setDocumentCustomer(customer)} aria-label="Upload customer documents">
                        <Upload size={15} />
                      </button>
                      {canManage ? (
                        <button className="btn-danger h-9 w-9 px-0" type="button" onClick={() => deleteCustomer(customer._id)} aria-label="Delete customer">
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!customers.length ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={(page) => loadCustomers(search, page)} />
      </section>

      {documentCustomer ? (
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="label">Customer documents</p>
              <h3 className="text-lg font-bold text-ink">{documentCustomer.fullName}</h3>
            </div>
            <button className="btn-secondary" type="button" onClick={() => setDocumentCustomer(null)}>
              Close
            </button>
          </div>

          <form onSubmit={uploadDocuments} className="grid gap-4 md:grid-cols-3">
            <input className="field" value={documentLabel} onChange={(event) => setDocumentLabel(event.target.value)} placeholder="Document label" />
            <input className="field" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple onChange={(event) => setDocuments(event.target.files)} />
            <button className="btn-primary" type="submit" disabled={uploading}>
              <Upload size={16} />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(documentCustomer.documents || []).map((document) => (
              <a key={document._id || document.url} className="rounded-md border border-slate-200 bg-white px-3 py-3 text-sm hover:border-brand" href={getAssetUrl(document.url)} target="_blank" rel="noreferrer">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <FileText size={16} />
                  {document.label || "Document"}
                </span>
                <span className="mt-1 block truncate text-xs text-slate-500">{document.originalName || document.url}</span>
                <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold ${
                  document.scanStatus === "blocked"
                    ? "bg-red-50 text-red-700"
                    : document.scanStatus === "safe"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-cyan-50 text-cyan-700"
                }`}>
                  {document.scanStatus || "scanned"}
                </span>
                {document.scanMessage ? <span className="mt-1 block text-xs text-slate-500">{document.scanMessage}</span> : null}
              </a>
            ))}
            {!documentCustomer.documents?.length ? <p className="text-sm text-slate-500">No documents uploaded yet.</p> : null}
          </div>
        </section>
      ) : null}

      {verificationCustomer ? (
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="label">Customer OTP verification</p>
              <h3 className="text-lg font-bold text-ink">{verificationCustomer.fullName}</h3>
              <p className="mt-1 text-sm text-slate-500">Ask the customer for the 6-digit code sent to {verificationCustomer.email}.</p>
            </div>
            <button className="btn-secondary" type="button" onClick={() => setVerificationCustomer(null)}>
              Close
            </button>
          </div>

          <form onSubmit={verifyCustomerOtp} className="grid gap-4 md:grid-cols-3">
            <input
              className="field"
              inputMode="numeric"
              maxLength={6}
              value={customerOtp}
              onChange={(event) => setCustomerOtp(event.target.value)}
              placeholder="Enter OTP"
              required
            />
            <button className="btn-primary" type="submit" disabled={verifying}>
              <CheckCircle2 size={16} />
              {verifying ? "Verifying..." : "Verify"}
            </button>
            <button className="btn-secondary" type="button" onClick={resendCustomerOtp} disabled={verifying}>
              <KeyRound size={16} />
              Resend OTP
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
};

export default Customers;
