import { LogOut, Menu, Search, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = ({ onLogout, onMenuClick }) => {
  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/5 bg-[#211642]/90 px-4 shadow-lg shadow-black/20 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <button
          className="btn-secondary h-10 w-10 px-0 lg:hidden"
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={18} />
        </button>
        <div className="lg:hidden">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-200/80">AI Insurance OS</p>
          <h1 className="text-lg font-black text-white">Analytics Dashboard</h1>
        </div>
        <div className="hidden w-[min(44vw,420px)] items-center gap-3 rounded-md border border-white/8 bg-white/[0.035] px-4 py-3 text-sm text-white/30 lg:flex">
          <Search size={18} />
          <span>Search...</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/5 text-purple-200 shadow-sm transition hover:border-purple-300/40 hover:bg-purple-400/10 hover:text-white"
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
