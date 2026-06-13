import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Zap, FileText, Video, Mic, Globe, ChevronRight, Star, Check, Upload } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logo3d from "@/assets/logo3d.png";
import aiConvert from "@/assets/ai-convert.png";
import editorPreview from "@/assets/editor-preview.jpg";

export default function Landing() {
  const features = [
    {
      icon: FileText,
      title: "PDF & Notes",
      desc: "Upload lecture PDFs, handwritten notes, or study materials and get a polished deck instantly.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Video,
      title: "Video Recordings",
      desc: "Paste a YouTube link or upload a class recording — AI transcribes and converts to slides.",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: Mic,
      title: "Live Classes",
      desc: "Connect live class streams via URL and generate presentations in real-time as class happens.",
      color: "from-rose-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Web & Transcripts",
      desc: "Paste any article, transcript, or URL and let AI extract key concepts into structured slides.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Zap,
      title: "AI Slide Design",
      desc: "Auto-generates titles, bullet points, speaker notes, charts, and relevant images per slide.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Sparkles,
      title: "Smart Templates",
      desc: "Choose from academic, business, tech, and creative templates. Customize colors and fonts.",
      color: "from-indigo-500 to-brand-600",
    },
  ];

  const steps = [
    { step: "01", title: "Upload Your Content", desc: "Drop a PDF, paste a YouTube link, or connect a live class stream." },
    { step: "02", title: "AI Analyzes & Structures", desc: "Our AI reads, understands, and creates a logical slide outline." },
    { step: "03", title: "Customize & Edit", desc: "Adjust slides, swap images, edit text with our visual editor." },
    { step: "04", title: "Export & Share", desc: "Download your PPTX file or share a link directly." },
  ];

  const testimonials = [
    { name: "Maria K.", role: "Medical Student", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face", quote: "I saved 6 hours last week alone. Converted 3 lecture recordings into study presentations instantly!", rating: 5 },
    { name: "James T.", role: "CS Professor", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face", quote: "My students love it. I paste my lecture notes and have a full slide deck ready in 2 minutes.", rating: 5 },
    { name: "Priya S.", role: "MBA Candidate", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop&crop=face", quote: "The speaker notes are incredible — it's like having a research assistant who understands my material.", rating: 5 },
  ];

  const pricing = [
    { plan: "Free", price: "0", desc: "Get started with AI presentations", features: ["5 presentations/month", "3 templates", "Basic AI generation", "PPTX export", "10 AI credits/month"], cta: "Start Free", highlight: false },
    { plan: "Pro", price: "12", desc: "For students and educators", features: ["Unlimited presentations", "All 20+ templates", "Advanced AI + speaker notes", "Live class integration", "Image sourcing per slide", "100 AI credits/month", "Priority support"], cta: "Start Pro Trial", highlight: true },
    { plan: "Enterprise", price: "49", desc: "For institutions", features: ["Everything in Pro", "Team workspaces", "LMS integration", "Custom branding", "API access", "Unlimited credits", "Dedicated support"], cta: "Contact Sales", highlight: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 dark:opacity-30"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="absolute inset-0 bg-gradient-glow" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-azure-500/20 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/20 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <Sparkles size={14} className="text-brand-500" />
            <span className="text-sm font-medium text-brand-700 dark:text-brand-300">AI-Powered Presentation Generation</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.1] mb-6 animate-slide-up">
            Turn Any Class Into a
            <br />
            <span className="gradient-text">Professional Deck</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Upload recordings, PDFs, notes, or paste a URL — Class2PPT's AI generates complete slide presentations with images, charts, and speaker notes in under 2 minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
            <Link to="/auth?mode=register" className="btn-primary text-base py-4 px-8 flex items-center justify-center gap-2 shadow-glow-blue">
              Generate Free Presentation
              <ArrowRight size={18} />
            </Link>
            <Link to="/auth" className="btn-secondary text-base py-4 px-8 flex items-center justify-center gap-2">
              <Video size={18} />
              Watch Demo
            </Link>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground animate-fade-in">
            {[
              ["50K+", "Presentations Created"],
              ["2 min", "Avg. Generation Time"],
              ["4.9/5", "User Rating"],
              ["Free", "To Get Started"],
            ].map(([val, label]) => (
              <div key={label} className="flex flex-col items-center">
                <span className="font-display font-bold text-2xl text-foreground">{val}</span>
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>

          {/* Hero Editor Preview */}
          <div className="mt-16 relative max-w-4xl mx-auto animate-slide-up">
            <div className="glass-card rounded-3xl overflow-hidden shadow-brand-lg border border-brand-200/20 dark:border-brand-800/20">
              <img src={editorPreview} alt="Class2PPT Editor" className="w-full h-auto" />
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 sm:right-8 glass-card rounded-2xl px-4 py-2 shadow-brand border border-brand-200/30 dark:border-brand-800/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-foreground">AI Processing...</span>
            </div>
            <div className="absolute -bottom-4 -left-4 sm:left-8 glass-card rounded-2xl px-4 py-2 shadow-brand border border-brand-200/30 dark:border-brand-800/30">
              <span className="text-xs font-semibold text-foreground">✅ 7 slides ready in 90s</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-surface-subtle dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">Everything You Need to Convert Classes</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From any source format to any presentation style — Class2PPT handles it all with advanced AI.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card rounded-3xl p-6 hover:shadow-brand transition-all duration-300 group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">How Class2PPT Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Four simple steps to professional presentations — no design skills needed.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                <div className="glass-card rounded-3xl p-6 h-full">
                  <div className="font-display font-extrabold text-4xl gradient-text mb-4">{s.step}</div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground hidden lg:block" size={20} />
                )}
              </div>
            ))}
          </div>

          {/* AI Convert visual */}
          <div className="mt-16 flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1">
              <img src={aiConvert} alt="AI Content Conversion" className="w-full max-w-lg mx-auto rounded-3xl shadow-brand-lg" />
            </div>
            <div className="flex-1 space-y-4">
              <h3 className="font-display text-3xl font-bold text-foreground">Smart AI That Understands Your Content</h3>
              <p className="text-muted-foreground leading-relaxed">Class2PPT doesn't just convert text — it understands context, identifies key concepts, structures information logically, and adds relevant visuals to match your topic.</p>
              {["Extracts key topics and sub-topics automatically", "Writes concise, clear bullet points per slide", "Generates speaker notes for confident presenting", "Finds and attaches relevant images for each slide", "Creates charts from numerical data in your content"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
              <Link to="/auth?mode=register" className="btn-primary inline-flex items-center gap-2 mt-4">
                Try It Free <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-24 bg-surface-subtle dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">Beautiful Templates for Every Subject</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Academic, technical, creative — choose a template that fits your course.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop", name: "Academic Blue" },
              { img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop", name: "Dark Tech" },
              { img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop", name: "Minimal White" },
              { img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=250&fit=crop", name: "Corporate Navy" },
              { img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=250&fit=crop", name: "Gradient Creative" },
              { img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop", name: "Nature Green" },
              { img: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=250&fit=crop", name: "Science Lab" },
              { img: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&h=250&fit=crop", name: "History Classic" },
            ].map((t, i) => (
              <div key={i} className="slide-card rounded-2xl overflow-hidden group">
                <div className="relative aspect-video">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-2 left-3 text-white text-sm font-semibold">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/templates" className="btn-secondary inline-flex items-center gap-2">
              Browse All Templates <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">Loved by Students & Educators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card rounded-3xl p-6 hover:shadow-brand transition-all duration-300">
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-surface-subtle dark:bg-dark-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Start free, upgrade when you need more power.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricing.map((p, i) => (
              <div key={i} className={`rounded-3xl p-6 relative ${p.highlight ? "bg-gradient-to-br from-azure-500 to-violet-600 text-white shadow-brand-lg" : "glass-card"}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`font-display font-bold text-xl mb-1 ${p.highlight ? "text-white" : "text-foreground"}`}>{p.plan}</h3>
                <p className={`text-sm mb-4 ${p.highlight ? "text-white/80" : "text-muted-foreground"}`}>{p.desc}</p>
                <div className={`font-display font-extrabold text-5xl mb-6 ${p.highlight ? "text-white" : "text-foreground"}`}>
                  ${p.price}<span className={`text-lg font-normal ${p.highlight ? "text-white/70" : "text-muted-foreground"}`}>/mo</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2 text-sm ${p.highlight ? "text-white/90" : "text-foreground"}`}>
                      <Check size={14} className={p.highlight ? "text-white" : "text-green-500"} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth?mode=register"
                  className={`block text-center font-semibold py-3 px-6 rounded-xl transition-all duration-200 ${
                    p.highlight
                      ? "bg-white text-brand-700 hover:bg-white/90"
                      : "bg-gradient-brand text-white hover:opacity-90"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-azure-500/10 to-violet-500/10" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl font-bold text-foreground mb-4">Ready to Transform Your Class Content?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join 50,000+ students and educators who save hours every week with AI-powered presentations.</p>
              <Link to="/auth?mode=register" className="btn-primary text-base py-4 px-10 inline-flex items-center gap-2 shadow-glow-blue">
                <Upload size={18} />
                Start Converting — It's Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-border dark:border-dark-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logo3d} alt="Class2PPT" className="w-7 h-7 rounded-lg" />
            <span className="font-display font-bold gradient-text">Class2PPT</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Class2PPT. Turn learning into sharing.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
