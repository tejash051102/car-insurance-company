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
    <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-3 border-b border-white/5 bg-[#211642]/90 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-xl sm:py-0 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          className="btn-secondary h-10 w-10 px-0 lg:hidden"
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div className="hidden shrink-0 md:block lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-200/80">AI Insurance OS</p>
          <h1 className="text-lg font-black text-white">Analytics Dashboard</h1>
        </div>
        <form
          className="relative z-30 flex min-w-0 flex-1 items-center gap-2 rounded-md border border-white/8 bg-white/[0.035] px-3 py-2.5 text-sm text-white/70 transition focus-within:border-purple-300/40 focus-within:bg-white/[0.055] sm:min-w-[220px] lg:w-[min(44vw,420px)] lg:flex-none lg:gap-3 lg:px-4 lg:py-3"
          onSubmit={submitSearch}
        >
          <Search size={18} className="shrink-0" />
          <input
            className="relative z-40 w-full min-w-0 bg-transparent text-sm font-medium text-white outline-none placeholder:text-white/30"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages"
            aria-label="Search pages"
          />
        </form>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-purple-200 shadow-sm transition hover:border-purple-300/40 hover:bg-purple-400/10 hover:text-white"
        />
        <Link
          to="/customer-login"
          className="hidden h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-purple-200 shadow-sm transition hover:border-purple-300/40 hover:bg-purple-400/10 hover:text-white sm:flex"
          aria-label="Open customer portal login"
          title="Customer Portal"
        >
          <UserRound size={18} className="text-purple-200" />
        </Link>
        <Link
          to="/app/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-purple-200 shadow-sm transition hover:border-purple-300/40 hover:bg-purple-400/10 hover:text-white"
          aria-label="Open notifications"
          title="Notifications"
        >
          <Bell size={18} className="text-purple-200" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.75)]" />
        </Link>
        <Link
          to="/app/profile"
          className="hidden h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-purple-200 shadow-sm transition hover:border-purple-300/40 hover:bg-purple-400/10 hover:text-white md:flex"
          aria-label="Open profile"
          title="Profile"
        >
          <UserCircle size={18} className="text-purple-200" />
        </Link>
        <button onClick={onLogout} className="btn-secondary" type="button">
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
