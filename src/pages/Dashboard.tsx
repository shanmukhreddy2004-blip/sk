import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, FileText, Video, Mic, Globe, MoreVertical, Download, Trash2, Edit,
  Clock, Sparkles, TrendingUp, FileVideo, BookOpen, Loader2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_PRESENTATIONS, STAT_CARDS } from "@/constants";
import { usePresentations, useDeletePresentation } from "@/hooks/usePresentations";
import type { User, Presentation } from "@/types";

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const { data: dbPresentations, isLoading, error } = usePresentations();
  const deletePresentation = useDeletePresentation();

  // Merge DB presentations with mock ones (mock shown only when DB is empty / loading)
  const allPresentations: Presentation[] = dbPresentations && dbPresentations.length > 0
    ? dbPresentations
    : isLoading
    ? []
    : MOCK_PRESENTATIONS;

  const sourceIcons: Record<string, React.ReactNode> = {
    pdf: <FileText size={14} />,
    transcript: <FileText size={14} />,
    url: <Globe size={14} />,
    youtube: <Video size={14} />,
    "live-class": <Mic size={14} />,
    notes: <BookOpen size={14} />,
  };

  const sourceColors: Record<string, string> = {
    pdf: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    transcript: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    url: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    youtube: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
    "live-class": "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
    notes: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };

  const quickActions = [
    { icon: FileText, label: "Upload PDF / Notes", desc: "PDF, DOCX, TXT", color: "from-red-400 to-rose-500", sourceType: "pdf" },
    { icon: Video, label: "YouTube / Video URL", desc: "Paste any video link", color: "from-rose-500 to-pink-600", sourceType: "youtube" },
    { icon: Mic, label: "Join Live Class", desc: "Stream URL or meeting link", color: "from-violet-500 to-purple-600", sourceType: "live-class" },
    { icon: Globe, label: "Webpage / Article", desc: "Any URL or transcript", color: "from-azure-500 to-cyan-500", sourceType: "url" },
  ];

  const handleDelete = (id: string) => {
    // Only delete from DB if it's a real UUID (not a mock id like "p1", "p2")
    if (id.startsWith('p') && id.length <= 3) {
      toast.info("Mock presentations cannot be deleted.");
      setMenuOpen(null);
      return;
    }
    deletePresentation.mutate(id, {
      onSuccess: () => {
        toast.success("Presentation deleted.");
        setMenuOpen(null);
      },
      onError: (err: unknown) => {
        toast.error(`Delete failed: ${(err as Error).message}`);
      },
    });
  };

  const filteredPresentations = filter === "all"
    ? allPresentations
    : allPresentations.filter((p) => p.sourceType === filter);

  // Dynamic stats from real data
  const realStats = dbPresentations && dbPresentations.length > 0
    ? [
        { label: "Presentations Created", value: String(dbPresentations.length), icon: "📊", trend: "all time" },
        { label: "Slides Generated", value: String(dbPresentations.reduce((a, p) => a + p.slideCount, 0)), icon: "📄", trend: "across all decks" },
        { label: "Time Saved", value: `${(dbPresentations.length * 1.5).toFixed(1)}h`, icon: "⏱️", trend: "vs manual creation" },
        { label: "AI Credits Left", value: "85", icon: "✨", trend: "out of 100" },
      ]
    : STAT_CARDS;

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-foreground">
              Welcome back, {user.name.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">What class content will you convert today?</p>
          </div>
          <Link to="/upload" className="btn-primary flex items-center gap-2 w-fit">
            <Plus size={18} />
            New Presentation
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {realStats.map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 hover:shadow-brand transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
                <TrendingUp size={14} className="text-green-500" />
              </div>
              <div className="font-display font-bold text-2xl text-foreground mb-0.5">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* AI Credits Banner */}
        {user.plan === "free" && (
          <div className="glass-card rounded-2xl p-4 mb-8 border border-brand-200/50 dark:border-brand-800/50 bg-gradient-to-r from-brand-50 dark:from-brand-900/20 to-violet-50 dark:to-violet-900/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">85 / 100 AI Credits remaining</p>
                <p className="text-xs text-muted-foreground">Upgrade to Pro for unlimited credits</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 sm:w-40 h-2 bg-surface-muted dark:bg-dark-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-brand rounded-full" style={{ width: "85%" }} />
              </div>
              <Link to="/auth?mode=register" className="btn-primary text-xs py-2 px-4 whitespace-nowrap">
                Upgrade to Pro
              </Link>
            </div>
          </div>
        )}

        {/* Quick Create */}
        <div className="mb-8">
          <h2 className="font-display font-semibold text-xl text-foreground mb-4">Create New Presentation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(`/upload?type=${action.sourceType}`)}
                className="glass-card rounded-2xl p-5 text-left hover:shadow-brand transition-all duration-200 group hover:-translate-y-0.5"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon size={20} className="text-white" />
                </div>
                <p className="font-semibold text-sm text-foreground mb-0.5">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Presentations */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="font-display font-semibold text-xl text-foreground">
              Your Presentations
              {isLoading && <Loader2 size={16} className="inline ml-2 animate-spin text-muted-foreground" />}
            </h2>
            <div className="flex flex-wrap gap-2">
              {["all", "pdf", "youtube", "live-class", "url"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filter === f
                      ? "bg-gradient-brand text-white shadow-sm"
                      : "bg-surface-muted dark:bg-dark-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1).replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-4">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">Could not load your presentations. Showing demo data.</p>
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-surface-muted dark:bg-dark-muted" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-surface-muted dark:bg-dark-muted rounded-lg w-3/4" />
                    <div className="h-3 bg-surface-muted dark:bg-dark-muted rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredPresentations.length === 0 ? (
            <div className="glass-card rounded-3xl p-16 text-center">
              <FileVideo size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-display font-semibold text-xl text-foreground mb-2">No presentations yet</h3>
              <p className="text-muted-foreground mb-6">Create your first AI presentation in under 2 minutes!</p>
              <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> Create First Presentation
              </Link>
            </div>
          ) : !isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPresentations.map((pres) => (
                <div key={pres.id} className="glass-card rounded-2xl overflow-hidden hover:shadow-brand transition-all duration-200 group">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-surface-muted dark:bg-dark-muted overflow-hidden">
                    {pres.thumbnail ? (
                      <img src={pres.thumbnail} alt={pres.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${pres.theme.primary}40, ${pres.theme.secondary}30)` }}>
                        <FileText size={32} className="text-muted-foreground opacity-50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg font-mono">
                      {pres.slideCount} slides
                    </div>
                    <div className={`absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                      pres.status === "ready" ? "bg-green-500/90 text-white"
                      : pres.status === "processing" ? "bg-amber-500/90 text-white"
                      : "bg-red-500/90 text-white"
                    }`}>
                      {pres.status === "processing" && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      {pres.status.charAt(0).toUpperCase() + pres.status.slice(1)}
                    </div>
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === pres.id ? null : pres.id); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>
                      {menuOpen === pres.id && (
                        <div className="absolute right-0 mt-1 w-44 glass-card rounded-xl shadow-card-dark border border-surface-border dark:border-dark-border overflow-hidden z-10 animate-fade-in">
                          <button onClick={() => { navigate(`/editor/${pres.id}`); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-surface-muted dark:hover:bg-dark-muted">
                            <Edit size={13} /> Edit Presentation
                          </button>
                          <button onClick={() => setMenuOpen(null)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-surface-muted dark:hover:bg-dark-muted">
                            <Download size={13} /> Export PPTX
                          </button>
                          <button
                            onClick={() => handleDelete(pres.id)}
                            disabled={deletePresentation.isPending}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                          >
                            {deletePresentation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm text-foreground leading-tight line-clamp-2">{pres.title}</h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${sourceColors[pres.sourceType] || "bg-surface-muted"}`}>
                        {sourceIcons[pres.sourceType]}
                        {pres.sourceType.replace("-", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{pres.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {new Date(pres.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                      <button
                        onClick={() => navigate(`/editor/${pres.id}`)}
                        className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                      >
                        Open Editor →
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Create New Card */}
              <Link
                to="/upload"
                className="glass-card rounded-2xl overflow-hidden border-2 border-dashed border-surface-border dark:border-dark-border hover:border-brand-500 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all duration-200 flex flex-col items-center justify-center p-8 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-surface-muted dark:bg-dark-muted group-hover:bg-gradient-brand flex items-center justify-center mb-3 transition-all duration-200">
                  <Plus size={24} className="text-muted-foreground group-hover:text-white transition-colors duration-200" />
                </div>
                <p className="font-semibold text-sm text-foreground mb-1">New Presentation</p>
                <p className="text-xs text-muted-foreground">Upload content or paste a URL</p>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
