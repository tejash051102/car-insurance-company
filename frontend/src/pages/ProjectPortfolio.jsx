import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Car,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileText,
  Gauge,
  LockKeyhole,
  MessageSquare,
  Moon,
  ShieldCheck,
  Sparkles,
  Smartphone,
  UploadCloud,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

const modules = [
  {
    title: "Customer Registry",
    detail: "Customer profiles, OTP verification, document uploads, and secure customer portal access.",
    outcome: "Complete customer lifecycle",
    art: "/module-art/customers.svg",
    icon: Users
  },
  {
    title: "Vehicle & Policy Management",
    detail: "Vehicle records, policy creation, add-ons, premium calculator, quotation PDF, renewals, and cancellation refunds.",
    outcome: "From quotation to renewal",
    art: "/module-art/policies.svg",
    icon: ShieldCheck
  },
  {
    title: "Claims Workflow",
    detail: "Claim registration, evidence uploads, approval stages, fraud score refresh, inspection scheduling, and repair tracking.",
    outcome: "Traceable claim handling",
    art: "/module-art/claims.svg",
    icon: ClipboardCheck
  },
  {
    title: "Payments & EMI Plans",
    detail: "Premium payments, receipts, invoice PDFs, payment status tracking, and installment payment plans.",
    outcome: "Receipts and installments",
    art: "/module-art/payments.svg",
    icon: BarChart3
  },
  {
    title: "Service Hub",
    detail: "Garage partners, customer feedback, internal messaging, live chat-style threads, and audit timelines.",
    outcome: "After-sales operations",
    art: "/module-art/portal.svg",
    icon: MessageSquare
  },
  {
    title: "Security Center",
    detail: "JWT access control, RBAC reporting, activity logs, failed-login monitoring, and security alerts.",
    outcome: "Protected operations",
    art: "/module-art/security.svg",
    icon: LockKeyhole
  }
];

const techStack = [
  "React",
  "Vite",
  "Tailwind CSS",
  "Node.js",
  "Express.js",
  "MongoDB",
  "Mongoose",
  "JWT",
  "Multer",
  "PDFKit"
];

const highlights = [
  "Full-stack MERN insurance management system",
  "Role-based access for admin, manager, agent, surveyor, and customer flows",
  "Customer portal with policy, claim, payment, and support visibility",
  "PDF generation for policy certificates, quotations, reports, and invoices",
  "Operational dashboards with live monthly revenue and claim analytics",
  "Security-aware features including encrypted fields, alerts, audit logs, and OTP flows"
];

const workflow = [
  "Customer and vehicle are registered",
  "Premium is calculated and quotation is generated",
  "Policy is approved, paid, renewed, or cancelled",
  "Claim is submitted with documents",
  "Fraud risk, inspection, garage repair, and approval are tracked",
  "Reports, receipts, notifications, and audit trail complete the cycle"
];

const portfolioStats = [
  ["20+", "Business modules", "Policy, claim, service, security, reports"],
  ["5", "Role flows", "Admin, manager, agent, surveyor, customer"],
  ["7", "UI features", "Themes, charts, upload, timeline, assistant"],
  ["MERN", "Full stack", "React, Node, Express, MongoDB"]
];

const proofCards = [
  ["Real Workflow", "Quotation, premium, policy issue, claim settlement, receipt, renewal."],
  ["Project Depth", "RBAC, audit logs, fraud score, surveyor, garage, EMI, feedback."],
  ["Viva Friendly", "Clear modules, practical screens, explainable architecture, PDF outputs."]
];

const uiFeatures = [
  {
    title: "Dark Mode",
    detail: "Dark and light themes are supported through the project theme toggle with saved browser preference.",
    icon: Moon
  },
  {
    title: "Animated Charts",
    detail: "Dashboard charts visualize monthly revenue, claim amount, policy status, customer growth, and operational trends.",
    icon: BarChart3
  },
  {
    title: "Claim Tracking Timeline",
    detail: "Each claim shows a timeline from submitted to review, survey, approval, and payment.",
    icon: ClipboardCheck
  },
  {
    title: "Drag and Drop Uploads",
    detail: "Claim evidence supports drag and drop uploads for documents, accident photos, repair bills, and FIR reports.",
    icon: UploadCloud
  },
  {
    title: "Premium Calculator",
    detail: "Policy pricing can be estimated from vehicle type, value, age, claim history, and coverage type.",
    icon: Car
  },
  {
    title: "Mobile Responsive Design",
    detail: "The app uses responsive grids, compact controls, and a collapsible sidebar for mobile, tablet, and desktop.",
    icon: Smartphone
  },
  {
    title: "AI Chat Assistant",
    detail: "A floating assistant helps users understand project modules like policies, claims, payments, security, and portfolio flow.",
    icon: Bot
  }
];

