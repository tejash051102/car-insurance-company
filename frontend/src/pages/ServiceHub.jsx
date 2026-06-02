import { Building2, CheckCircle2, MessageSquare, Plus, Send, Star, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { getItems } from "../utils/apiData.js";

const emptyGarage = { name: "", contactPerson: "", phone: "", email: "", city: "", address: "", rating: 4, status: "approved" };
const emptyPlan = { policy: "", frequency: "monthly", installmentCount: 12, totalAmount: "", startDate: "" };
const emptyFeedback = { customer: "", policy: "", claim: "", rating: 5, category: "overall", comment: "" };
const emptyThread = { subject: "", customer: "", assignedTo: "", message: "" };

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);

const ServiceHub = () => {
  const [garages, setGarages] = useState([]);
  const [plans, setPlans] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [threads, setThreads] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [team, setTeam] = useState({ agents: [], managers: [] });
  const [garageForm, setGarageForm] = useState(emptyGarage);
  const [planForm, setPlanForm] = useState(emptyPlan);
  const [feedbackForm, setFeedbackForm] = useState(emptyFeedback);
  const [threadForm, setThreadForm] = useState(emptyThread);
  const [timelineId, setTimelineId] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [chatText, setChatText] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const [garageRes, planRes, feedbackRes, threadRes, policyRes, customerRes, claimRes, teamRes] = await Promise.all([
        api.get("/garages"),
        api.get("/services/payment-plans"),
        api.get("/services/feedback"),
        api.get("/services/messages"),
        api.get("/policies", { params: { limit: 100 } }),
        api.get("/customers", { params: { limit: 100 } }),
        api.get("/claims", { params: { limit: 100 } }),
        api.get("/users/team").catch(() => ({ data: { agents: [], managers: [] } }))
      ]);
      setGarages(garageRes.data);
      setPlans(planRes.data);
      setFeedback(feedbackRes.data);
      setThreads(threadRes.data);
      setPolicies(getItems(policyRes.data));
      setCustomers(getItems(customerRes.data));
      setClaims(getItems(claimRes.data));
      setTeam(teamRes.data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
    const interval = window.setInterval(loadData, 10000);
    return () => window.clearInterval(interval);
  }, []);

  const activeThread = threads.find((thread) => thread._id === activeThreadId) || threads[0];

  const update = (setter) => (event) => setter((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submitGarage = async (event) => {
    event.preventDefault();
    try {
      await api.post("/garages", garageForm);
      setGarageForm(emptyGarage);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitPlan = async (event) => {
    event.preventDefault();
    try {
      await api.post("/services/payment-plans", planForm);
      setPlanForm(emptyPlan);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const payInstallment = async (plan, installment) => {
    try {
      await api.patch(`/services/payment-plans/${plan._id}/installments/${installment._id}/pay`, { method: "upi" });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitFeedback = async (event) => {
    event.preventDefault();
    try {
      await api.post("/services/feedback", feedbackForm);
      setFeedbackForm(emptyFeedback);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitThread = async (event) => {
    event.preventDefault();
    try {
      await api.post("/services/messages", threadForm);
      setThreadForm(emptyThread);
      const { data } = await api.get("/services/messages");
      setThreads(data);
      setActiveThreadId(data[0]?._id || "");
    } catch (err) {
      setError(err.message);
    }
  };

  const sendChatMessage = async (event) => {
    event.preventDefault();
    const targetThread = activeThread?._id;
    if (!targetThread || !chatText.trim()) return;

    try {
      const { data } = await api.post(`/services/messages/${targetThread}`, { body: chatText.trim() });
      setThreads((current) => current.map((thread) => (thread._id === data._id ? data : thread)));
      setChatText("");
    } catch (err) {
      setError(err.message);
    }
  };

  const loadTimeline = async () => {
    if (!timelineId) return;
    try {
      const { data } = await api.get(`/services/timeline/${timelineId}`);
      setTimeline(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Service operations</p>
        <h2 className="mt-1 text-2xl font-bold text-ink">Service Hub</h2>
      </div>

      {error ? <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2"><Building2 size={19} className="text-brand" /><h3 className="font-bold text-ink">Garage Partners</h3></div>
          <form onSubmit={submitGarage} className="grid gap-3 md:grid-cols-2">
            <input className="field" name="name" value={garageForm.name} onChange={update(setGarageForm)} placeholder="Garage name" required />
            <input className="field" name="contactPerson" value={garageForm.contactPerson} onChange={update(setGarageForm)} placeholder="Contact person" />
            <input className="field" name="phone" value={garageForm.phone} onChange={update(setGarageForm)} placeholder="Phone" />
            <input className="field" name="city" value={garageForm.city} onChange={update(setGarageForm)} placeholder="City" />
            <button className="btn-primary" type="submit"><Plus size={16} />Add garage</button>
          </form>
          <div className="mt-4 space-y-2">
            {garages.slice(0, 5).map((garage) => (
              <div key={garage._id} className="flex justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                <span className="font-semibold text-ink">{garage.name}</span>
                <span className="text-slate-500">{garage.city || garage.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2"><TimerReset size={19} className="text-coral" /><h3 className="font-bold text-ink">EMI Payment Plans</h3></div>
          <form onSubmit={submitPlan} className="grid gap-3 md:grid-cols-2">
            <select className="field md:col-span-2" name="policy" value={planForm.policy} onChange={update(setPlanForm)} required>
              <option value="">Select policy</option>
              {policies.map((policy) => <option key={policy._id} value={policy._id}>{policy.policyNumber} - {policy.customer?.fullName}</option>)}
            </select>
            <select className="field" name="frequency" value={planForm.frequency} onChange={update(setPlanForm)}>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
            <input className="field" name="installmentCount" type="number" min="1" value={planForm.installmentCount} onChange={update(setPlanForm)} placeholder="Installments" />
            <input className="field" name="totalAmount" type="number" min="0" value={planForm.totalAmount} onChange={update(setPlanForm)} placeholder="Total amount" />
            <input className="field" name="startDate" type="date" value={planForm.startDate} onChange={update(setPlanForm)} />
            <button className="btn-primary" type="submit"><Plus size={16} />Create plan</button>
          </form>
          <div className="mt-4 space-y-2">
            {plans.slice(0, 4).map((plan) => {
              const due = plan.installments?.find((item) => item.status !== "paid");
              return (
                <div key={plan._id} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                  <div className="flex justify-between"><span className="font-semibold text-ink">{plan.policy?.policyNumber}</span><span>{formatCurrency(plan.totalAmount)}</span></div>
                  {due ? <button className="btn-secondary mt-2" type="button" onClick={() => payInstallment(plan, due)}><CheckCircle2 size={16} />Pay {formatCurrency(due.amount)}</button> : <p className="mt-1 text-emerald-700">Completed</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-2"><Star size={19} className="text-mint" /><h3 className="font-bold text-ink">Customer Feedback</h3></div>
          <form onSubmit={submitFeedback} className="grid gap-3 md:grid-cols-2">
            <select className="field" name="customer" value={feedbackForm.customer} onChange={update(setFeedbackForm)}>
              <option value="">Customer</option>
              {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.fullName}</option>)}
            </select>
            <select className="field" name="category" value={feedbackForm.category} onChange={update(setFeedbackForm)}>
              {["overall", "claim", "policy", "payment", "support"].map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input className="field" name="rating" type="number" min="1" max="5" value={feedbackForm.rating} onChange={update(setFeedbackForm)} />
            <input className="field" name="comment" value={feedbackForm.comment} onChange={update(setFeedbackForm)} placeholder="Comment" />
            <button className="btn-primary" type="submit"><Plus size={16} />Save feedback</button>
          </form>
          <div className="mt-4 grid gap-2">
            {feedback.slice(0, 4).map((item) => <p key={item._id} className="rounded-md bg-white px-3 py-2 text-sm">{item.rating}/5 - {item.comment || item.category}</p>)}
          </div>
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><MessageSquare size={19} className="text-brand" /><h3 className="font-bold text-ink">Live Chat</h3></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Auto refresh</span>
          </div>
          <form onSubmit={submitThread} className="grid gap-3 md:grid-cols-2">
            <input className="field" name="subject" value={threadForm.subject} onChange={update(setThreadForm)} placeholder="Subject" required />
            <select className="field" name="customer" value={threadForm.customer} onChange={update(setThreadForm)}>
              <option value="">Customer</option>
              {customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.fullName}</option>)}
            </select>
            <select className="field" name="assignedTo" value={threadForm.assignedTo} onChange={update(setThreadForm)}>
              <option value="">Assign to</option>
              {[...team.managers, ...team.agents].map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}
            </select>
            <input className="field" name="message" value={threadForm.message} onChange={update(setThreadForm)} placeholder="Message" />
            <button className="btn-primary" type="submit"><Plus size={16} />Start thread</button>
          </form>

          <div className="mt-5 grid min-h-[360px] gap-4 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="space-y-2 overflow-y-auto rounded-md border border-slate-200 bg-white p-2">
              {threads.map((thread) => (
                <button
                  key={thread._id}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition ${activeThread?._id === thread._id ? "bg-purple-50 text-purple-800" : "hover:bg-slate-50"}`}
                  type="button"
                  onClick={() => setActiveThreadId(thread._id)}
                >
                  <span className="block font-semibold">{thread.subject}</span>
                  <span className="block truncate text-xs text-slate-500">{thread.customer?.fullName || "Internal"} - {thread.messages?.at(-1)?.body || "No messages"}</span>
                </button>
              ))}
              {!threads.length ? <p className="px-3 py-8 text-center text-sm text-slate-500">Start a thread to chat.</p> : null}
            </div>

            <div className="flex min-h-[360px] flex-col rounded-md border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <p className="font-semibold text-ink">{activeThread?.subject || "No active chat"}</p>
                <p className="text-xs text-slate-500">{activeThread?.assignedTo?.name || "Unassigned"} {activeThread?.customer?.fullName ? `with ${activeThread.customer.fullName}` : ""}</p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {(activeThread?.messages || []).map((message) => (
                  <div key={`${message.createdAt}-${message.body}`} className={`flex ${message.senderType === "customer" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[78%] rounded-lg px-3 py-2 text-sm ${message.senderType === "customer" ? "bg-slate-100 text-slate-700" : "bg-purple-600 text-white"}`}>
                      <p className="text-xs opacity-70">{message.senderName || message.senderType}</p>
                      <p>{message.body}</p>
                    </div>
                  </div>
                ))}
                {activeThread && !activeThread.messages?.length ? <p className="text-sm text-slate-500">No messages yet.</p> : null}
              </div>
              <form className="flex gap-2 border-t border-slate-200 p-3" onSubmit={sendChatMessage}>
                <input className="field" value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="Type a message" disabled={!activeThread} />
                <button className="btn-primary" type="submit" disabled={!activeThread || !chatText.trim()}>
                  <Send size={16} />
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <h3 className="font-bold text-ink">Audit Timeline</h3>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <select className="field" value={timelineId} onChange={(event) => setTimelineId(event.target.value)}>
            <option value="">Select policy or claim</option>
            {policies.map((policy) => <option key={policy._id} value={policy._id}>Policy {policy.policyNumber}</option>)}
            {claims.map((claim) => <option key={claim._id} value={claim._id}>Claim {claim.claimNumber}</option>)}
          </select>
          <button className="btn-secondary" type="button" onClick={loadTimeline}>Load timeline</button>
        </div>
        <div className="mt-4 space-y-2">
          {timeline.map((log) => <p key={log._id} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">{log.createdAt?.slice(0, 10)} - {log.message}</p>)}
          {timelineId && !timeline.length ? <p className="text-sm text-slate-500">No timeline entries found.</p> : null}
        </div>
      </section>
    </div>
  );
};

export default ServiceHub;
