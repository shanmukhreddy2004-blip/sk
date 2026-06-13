import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, Sparkles, ChevronDown, LogOut, Settings, User, LayoutDashboard } from "lucide-react";
import logo3d from "@/assets/logo3d.png";
import type { User as UserType } from "@/types";

interface NavbarProps {
  user: UserType | null;
  isDark: boolean;
  onToggleDark: () => void;
  onLogout: () => void;
}

export default function Navbar({ user, isDark, onToggleDark, onLogout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = user
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "New Presentation", href: "/upload" },
        { label: "Templates", href: "/templates" },
      ]
    : [
        { label: "Features", href: "#features" },
        { label: "Templates", href: "#templates" },
        { label: "Pricing", href: "#pricing" },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-surface-border dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <img src={logo3d} alt="Class2PPT" className="w-9 h-9 rounded-xl object-cover" />
            <span className="font-display font-bold text-xl gradient-text">Class2PPT</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`nav-link font-medium ${
                  isActive(link.href)
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDark}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-muted dark:bg-dark-muted hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-muted dark:bg-dark-muted hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center text-white text-xs font-bold">
                      {user.name[0]}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl shadow-card-dark border border-surface-border dark:border-dark-border overflow-hidden animate-fade-in">
                    <div className="p-3 border-b border-surface-border dark:border-dark-border">
                      <p className="font-semibold text-sm text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <span className={`inline-flex mt-1 items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.plan === "pro" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" : "bg-surface-muted dark:bg-dark-muted text-muted-foreground"
                      }`}>
                        {user.plan === "pro" && <Sparkles size={10} />}
                        {user.plan.toUpperCase()} Plan
                      </span>
                    </div>
                    <div className="p-1">
                      <button onClick={() => { navigate("/dashboard"); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-surface-muted dark:hover:bg-dark-muted transition-colors">
                        <LayoutDashboard size={15} /> Dashboard
                      </button>
                      <button onClick={() => { navigate("/settings"); setProfileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-surface-muted dark:hover:bg-dark-muted transition-colors">
                        <Settings size={15} /> Settings
                      </button>
                      <button onClick={() => { onLogout(); setProfileOpen(false); navigate("/"); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/auth" className="btn-secondary text-sm py-2 px-4">Sign In</Link>
                <Link to="/auth?mode=register" className="btn-primary text-sm py-2 px-4">Get Started Free</Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-surface-muted dark:bg-dark-muted"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-card border-t border-surface-border dark:border-dark-border px-4 py-4 space-y-2 animate-slide-up">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-surface-muted dark:hover:bg-dark-muted"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <>
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="block px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-surface-muted dark:hover:bg-dark-muted">
                Sign In
              </Link>
              <Link to="/auth?mode=register" onClick={() => setMobileOpen(false)} className="btn-primary block text-center text-sm py-2">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
