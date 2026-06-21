import { Bell, LogOut, Menu, Search, UserCircle, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

const searchTargets = [
  { keywords: ["dashboard", "home", "analytics"], path: "/app" },
  { keywords: ["customer", "customers"], path: "/app/customers" },
  { keywords: ["vehicle", "vehicles", "car", "bike"], path: "/app/vehicles" },
  { keywords: ["policy", "policies"], path: "/app/policies" },
  { keywords: ["claim", "claims"], path: "/app/claims" },
  { keywords: ["payment", "payments", "invoice"], path: "/app/payments" },
  { keywords: ["fraud", "ai", "risk", "intelligence"], path: "/app/intelligence" },
  { keywords: ["ticket", "tickets", "support"], path: "/app/tickets" },
  { keywords: ["report", "reports", "pdf"], path: "/app/reports" },
  { keywords: ["audit", "activity", "logs"], path: "/app/activities" },
  { keywords: ["security", "alerts", "score"], path: "/app/security" },
  { keywords: ["rbac", "roles", "permissions"], path: "/app/rbac-report" },
  { keywords: ["backup", "backups", "restore"], path: "/app/backups" },
  { keywords: ["profile", "account"], path: "/app/profile" },
  { keywords: ["notification", "notifications"], path: "/app/notifications" },
  { keywords: ["portal", "customer login"], path: "/customer-login" }
];

const Navbar = ({ onLogout, onMenuClick }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim().toLowerCase();
    if (!value) return;

    const target = searchTargets.find((item) =>
      item.keywords.some((keyword) => keyword.includes(value) || value.includes(keyword))
    );

    if (target) {
      navigate(target.path);
      setQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white/92 px-3 py-3 shadow-sm backdrop-blur-xl sm:px-4 md:flex-nowrap lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:flex-none">
        <button
          className="btn-secondary h-10 w-10 shrink-0 px-0 lg:hidden"
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0 max-w-[170px] sm:block sm:max-w-[220px] xl:max-w-none">
          <p className="hidden truncate text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:block">
            DriveSure Insurance Suite
          </p>
          <h1 className="truncate text-base font-black text-slate-900 sm:text-lg">Operations Console</h1>
        </div>
      </div>

      <form
        className="relative z-30 order-3 flex min-w-0 flex-1 basis-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 md:order-none md:basis-auto lg:max-w-[420px] lg:gap-3 lg:px-4"
        onSubmit={submitSearch}
      >
        <Search size={18} className="shrink-0" />
        <input
          className="relative z-40 w-full min-w-0 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pages"
          aria-label="Search pages"
        />
      </form>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
        <ThemeToggle
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        />
        <Link
          to="/customer-login"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-purple-200 shadow-sm transition hover:border-purple-300/40 hover:bg-purple-400/10 hover:text-white sm:flex"
          aria-label="Open customer portal login"
          title="Customer Portal"
        >
          <UserRound size={18} className="text-purple-200" />
        </Link>
        <Link
          to="/app/notifications"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-purple-200 shadow-sm transition hover:border-purple-300/40 hover:bg-purple-400/10 hover:text-white"
          aria-label="Open notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />
        </Link>
        <Link
          to="/app/profile"
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-purple-200 shadow-sm transition hover:border-purple-300/40 hover:bg-purple-400/10 hover:text-white md:flex"
          aria-label="Open profile"
          title="Profile"
        >
          <UserCircle size={18} className="text-purple-200" />
        </Link>
        <button onClick={onLogout} className="btn-secondary h-10 shrink-0 px-3 max-[420px]:w-10 max-[420px]:px-0" type="button">
          <LogOut size={16} />
          <span className="hidden sm:inline max-[420px]:hidden">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
