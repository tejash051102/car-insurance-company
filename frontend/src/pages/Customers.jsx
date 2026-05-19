import { Edit3, Plus, Search, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Pagination from "../components/Pagination.jsx";
import { getItems, getMeta } from "../utils/apiData.js";
import { isAdminUser } from "../utils/auth.js";

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
  status: "active"
};

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdmin = isAdminUser();

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

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      dateOfBirth: form.dateOfBirth || undefined,
      status: form.status,
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
        await api.post("/customers", payload);
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
      status: customer.status || "active"
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Customer registry</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Customers</h2>
        </div>
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
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

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
                <th className="px-4 py-3">Status</th>
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
                  <td className="px-4 py-3 capitalize">{customer.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => editCustomer(customer)} aria-label="Edit customer">
                        <Edit3 size={15} />
                      </button>
                      {isAdmin ? (
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
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={(page) => loadCustomers(search, page)} />
      </section>
    </div>
  );
};

export default Customers;