const projectModules = [
  ["Authentication", "Login, registration, JWT access, email verification, password reset, and profile security."],
  ["Customer Management", "Customer records, contact verification, document upload, and customer status tracking."],
  ["Vehicle Management", "Vehicle registration, model, year, type, fuel, value, and customer linkage."],
  ["Policy Management", "Policy creation, approval, add-ons, renewals, cancellation, refund, and certificate PDF."],
  ["Premium Calculator", "Estimate premium using vehicle type, value, age, claim history, and coverage type."],
  ["Quotation Module", "Generate customer-ready quotation PDFs before policy creation."],
  ["Claims Management", "Claim registration, status workflow, evidence uploads, approval, rejection, and settlement."],
  ["Claim Timeline", "Visual tracking from submitted to review, survey, approval, payment, and settlement."],
  ["Fraud Analysis", "Claim risk score, repeated claim detection, high amount checks, and missing document signals."],
  ["Surveyor Inspection", "Schedule inspection, assign surveyor, store result, and maintain inspection report."],
  ["Garage Partners", "Approved garages, repair estimate, repair status, and claim repair notes."],
  ["Payments", "Payment records, transaction status, method tracking, invoice PDF, and receipt issue history."],
  ["EMI Plans", "Monthly or quarterly installment plans with due dates and paid status tracking."],
  ["Dashboard Analytics", "Revenue trends, claim amounts, policy counts, customer growth, and operational cards."],
  ["Reports", "Policy, claim, payment, security, CSV export, and PDF report generation."],
  ["Notifications", "Policy expiry, payment status, claim update, and security alert notifications."],
  ["Customer Portal", "Customer login, policy view, claim status, receipts, profile updates, and support tickets."],
  ["Support Tickets", "Ticket category, priority, status, staff response, and customer portal requests."],
  ["Service Hub", "Garage management, EMI plans, feedback, internal messages, live chat-style threads, and timeline lookup."],
  ["Security Center", "RBAC report, audit logs, login monitoring, encrypted fields, and security alerts."]
];

const PortfolioMetric = ({ value, label, detail }) => (
  <div className="portfolio-glass group rounded-2xl border border-white/10 bg-white/[0.065] px-5 py-4 shadow-xl shadow-black/10 backdrop-blur transition hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.09]">
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100/70">{label}</p>
    {detail ? <p className="mt-2 text-xs leading-5 text-white/42">{detail}</p> : null}
  </div>
);

