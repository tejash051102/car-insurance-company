import { MessageSquare, Plus, Send } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ customer: "", subject: "", category: "general", priority: "medium", message: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setError("");
    try {
      const [ticketResponse, customerResponse] = await Promise.all([
        api.get("/tickets"),
        api.get("/customers", { params: { limit: 100 } })
      ]);
      setTickets(ticketResponse.data || []);
      setCustomers(customerResponse.data.items || customerResponse.data || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/tickets", form);
      setForm({ customer: "", subject: "", category: "general", priority: "medium", message: "" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (ticket, status) => {
    await api.patch(`/tickets/${ticket._id}`, { status });
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Customer service workflow</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">Support Tickets</h2>
      </div>

      {error ? <div className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="panel space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Plus size={18} className="text-cyan-300" />
            <h3 className="font-bold text-ink">Create Ticket</h3>
          </div>
          <select className="field" value={form.customer} onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))} required>
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer._id} value={customer._id}>{customer.fullName || `${customer.firstName} ${customer.lastName}`}</option>
            ))}
          </select>
          <input className="field" placeholder="Subject" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} required />
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="field" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
              {["policy", "claim", "payment", "document", "security", "general"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className="field" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>
              {["low", "medium", "high", "urgent"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <textarea className="field min-h-28" placeholder="Message" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} required />
          <button className="btn-primary w-full" type="submit" disabled={loading}>
            <Send size={16} />
            {loading ? "Creating..." : "Create Ticket"}
          </button>
        </form>

        <div className="panel overflow-hidden">
          <div className="border-b border-white/10 px-5 py-4">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <MessageSquare size={18} className="text-cyan-300" />
              Ticket Queue
            </h3>
          </div>
          <div className="divide-y divide-white/10">
            {tickets.map((ticket) => (
              <article key={ticket._id} className="px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{ticket.ticketNumber} • {ticket.subject}</p>
                    <p className="mt-1 text-sm text-slate-500">{ticket.customer?.fullName || ticket.customer?.email} • {ticket.category} • {ticket.priority}</p>
                  </div>
                  <select className="field max-w-52" value={ticket.status} onChange={(event) => updateStatus(ticket, event.target.value)}>
                    {["open", "in-progress", "waiting-customer", "resolved", "closed"].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <p className="mt-3 text-sm text-slate-500">{ticket.messages?.at(-1)?.message}</p>
              </article>
            ))}
            {!tickets.length ? <p className="px-5 py-8 text-center text-sm text-slate-500">No support tickets yet.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Tickets;
