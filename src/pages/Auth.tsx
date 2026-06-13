import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Sparkles, ArrowLeft, Check } from "lucide-react";
import logo3d from "@/assets/logo3d.png";

interface AuthProps {
  onLogin: (email: string, password: string) => boolean;
  onRegister: (name: string, email: string, password: string) => void;
}

export default function Auth({ onLogin, onRegister }: AuthProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(searchParams.get("mode") === "register");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    setIsRegister(searchParams.get("mode") === "register");
    setError("");
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 800));

    if (isRegister) {
      if (!form.name.trim()) { setError("Please enter your name"); setLoading(false); return; }
      if (!form.email.includes("@")) { setError("Enter a valid email address"); setLoading(false); return; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters"); setLoading(false); return; }
      onRegister(form.name, form.email, form.password);
      navigate("/dashboard");
    } else {
      if (!form.email || !form.password) { setError("Please fill in all fields"); setLoading(false); return; }
      const success = onLogin(form.email, form.password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Invalid credentials. Try demo: alex@example.com / any password");
      }
    }
    setLoading(false);
  };

  const demoLogin = () => {
    setForm({ name: "", email: "alex@example.com", password: "demo123" });
  };

  const features = ["Convert PDFs, recordings & notes", "AI-generated slides in 2 minutes", "Speaker notes & image sourcing", "Export to PowerPoint (PPTX)"];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-bg via-dark-surface to-dark-card flex-col justify-between p-12 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-azure-500/10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-violet-500/10 blur-3xl translate-x-1/3 translate-y-1/3" />

        <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors w-fit">
          <ArrowLeft size={16} />
          <span className="text-sm">Back to home</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <img src={logo3d} alt="Class2PPT" className="w-14 h-14 rounded-2xl" />
            <span className="font-display font-bold text-3xl text-white">Class2PPT</span>
          </div>
          <h2 className="font-display text-4xl font-extrabold text-white leading-tight">
            Your class content,<br /><span className="gradient-text">beautifully presented.</span>
          </h2>
          <p className="text-white/60 leading-relaxed">AI converts your lectures, notes, and recordings into stunning presentations in under 2 minutes.</p>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 rounded-full bg-gradient-brand flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-sm">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-white/30">Trusted by 50,000+ students and educators</div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src={logo3d} alt="Class2PPT" className="w-8 h-8 rounded-xl" />
            <span className="font-display font-bold text-xl gradient-text">Class2PPT</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-foreground mb-2">
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground">
              {isRegister ? "Start generating AI presentations for free" : "Sign in to your presentations dashboard"}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-surface-muted dark:bg-dark-muted rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${!isRegister ? "bg-white dark:bg-dark-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${isRegister ? "bg-white dark:bg-dark-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={isRegister ? "Min. 6 characters" : "Enter your password"}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-shake">
                <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRegister ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {isRegister ? "Create Free Account" : "Sign In"}
                </>
              )}
            </button>
          </form>

          {/* Demo Login */}
          {!isRegister && (
            <button
              onClick={demoLogin}
              className="mt-3 w-full py-3 rounded-xl border border-dashed border-brand-300 dark:border-brand-700 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
            >
              ✨ Try Demo Account (alex@example.com)
            </button>
          )}

          <p className="text-center text-xs text-muted-foreground mt-6">
            {isRegister ? (
              <>Already have an account? <button onClick={() => setIsRegister(false)} className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Sign In</button></>
            ) : (
              <>Don't have an account? <button onClick={() => setIsRegister(true)} className="text-brand-600 dark:text-brand-400 font-medium hover:underline">Register Free</button></>
            )}
          </p>
          <p className="text-center text-xs text-muted-foreground mt-2">
            By continuing, you agree to our <a href="#" className="hover:underline">Terms</a> and <a href="#" className="hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
