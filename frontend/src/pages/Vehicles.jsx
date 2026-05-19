<<<<<<< HEAD
import { Car, Edit3, Plus, Search, Trash2 } from "lucide-react";
=======
import { Car, Download, Edit3, Plus, Search, Trash2 } from "lucide-react";
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Pagination from "../components/Pagination.jsx";
import { getItems, getMeta } from "../utils/apiData.js";
<<<<<<< HEAD
import { isAdminUser } from "../utils/auth.js";
=======
import { canManageRecords } from "../utils/auth.js";
import { downloadReport } from "../utils/download.js";
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

const emptyForm = {
  customer: "",
  registrationNumber: "",
  make: "",
  model: "",
  year: new Date().getFullYear(),
  vehicleType: "car",
  fuelType: "petrol",
  chassisNumber: "",
  engineNumber: "",
  value: ""
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
  const isAdmin = isAdminUser();
=======
  const canManage = canManageRecords();
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b

  const loadData = async (page = 1, term = search) => {
    setError("");
    try {
      const [vehiclesResponse, customersResponse] = await Promise.all([
        api.get("/vehicles", { params: { page, limit: 10, ...(term ? { search: term } : {}) } }),
        api.get("/customers", { params: { limit: 100 } })
      ]);
      setVehicles(getItems(vehiclesResponse.data));
      setMeta(getMeta(vehiclesResponse.data));
      setCustomers(getItems(customersResponse.data));
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
      year: Number(form.year),
      value: Number(form.value || 0)
    };

    try {
      if (editingId) {
        await api.put(`/vehicles/${editingId}`, payload);
      } else {
        await api.post("/vehicles", payload);
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editVehicle = (vehicle) => {
    setEditingId(vehicle._id);
    setForm({
      customer: vehicle.customer?._id || "",
      registrationNumber: vehicle.registrationNumber || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || new Date().getFullYear(),
      vehicleType: vehicle.vehicleType || "car",
      fuelType: vehicle.fuelType || "petrol",
      chassisNumber: vehicle.chassisNumber || "",
      engineNumber: vehicle.engineNumber || "",
      value: vehicle.value || ""
    });
  };

  const deleteVehicle = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;

    try {
      await api.delete(`/vehicles/${id}`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="label">Vehicle inventory</p>
          <h2 className="mt-1 text-2xl font-bold text-ink">Vehicles</h2>
        </div>
<<<<<<< HEAD
=======
        <div className="flex flex-col gap-2 sm:flex-row">
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
        <form
          className="flex w-full gap-2 sm:w-auto"
          onSubmit={(event) => {
            event.preventDefault();
            loadData(1, search);
          }}
        >
          <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vehicle" />
          <button className="btn-secondary" type="submit" aria-label="Search vehicles">
            <Search size={16} />
          </button>
        </form>
<<<<<<< HEAD
=======
        {canManage ? (
          <button className="btn-secondary" type="button" onClick={() => downloadReport("/vehicles/export/csv", "vehicles.csv")}>
            <Download size={16} />
            Export
          </button>
        ) : null}
        </div>
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <Car size={20} className="text-mint" />
          <h3 className="text-lg font-bold text-ink">{editingId ? "Edit Vehicle" : "Add Vehicle"}</h3>
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
          <input className="field" name="registrationNumber" value={form.registrationNumber} onChange={updateField} placeholder="Registration number" required />
          <input className="field" name="make" value={form.make} onChange={updateField} placeholder="Make" required />
          <input className="field" name="model" value={form.model} onChange={updateField} placeholder="Model" required />
          <input className="field" name="year" type="number" min="1980" value={form.year} onChange={updateField} placeholder="Year" required />
          <select className="field" name="vehicleType" value={form.vehicleType} onChange={updateField}>
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="suv">SUV</option>
            <option value="truck">Truck</option>
            <option value="van">Van</option>
            <option value="other">Other</option>
          </select>
          <select className="field" name="fuelType" value={form.fuelType} onChange={updateField}>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
            <option value="cng">CNG</option>
          </select>
          <input className="field" name="value" type="number" min="0" value={form.value} onChange={updateField} placeholder="Vehicle value" />
          <input className="field" name="chassisNumber" value={form.chassisNumber} onChange={updateField} placeholder="Chassis number" />
          <input className="field" name="engineNumber" value={form.engineNumber} onChange={updateField} placeholder="Engine number" />
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
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Fuel</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle._id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-ink">{vehicle.registrationNumber}</td>
                  <td className="px-4 py-3">
                    {vehicle.make} {vehicle.model}
                    <p className="text-xs text-slate-500">{vehicle.year} · {vehicle.vehicleType}</p>
                  </td>
                  <td className="px-4 py-3">{vehicle.customer?.fullName || "N/A"}</td>
                  <td className="px-4 py-3 capitalize">{vehicle.fuelType}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary h-9 w-9 px-0" type="button" onClick={() => editVehicle(vehicle)} aria-label="Edit vehicle">
                        <Edit3 size={15} />
                      </button>
<<<<<<< HEAD
                      {isAdmin ? (
=======
                      {canManage ? (
>>>>>>> 547d24a0daaff7d35c558dbe9c8c3e520c14045b
                        <button className="btn-danger h-9 w-9 px-0" type="button" onClick={() => deleteVehicle(vehicle._id)} aria-label="Delete vehicle">
                          <Trash2 size={15} />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {!vehicles.length ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    No vehicles found.
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

export default Vehicles;
