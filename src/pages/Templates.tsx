import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Crown, ArrowRight, Check } from "lucide-react";
import { TEMPLATES } from "@/constants";

const CATEGORIES = ["All", "Academic", "Tech", "Business", "Creative", "Minimal"];

const EXTENDED_TEMPLATES = [
  ...TEMPLATES,
  {
    id: "sci-fi",
    name: "Sci-Fi Dark",
    description: "Futuristic dark theme for computer science topics",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop",
    category: "tech" as const,
    theme: { primary: "#00d4ff", secondary: "#0066ff", background: "#000811", text: "#e0f4ff", font: "Sora" },
    isPro: true,
  },
  {
    id: "medical",
    name: "Medical Clean",
    description: "Professional clean layout for medical and health sciences",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=250&fit=crop",
    category: "academic" as const,
    theme: { primary: "#0ea5e9", secondary: "#06b6d4", background: "#f0f9ff", text: "#0c4a6e", font: "Inter" },
  },
  {
    id: "pastel-art",
    name: "Pastel Art",
    description: "Soft pastel tones for arts and humanities",
    thumbnail: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=250&fit=crop",
    category: "creative" as const,
    theme: { primary: "#ec4899", secondary: "#a855f7", background: "#fdf2f8", text: "#1e1b4b", font: "Sora" },
    isPro: true,
  },
  {
    id: "blackboard",
    name: "Chalkboard",
    description: "Classic academic chalkboard aesthetic",
    thumbnail: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400&h=250&fit=crop",
    category: "academic" as const,
    theme: { primary: "#4ade80", secondary: "#86efac", background: "#1a2e1a", text: "#f0fdf4", font: "Inter" },
  },
  {
    id: "corporate-red",
    name: "Executive Red",
    description: "Bold red accent for impactful business decks",
    thumbnail: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=400&h=250&fit=crop",
    category: "business" as const,
    theme: { primary: "#dc2626", secondary: "#ef4444", background: "#fff5f5", text: "#1a0a0a", font: "Inter" },
    isPro: true,
  },
];

export default function Templates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = EXTENDED_TEMPLATES.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || t.category.toLowerCase() === category.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">Presentation Templates</h1>
          <p className="text-muted-foreground">Choose a template for your next AI-generated presentation</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat
                    ? "bg-gradient-brand text-white shadow-sm"
                    : "bg-surface-muted dark:bg-dark-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelected(t.id === selected ? null : t.id)}
              className={`glass-card rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-200 group hover:-translate-y-0.5 ${
                selected === t.id ? "border-brand-500 shadow-brand scale-[1.02]" : "border-transparent hover:border-brand-300 dark:hover:border-brand-700"
              }`}
            >
              {/* Preview */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={t.thumbnail}
                  alt={t.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  className="absolute inset-0 opacity-40"
                  style={{ background: `linear-gradient(135deg, ${t.theme.primary}30, ${t.theme.secondary}20)` }}
                />
                {/* Overlay accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: t.theme.primary }} />

                {t.isPro && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-400/95 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <Crown size={9} /> PRO
                  </div>
                )}
                {selected === t.id && (
                  <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center shadow-lg">
                      <Check size={20} className="text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-foreground">{t.name}</h3>
                  <div className="flex gap-1 mt-0.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.theme.primary }} />
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.theme.secondary }} />
                    <div className="w-3 h-3 rounded-full border border-surface-border dark:border-dark-border" style={{ backgroundColor: t.theme.background }} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[10px] capitalize bg-surface-muted dark:bg-dark-muted px-2 py-0.5 rounded-full text-muted-foreground">{t.category}</span>
                  {t.isPro ? (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                      <Crown size={9} /> Pro Only
                    </span>
                  ) : (
                    <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Free</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search size={40} className="mx-auto text-muted-foreground mb-3 opacity-40" />
            <p className="text-muted-foreground">No templates match your search</p>
          </div>
        )}

        {/* Use Selected Template CTA */}
        {selected && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slide-up">
            <div className="glass-card rounded-2xl px-6 py-4 shadow-brand-lg border border-brand-200/30 dark:border-brand-800/30 flex items-center gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {EXTENDED_TEMPLATES.find((t) => t.id === selected)?.name} selected
                </p>
                <p className="text-xs text-muted-foreground">Ready to generate with this template</p>
              </div>
              <button
                onClick={() => navigate(`/upload?template=${selected}`)}
                className="btn-primary text-sm py-2 flex items-center gap-2 whitespace-nowrap"
              >
                Use This Template <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
