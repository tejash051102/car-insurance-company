import {
  BadgeIndianRupee,
  ClipboardCheck,
  Gauge,
  History,
  LockKeyhole,
  FileCheck2,
  ShieldCheck,
  Users,
  UserRound,
  Car,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { canManageRecords } from "../utils/auth.js";

const items = [
  { label: "AI Dashboard", to: "/", icon: Gauge },
  { label: "Customers", to: "/customers", icon: Users },
  { label: "Portal Login", to: "/customer-login", icon: UserRound },
  { label: "Vehicles", to: "/vehicles", icon: Car },
  { label: "Policies", to: "/policies", icon: ShieldCheck },
  { label: "Claims", to: "/claims", icon: ClipboardCheck },
  { label: "Payments", to: "/payments", icon: BadgeIndianRupee },
  { label: "Audit Logs", to: "/activities", icon: History, managerOnly: true },
  { label: "Security", to: "/security", icon: LockKeyhole, managerOnly: true },
  { label: "RBAC Report", to: "/rbac-report", icon: FileCheck2, managerOnly: true },
];

const SidebarContent = ({ onClose, isExpanded, onToggleExpand }) => (
  <div className="flex h-full flex-col">
    {/* Header */}
    <div
      className={`flex h-16 shrink-0 items-center border-b border-white/10 transition-all duration-300 ${
        isExpanded ? "justify-between px-4" : "justify-center px-2"
      }`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-purple-500/25 text-white shadow-inner shadow-white/5 ring-1 ring-purple-300/25">
          <img src="/favicon.svg" alt="Insurance Management System" className="h-8 w-8 object-contain" />
        </div>
        {isExpanded && (
          <div className="min-w-0 overflow-hidden">
            <p className="truncate text-lg font-black tracking-tight text-white">AutoSure</p>
            <p className="truncate text-[11px] font-medium text-purple-200/70">Insurance Command</p>
          </div>
        )}
      </div>

      {isExpanded && (
        <button
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-purple-200 transition hover:bg-white/10 hover:text-white lg:hidden"
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <X size={16} />
        </button>
      )}
    </div>

    {/* Nav */}
    <nav className={`flex-1 space-y-0.5 overflow-y-auto py-4 ${isExpanded ? "px-3" : "px-2"}`}>
      {items
        .filter((item) => !item.managerOnly || canManageRecords())
        .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            title={!isExpanded ? item.label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg transition-all duration-150 ${
                isExpanded ? "px-3 py-2.5" : "justify-center px-0 py-2.5"
              } ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-md shadow-purple-950/30 ring-1 ring-purple-300/20"
                  : "text-white/45 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active left bar */}
                {!isExpanded && isActive && (
                  <span className="absolute left-0 h-5 w-0.5 rounded-r bg-purple-300" />
                )}

                <item.icon
                  size={18}
                  className={`shrink-0 transition-transform duration-150 ${
                    isActive ? "" : "group-hover:scale-110"
                  }`}
                />

                {isExpanded && (
                  <span className="truncate text-sm font-semibold">{item.label}</span>
                )}

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                    {item.label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
    </nav>

    {isExpanded && (
      <div className="mx-3 mb-3 rounded-lg border border-purple-300/15 bg-gradient-to-br from-purple-700 to-violet-800 p-4 shadow-lg shadow-purple-950/30">
        <div className="flex items-center gap-2 text-base font-bold text-white">
          <ShieldCheck size={15} />
          Go Pro
        </div>
        <p className="mt-3 text-sm leading-6 text-white/70">Stay connected with your insurance team</p>
        <button className="mt-4 w-full rounded-md border border-white/20 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10" type="button">
          Upgrade Now
        </button>
      </div>
    )}

    {/* Expand / Collapse Toggle (desktop only) */}
    <div className={`hidden border-t border-white/10 py-3 lg:flex ${isExpanded ? "px-3" : "justify-center px-2"}`}>
      <button
        type="button"
        onClick={onToggleExpand}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-purple-200/70 transition hover:bg-white/10 hover:text-white ${
          isExpanded ? "w-full" : "justify-center"
        }`}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? (
          <>
            <ChevronLeft size={16} />
            <span className="text-xs font-semibold">Collapse</span>
          </>
        ) : (
          <ChevronRight size={16} />
        )}
      </button>
    </div>
  </div>
);

const Sidebar = ({ isOpen, onClose, isExpanded, onToggleExpand }) => {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className={`app-sidebar fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 shadow-xl shadow-black/20 transition-all duration-300 ease-in-out lg:z-30 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isExpanded ? "w-64" : "w-[60px]"}`}
      >
        <SidebarContent
          onClose={onClose}
          isExpanded={isExpanded}
          onToggleExpand={onToggleExpand}
        />
      </aside>
    </>
  );
};

export default Sidebar;