const ProjectPortfolio = () => {
  const scrollToModules = () => {
    document.getElementById("modules")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="portfolio-page min-h-screen bg-[#070315] text-white">
      <section className="portfolio-hero relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_86%_12%,rgba(168,85,247,0.24),transparent_32%),linear-gradient(135deg,#070315_0%,#11062d_48%,#071421_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:58px_58px] opacity-40" />
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="portfolio-nav relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/25 bg-cyan-300/10 shadow-lg shadow-cyan-950/30">
              <img src="/favicon.svg" alt="DriveSure" className="h-10 w-10 object-contain" />
            </span>
            <div>
              <p className="text-base font-black tracking-tight text-white">DriveSure</p>
              <p className="text-xs font-semibold text-cyan-100/52">Insurance Operations Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary hidden sm:inline-flex" type="button" onClick={scrollToModules}>Modules</button>
            <Link className="btn-primary" to="/login">Login</Link>
          </div>
        </div>

        <div className="portfolio-hero-grid relative mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl gap-10 px-5 pb-14 pt-8 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pb-20">
          <div className="portfolio-hero-copy max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
              <Sparkles size={14} />
              Full Stack Insurance Suite
            </div>
            <h1 className="portfolio-title max-w-4xl text-5xl font-black leading-[0.96] tracking-tight text-white sm:text-6xl xl:text-8xl">
              DriveSure<span className="block bg-gradient-to-r from-cyan-200 via-white to-purple-200 bg-clip-text text-transparent">Insurance OS</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 md:text-lg">
              A full-stack car insurance operations platform for managing customers, vehicles, policies, claims, payments, service requests, security, reports, and analytics from one secure dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary rounded-full px-5" to="/login">
                Open Project
                <ArrowRight size={17} />
              </Link>
              <button className="btn-secondary rounded-full px-5" type="button" onClick={scrollToModules}>
                View Modules
              </button>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {portfolioStats.map(([value, label, detail]) => (
                <PortfolioMetric key={label} value={value} label={label} detail={detail} />
              ))}
            </div>
          </div>

          <div className="portfolio-mockup mx-auto flex w-full max-w-2xl flex-col gap-5">
            <div className="portfolio-glass relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/35 backdrop-blur-xl">
              <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200/70">Operations</p>
                  <h2 className="mt-1 text-2xl font-bold">AI Dashboard</h2>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                  <Gauge size={22} />
                </span>
              </div>
              <div className="relative mt-5 h-60 overflow-hidden rounded-xl border border-white/10 bg-[#120a2c] p-4">
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-cyan-400/10 to-transparent" />
                <svg className="h-full w-full" viewBox="0 0 420 180" preserveAspectRatio="none">
                  {[0, 1, 2, 3].map((line) => (
                    <line key={line} x1="10" x2="410" y1={26 + line * 38} y2={26 + line * 38} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" />
                  ))}
                  <polyline points="12,138 70,80 128,62 188,96 248,84 310,44 408,76" fill="none" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round" />
                  <polyline points="12,148 70,70 128,126 188,90 248,38 310,62 408,36" fill="none" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <PortfolioMetric value="Live" label="Revenue" />
                <PortfolioMetric value="AI" label="Risk Score" />
                <PortfolioMetric value="PDF" label="Reports" />
              </div>
            </div>
            <div className="portfolio-glass ml-auto w-full max-w-xl rounded-3xl border border-white/10 bg-[#211b3f]/95 p-5 shadow-2xl shadow-black/35 backdrop-blur-xl">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-16 w-20 items-center justify-center rounded-md bg-amber-400/15">
                  <img src="/module-art/claims.svg" alt="Claims module" className="h-14 w-16 object-contain" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-200/70">Claim Engine</p>
                  <h3 className="text-xl font-bold leading-snug">Fraud score, inspection, repair, approval</h3>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm font-semibold text-white/72">
                <span className="rounded-md bg-white/[0.07] px-4 py-3">Evidence upload</span>
                <span className="rounded-md bg-white/[0.07] px-4 py-3">Garage repair</span>
                <span className="rounded-md bg-white/[0.07] px-4 py-3">Survey report</span>
                <span className="rounded-md bg-white/[0.07] px-4 py-3">Paid status</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-14 md:px-8">
        <section className="portfolio-glass grid gap-6 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/20 backdrop-blur lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
          <div>
            <p className="label">Project Objective</p>
            <h2 className="mt-2 text-3xl font-black text-white">A practical insurance workflow from quotation to claim settlement</h2>
          </div>
          <p className="text-base leading-8 text-white/58">
            The system replaces manual insurance records with a secure digital platform. Staff can manage customers, policies, claims, payments, service operations, and reports, while customers can access their own portal for policy details, claim updates, receipts, and support.
          </p>
        </section>

        <section id="modules" className="portfolio-glass mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl md:p-7">
          <div className="mb-7 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="label">Modules</p>
              <h2 className="mt-2 text-3xl font-black text-white md:text-4xl">DriveSure Feature Portfolio</h2>
            </div>
            <p className="max-w-3xl text-sm leading-7 text-white/56 md:text-base">
              The system is organized into operational modules that mirror a real car insurance company: customer onboarding, policy lifecycle, claims, payments, service support, and security governance.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <article key={module.title} className="portfolio-module-card group relative overflow-hidden rounded-2xl border border-white/10 bg-[#120b2b]/86 p-5 shadow-xl shadow-black/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-[#181039]">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-300/8 blur-2xl transition group-hover:bg-purple-300/10" />
                  <div className="absolute right-4 top-4 opacity-12 transition group-hover:scale-110 group-hover:opacity-25">
                    <img src={module.art} alt="" className="h-28 w-32 object-contain" />
                  </div>
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/16 to-purple-500/18 text-cyan-100 ring-1 ring-white/10">
                        <Icon size={22} />
                      </span>
                      <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-cyan-100">
                        {module.outcome}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-white">{module.title}</h3>
                    <p className="mt-3 min-h-24 text-sm leading-6 text-white/54">{module.detail}</p>
                    <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-300 to-purple-400 transition-all group-hover:w-full" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="portfolio-glass mt-7 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.055] p-5 lg:grid-cols-4">
            {[
              ["Users", "Admin, manager, agent, surveyor, customer"],
              ["Documents", "Policies, invoices, reports, evidence"],
              ["Automation", "Renewal alerts, claim risk, receipts"],
              ["Analytics", "Revenue, claims, policies, growth"]
            ].map(([title, detail]) => (
              <div key={title}>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="mt-1 text-sm leading-6 text-white/48">{detail}</p>
              </div>
            ))}
          </div>

          <div className="portfolio-glass mt-7 rounded-3xl border border-white/10 bg-[#0d071f]/78 p-5 shadow-xl shadow-black/20">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="label">Complete Module List</p>
                <h3 className="mt-2 text-2xl font-black text-white">20 DriveSure Modules</h3>
              </div>
              <p className="max-w-xl text-sm leading-6 text-white/48">
                This catalog maps the full project scope for demonstration, documentation, and viva explanation.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {projectModules.map(([title, detail], index) => (
                <article key={title} className="portfolio-small-card group rounded-xl border border-white/10 bg-white/[0.045] p-4 transition hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-white/[0.07]">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/16 text-sm font-black text-purple-100 transition group-hover:bg-cyan-400/16 group-hover:text-cyan-100">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h4 className="font-bold text-white">{title}</h4>
                  </div>
                  <p className="text-sm leading-6 text-white/50">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-glass mt-12 rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-2xl shadow-black/15 backdrop-blur">
          <div className="mb-6">
            <p className="label">UI/UX Features</p>
            <h2 className="mt-2 text-3xl font-black text-white">Modern Project Experience</h2>
            <p className="mt-3 max-w-3xl leading-7 text-white/56">
              These interface features make the insurance system easier to present, easier to use, and stronger for viva demonstration.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {uiFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="portfolio-small-card rounded-xl border border-white/10 bg-white/[0.04] p-4 transition hover:-translate-y-1 hover:border-purple-300/25 hover:bg-white/[0.065]">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cyan-400/12 text-cyan-100">
                      <Icon size={19} />
                    </span>
                    <div>
                      <h3 className="font-bold text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/52">{feature.detail}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12 grid gap-5 lg:grid-cols-2">
          <article className="portfolio-glass rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/15">
            <div className="flex items-center gap-3">
              <Activity className="text-cyan-200" />
              <h2 className="text-2xl font-black text-white">System Workflow</h2>
            </div>
            <div className="mt-6 space-y-3">
              {workflow.map((item, index) => (
                <div key={item} className="flex gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cyan-400/14 text-sm font-bold text-cyan-100">{index + 1}</span>
                  <p className="text-sm leading-6 text-white/62">{item}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="portfolio-glass rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-xl shadow-black/15">
            <div className="flex items-center gap-3">
              <Database className="text-emerald-200" />
              <h2 className="text-2xl font-black text-white">Technical Stack</h2>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {techStack.map((item) => (
                <span key={item} className="rounded-md border border-white/10 bg-white/[0.055] px-3 py-2 text-sm font-semibold text-white/68">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-3">
              {highlights.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-white/62">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-200" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="portfolio-glass mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(168,85,247,0.08)_46%,rgba(255,255,255,0.035))] p-6 shadow-2xl shadow-black/20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="label">Viva Ready</p>
              <h2 className="mt-2 text-3xl font-black text-white">Why this project stands out</h2>
              <p className="mt-4 leading-8 text-white/58">
                It demonstrates CRUD operations, authentication, role-based access, document handling, reporting, PDF generation, analytics, payment workflows, and realistic insurance domain logic.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                <Bot className="text-purple-200" />
                <h3 className="mt-3 font-bold text-white">Intelligence Layer</h3>
                <p className="mt-2 text-sm leading-6 text-white/52">Fraud signals, claim risk score, policy recommendations, and analytics modules.</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                <FileText className="text-cyan-200" />
                <h3 className="mt-3 font-bold text-white">Document Output</h3>
                <p className="mt-2 text-sm leading-6 text-white/52">Policy certificates, invoices, reports, quotations, CSV exports, and document reviews.</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                <LockKeyhole className="text-red-200" />
                <h3 className="mt-3 font-bold text-white">Security Focus</h3>
                <p className="mt-2 text-sm leading-6 text-white/52">JWT, RBAC, OTP verification, encrypted fields, rate limiting, audit logs, and alerts.</p>
              </div>
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                <Car className="text-emerald-200" />
                <h3 className="mt-3 font-bold text-white">Insurance Domain</h3>
                <p className="mt-2 text-sm leading-6 text-white/52">Premiums, policies, add-ons, claims, surveyors, garages, renewals, refunds, and EMI plans.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="portfolio-glass mt-12 rounded-3xl border border-white/10 bg-[#0d071f] p-6 shadow-2xl shadow-black/20 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="label">Presentation Highlights</p>
              <h2 className="mt-2 text-3xl font-black text-white">Built to look complete, practical, and demonstrable</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {proofCards.map(([title, detail]) => (
                <article key={title} className="portfolio-small-card rounded-xl border border-white/10 bg-white/[0.045] p-5">
                  <CheckCircle2 className="text-emerald-200" />
                  <h3 className="mt-4 font-black text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/52">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectPortfolio;
