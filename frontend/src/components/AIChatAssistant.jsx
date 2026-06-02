import { Bot, Send, X } from "lucide-react";
import { useMemo, useState } from "react";

const starterMessages = [
  {
    role: "assistant",
    text: "Hi, I can help with this insurance project. Ask about policies, claims, payments, renewals, fraud score, or where to find a module."
  }
];

const getAssistantReply = (message = "") => {
  const text = message.toLowerCase();

  if (text.includes("claim")) {
    return "Use Claims to register incidents, upload evidence, track the approval timeline, refresh fraud score, assign a surveyor, and manage garage repair status.";
  }

  if (text.includes("premium") || text.includes("calculator")) {
    return "Use Policies > Premium Calculator to estimate annual premium from vehicle type, value, age, claim history, and coverage type.";
  }

  if (text.includes("payment") || text.includes("emi") || text.includes("invoice")) {
    return "Use Payments for direct premium receipts and Service Hub for EMI payment plans with installment tracking.";
  }

  if (text.includes("policy") || text.includes("renew")) {
    return "Use Policies to create policy records, add covers, generate quotation PDFs, renew with no-claim bonus, or cancel with calculated refund.";
  }

  if (text.includes("security") || text.includes("role") || text.includes("rbac")) {
    return "Security Center and RBAC Report cover roles, access rules, audit logs, failed-login monitoring, and alerts.";
  }

  if (text.includes("portfolio")) {
    return "Open /portfolio to show the project objective, modules, workflow, tech stack, UI features, and viva-ready highlights.";
  }

  return "This project covers customer registry, vehicles, policies, claims, payments, reports, service operations, security, analytics, and a customer portal. Try asking about a specific module.";
};

const AIChatAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(starterMessages);
  const latestQuestion = useMemo(() => messages.filter((message) => message.role === "user").at(-1)?.text, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;

    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "assistant", text: getAssistantReply(question) }
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <section className="w-[min(360px,calc(100vw-40px))] overflow-hidden rounded-lg border border-white/10 bg-[#201449]/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-500/20 text-purple-100">
                <Bot size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-white">AI Project Assistant</p>
                <p className="text-xs text-white/42">{latestQuestion ? "Ready with project guidance" : "Insurance system helper"}</p>
              </div>
            </div>
            <button className="btn-secondary h-8 w-8 px-0" type="button" onClick={() => setOpen(false)} aria-label="Close AI assistant">
              <X size={15} />
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[82%] rounded-lg px-3 py-2 text-sm leading-6 ${message.role === "user" ? "bg-purple-600 text-white" : "bg-white/[0.08] text-white/70"}`}>
                  {message.text}
                </p>
              </div>
            ))}
          </div>

          <form className="flex gap-2 border-t border-white/10 p-3" onSubmit={sendMessage}>
            <input className="field" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about the project" />
            <button className="btn-primary px-3" type="submit" aria-label="Send message">
              <Send size={16} />
            </button>
          </form>
        </section>
      ) : (
        <button className="btn-primary h-14 rounded-full px-5 shadow-2xl shadow-purple-950/40" type="button" onClick={() => setOpen(true)}>
          <Bot size={19} />
          AI Help
        </button>
      )}
    </div>
  );
};

export default AIChatAssistant;
