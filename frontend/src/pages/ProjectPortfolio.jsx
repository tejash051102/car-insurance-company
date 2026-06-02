import {
  Activity,
  BarChart3,
  Bot,
  Car,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileText,
  LockKeyhole,
  MessageSquare,
  Moon,
  ShieldCheck,
  Smartphone,
  UploadCloud,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";

const modules = [
  { title: "Customer Registry", detail: "Customer profiles, OTP verification, document uploads, and secure customer portal access.", art: "/module-art/customers.svg", icon: Users },
  { title: "Vehicle & Policy Management", detail: "Vehicle records, policy creation, add-ons, premium calculator, quotation PDF, renewals, and cancellation refunds.", art: "/module-art/policies.svg", icon: ShieldCheck },
  { title: "Claims Workflow", detail: "Claim registration, evidence uploads, approval stages, fraud score refresh, inspection scheduling, and repair tracking.", art: "/module-art/claims.svg", icon: ClipboardCheck },
  { title: "Payments & EMI Plans", detail: "Premium payments, receipts, invoice PDFs, payment status tracking, and installment payment plans.", art: "/module-art/payments.svg", icon: BarChart3 },
  { title: "Service Hub", detail: "Garage partners, customer feedback, internal messaging, live chat-style threads, and audit timelines.", art: "/module-art/portal.svg", icon: MessageSquare },
  { title: "Security Center", detail: "JWT access control, RBAC reporting, activity logs, failed-login monitoring, and security alerts.", art: "/module-art/security.svg", icon: LockKeyhole }
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

const PortfolioMetric = ({ value, label }) => (
  <div className="rounded-md border border-white/10 bg-white/[0.055] px-5 py-4">
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/45">{label}</p>
  </div>
);

const ProjectPortfolio = () => {
  return (
    <div className="min-h-screen bg-[#0c0521] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(124,58,237,0.22),transparent_44%),linear-gradient(315deg,rgba(14,165,233,0.13),transparent_36%),#0b031d]" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <ShieldCheck size={16} />
            </span>
            <div>
              <p className="text-sm font-black tracking-normal text-white">DriveSure</p>
              <p className="text-xs font-semibold text-white/42">Insurance Operations Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a className="btn-secondary hidden sm:inline-flex" href="#modules">Modules</a>
            <Link className="btn-primary" to="/login">Login</Link>
          </div>
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl gap-10 px-5 pb-12 pt-8 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pb-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-purple-300/20 bg-purple-300/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-purple-100">
              Enterprise Insurance Suite
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-5xl xl:text-7xl">
              DriveSure
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 md:text-lg">
              A full-stack car insurance operations platform for managing customers, vehicles, policies, claims, payments, service requests, security, reports, and analytics from one secure dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/login">
                Open Project
              </Link>
              <a className="btn-secondary" href="#modules">
                View Modules
              </a>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-3">
              <PortfolioMetric value="20+" label="Core features" />
              <PortfolioMetric value="5" label="User roles" />
              <PortfolioMetric value="MERN" label="Tech stack" />
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
            <div className="rounded-lg border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/30 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200/70">Operations</p>
                  <h2 className="mt-1 text-2xl font-bold">AI Dashboard</h2>
                </div>
                <BarChart3 className="text-cyan-200" />
              </div>
              <div className="mt-5 h-56 rounded-md border border-white/10 bg-[#1c1241] p-4">
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
            <div className="ml-auto w-full max-w-xl rounded-lg border border-white/10 bg-[#2b2148]/95 p-5 shadow-2xl shadow-black/35 backdrop-blur">
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

      <main className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="label">Project Objective</p>
            <h2 className="mt-2 text-3xl font-black text-white">A practical insurance workflow from quotation to claim settlement</h2>
          </div>
          <p className="text-base leading-8 text-white/58">
            The system replaces manual insurance records with a secure digital platform. Staff can manage customers, policies, claims, payments, service operations, and reports, while customers can access their own portal for policy details, claim updates, receipts, and support.
          </p>
        </section>

        <section id="modules" className="mt-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="label">Modules</p>
              <h2 className="mt-2 text-3xl font-black text-white">Feature Portfolio</h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <article key={module.title} className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-xl backdrop-blur transition hover:border-purple-300/35">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-purple-500/16 text-purple-100">
                      <Icon size={21} />
                    </span>
                    <img src={module.art} alt={module.title} className="h-16 w-20 object-contain opacity-80" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{module.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/52">{module.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12 rounded-lg border border-white/10 bg-white/[0.045] p-6">
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
                <article key={feature.title} className="rounded-md border border-white/10 bg-white/[0.04] p-4">
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
          <article className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
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

          <article className="rounded-lg border border-white/10 bg-white/[0.045] p-6">
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

        <section className="mt-12 rounded-lg border border-white/10 bg-white/[0.045] p-6">
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
      </main>
    </div>
  );
};

export default ProjectPortfolio;
