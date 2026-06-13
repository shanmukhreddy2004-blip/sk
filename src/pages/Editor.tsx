import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download, Share2, Plus, ChevronLeft, ChevronRight, Type, Image, BarChart2,
  Layers, Edit3, Trash2, Copy, Sparkles, AlignLeft, AlignCenter,
  Bold, Italic, Palette, ZoomIn, ZoomOut, Check, X, FileDown, MessageSquare,
  Loader2
} from "lucide-react";
import { MOCK_PRESENTATIONS, MOCK_SLIDES, TEMPLATES } from "@/constants";
import { usePresentation, useUpdatePresentation } from "@/hooks/usePresentations";
import SlidePreview from "@/components/features/SlidePreview";
import type { Slide, PresentationTheme } from "@/types";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ── Load presentation (DB first, then sessionStorage, then mock) ───────────
  const isMockId = !id || (id.startsWith('p') && id.length <= 3);
  const isSessionId = !!id && id.startsWith('ai_');

  const { data: dbPresentation, isLoading: dbLoading } = usePresentation(
    isMockId || isSessionId ? undefined : id
  );

  const updatePresentation = useUpdatePresentation();

  const loadFallback = () => {
    if (isSessionId && id) {
      const stored = sessionStorage.getItem(`pres_${id}`);
      if (stored) { try { return JSON.parse(stored); } catch { /* ignore */ } }
    }
    return MOCK_PRESENTATIONS.find((p) => p.id === id) || MOCK_PRESENTATIONS[0];
  };

  const presentation = dbPresentation || loadFallback();
  const template = TEMPLATES.find((t) => t.id === presentation.templateId) || TEMPLATES[0];

  const [slides, setSlides] = useState<Slide[]>(() => {
    const p = dbPresentation || loadFallback();
    return (p.slides && p.slides.length > 0) ? p.slides : MOCK_SLIDES;
  });
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [theme, setTheme] = useState<PresentationTheme>(() => presentation.theme || template.theme);
  const [zoom, setZoom] = useState(100);
  const [showNotes, setShowNotes] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(() => presentation.title);
  const [exportDone, setExportDone] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<"design" | "ai" | "notes">("design");
  const [saving, setSaving] = useState(false);

  const current = slides[selectedSlide];

  const updateSlide = (slideId: string, updates: Partial<Slide>) => {
    setSlides((prev) => prev.map((s) => (s.id === slideId ? { ...s, ...updates } : s)));
  };

  const deleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setSelectedSlide(Math.max(0, index - 1));
  };

  const duplicateSlide = (index: number) => {
    const dup = { ...slides[index], id: `s_${Date.now()}` };
    setSlides((prev) => [...prev.slice(0, index + 1), dup, ...prev.slice(index + 1)]);
    setSelectedSlide(index + 1);
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: `s_${Date.now()}`,
      layout: "content",
      title: "New Slide Title",
      bullets: ["Key point one", "Key point two", "Key point three"],
      speakerNotes: "Add your speaker notes here.",
    };
    setSlides((prev) => [...prev, newSlide]);
    setSelectedSlide(slides.length);
  };

  // Save changes back to DB
  const handleSave = () => {
    if (isMockId || isSessionId || !id) return; // can't save mock/session ids
    setSaving(true);
    updatePresentation.mutate(
      { id, updates: { title, slides, theme } },
      {
        onSettled: () => setSaving(false),
      }
    );
  };

  const handleExport = () => {
    setExportDone(false);
    setShowExportPanel(true);
    setTimeout(() => setExportDone(true), 2000);
  };

  const themePresets = [
    { primary: "#3b82f6", secondary: "#8b5cf6", name: "Blue Purple" },
    { primary: "#059669", secondary: "#0891b2", name: "Green Teal" },
    { primary: "#f59e0b", secondary: "#ec4899", name: "Amber Pink" },
    { primary: "#1e40af", secondary: "#0284c7", name: "Navy Blue" },
    { primary: "#dc2626", secondary: "#ea580c", name: "Red Orange" },
    { primary: "#7c3aed", secondary: "#6d28d9", name: "Deep Violet" },
  ];

  if (dbLoading && !isMockId && !isSessionId) {
    return (
      <div className="h-screen flex items-center justify-center bg-background pt-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-brand-500" />
          <p className="text-muted-foreground text-sm">Loading presentation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden pt-16">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border dark:border-dark-border glass-card flex-shrink-0">
        {/* Left */}
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft size={16} /> Dashboard
          </button>
          <div className="w-px h-5 bg-surface-border dark:bg-dark-border" />
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => { setEditingTitle(false); handleSave(); }}
                onKeyDown={(e) => { if (e.key === "Enter") { setEditingTitle(false); handleSave(); } }}
                className="text-sm font-semibold text-foreground bg-surface-muted dark:bg-dark-muted px-2 py-1 rounded-lg border border-brand-500 focus:outline-none w-64"
              />
              <button onClick={() => { setEditingTitle(false); handleSave(); }} className="text-green-500"><Check size={15} /></button>
            </div>
          ) : (
            <button onClick={() => setEditingTitle(true)} className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-brand-600 transition-colors max-w-xs truncate group">
              {title}
              <Edit3 size={13} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Center - Format Tools */}
        <div className="hidden md:flex items-center gap-1 bg-surface-muted dark:bg-dark-muted rounded-xl p-1">
          {[Bold, Italic, AlignLeft, AlignCenter, Type, Palette].map((Icon, i) => (
            <button key={i} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-dark-card text-muted-foreground hover:text-foreground transition-all">
              <Icon size={14} />
            </button>
          ))}
          <div className="w-px h-5 bg-surface-border dark:bg-dark-border mx-1" />
          <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-dark-card transition-all">
            <Image size={13} /> Image
          </button>
          <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-dark-card transition-all">
            <BarChart2 size={13} /> Chart
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Save indicator */}
          {!isMockId && !isSessionId && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-surface-muted dark:bg-dark-muted text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {saving ? "Saving…" : "Save"}
            </button>
          )}
          <button onClick={() => setShowNotes(!showNotes)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${showNotes ? "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400" : "text-muted-foreground hover:text-foreground"}`}>
            <MessageSquare size={13} /> Notes
          </button>
          <button onClick={handleExport} className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5">
            <Download size={13} /> Export PPTX
          </button>
          <button className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5">
            <Share2 size={13} /> Share
          </button>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide Panel */}
        <div className="w-52 flex-shrink-0 bg-surface-subtle dark:bg-dark-surface border-r border-surface-border dark:border-dark-border overflow-y-auto">
          <div className="p-2 space-y-1.5">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className={`relative group rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-150 ${
                  selectedSlide === i ? "border-brand-500 shadow-brand" : "border-transparent hover:border-brand-300 dark:hover:border-brand-700"
                }`}
                onClick={() => setSelectedSlide(i)}
              >
                <SlidePreview slide={slide} theme={theme} showNumber={i + 1} />
                <div className="absolute top-1 right-1 hidden group-hover:flex items-center gap-0.5 bg-black/60 rounded-lg p-0.5">
                  <button onClick={(e) => { e.stopPropagation(); duplicateSlide(i); }} className="w-5 h-5 flex items-center justify-center text-white hover:text-brand-300">
                    <Copy size={10} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteSlide(i); }} className="w-5 h-5 flex items-center justify-center text-white hover:text-red-300">
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addSlide}
              className="w-full py-3 border-2 border-dashed border-surface-border dark:border-dark-border hover:border-brand-500 rounded-xl text-muted-foreground hover:text-brand-500 flex items-center justify-center gap-1.5 text-xs font-medium transition-all"
            >
              <Plus size={14} /> Add Slide
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-surface-muted dark:bg-dark-muted">
          {/* Zoom Controls */}
          <div className="flex items-center justify-center gap-2 py-2 border-b border-surface-border dark:border-dark-border">
            <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-dark-card text-muted-foreground hover:text-foreground border border-surface-border dark:border-dark-border">
              <ZoomOut size={13} />
            </button>
            <span className="text-xs font-mono text-muted-foreground w-12 text-center">{zoom}%</span>
            <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-dark-card text-muted-foreground hover:text-foreground border border-surface-border dark:border-dark-border">
              <ZoomIn size={13} />
            </button>
            <div className="w-px h-4 bg-surface-border dark:bg-dark-border" />
            <span className="text-xs text-muted-foreground">Slide {selectedSlide + 1} of {slides.length}</span>
            <div className="w-px h-4 bg-surface-border dark:bg-dark-border" />
            <button onClick={() => setSelectedSlide(Math.max(0, selectedSlide - 1))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-dark-card text-muted-foreground hover:text-foreground border border-surface-border dark:border-dark-border" disabled={selectedSlide === 0}>
              <ChevronLeft size={13} />
            </button>
            <button onClick={() => setSelectedSlide(Math.min(slides.length - 1, selectedSlide + 1))} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white dark:bg-dark-card text-muted-foreground hover:text-foreground border border-surface-border dark:border-dark-border" disabled={selectedSlide === slides.length - 1}>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Slide Canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-6">
            <div
              className="relative shadow-2xl rounded-2xl overflow-hidden"
              style={{
                width: `${(960 * zoom) / 100}px`,
                aspectRatio: "16/9",
                backgroundColor: theme.background,
                color: theme.text,
                fontFamily: theme.font,
                transition: "all 0.2s ease",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: theme.primary }} />

              {current.imageUrl && (current.layout === "title" || current.layout === "image-right" || current.layout === "image-left") && (
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: `url(${current.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              )}

              {current.layout === "title" && (
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.secondary}15 100%)` }}
                />
              )}

              <div className="relative z-10 p-10 h-full flex flex-col justify-center">
                {current.layout === "title" && (
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border" style={{ borderColor: theme.primary, color: theme.primary }}>
                      <Sparkles size={12} /> AI Generated Presentation
                    </div>
                    <h1 className="font-bold text-3xl leading-tight" style={{ color: theme.primary }}>{current.title}</h1>
                    {current.subtitle && <p className="text-lg opacity-70 max-w-2xl mx-auto">{current.subtitle}</p>}
                    {current.imageUrl && (
                      <div className="mt-6 max-w-sm mx-auto">
                        <img src={current.imageUrl} alt="" className="rounded-xl w-full h-32 object-cover opacity-80 shadow-lg" />
                      </div>
                    )}
                  </div>
                )}

                {(current.layout === "content" || current.layout === "two-column") && (
                  <div className="flex gap-8 h-full items-center">
                    <div className="flex-1">
                      <h2 className="font-bold text-2xl mb-6" style={{ color: theme.primary }}>{current.title}</h2>
                      <ul className="space-y-3">
                        {current.bullets?.map((b, i) => (
                          <li key={i} className="flex items-start gap-3 text-base">
                            <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: theme.primary }} />
                            <span className="opacity-85">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {current.layout === "two-column" && current.imageUrl && (
                      <div className="w-2/5">
                        <img src={current.imageUrl} alt="" className="w-full h-full object-cover rounded-2xl shadow-lg" />
                      </div>
                    )}
                  </div>
                )}

                {(current.layout === "image-right" || current.layout === "image-left") && (
                  <div className={`flex gap-8 h-full items-center ${current.layout === "image-left" ? "flex-row-reverse" : ""}`}>
                    <div className="flex-1">
                      <h2 className="font-bold text-2xl mb-4" style={{ color: theme.primary }}>{current.title}</h2>
                      <ul className="space-y-2.5">
                        {current.bullets?.map((b, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: theme.primary }} />
                            <span className="opacity-85">{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {current.imageUrl && (
                      <div className="w-2/5 h-48">
                        <img src={current.imageUrl} alt="" className="w-full h-full object-cover rounded-2xl shadow-lg" />
                      </div>
                    )}
                  </div>
                )}

                {current.layout === "chart" && (
                  <div>
                    <h2 className="font-bold text-2xl mb-6" style={{ color: theme.primary }}>{current.title}</h2>
                    <div className="flex items-end gap-3 h-40">
                      {current.chartData?.datasets[0].data.map((val, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-xs font-mono opacity-70">{val}%</span>
                          <div
                            className="w-full rounded-t-lg transition-all"
                            style={{
                              height: `${(val / 100) * 120}px`,
                              backgroundColor: theme.primary,
                              opacity: 0.7 + i * 0.05,
                            }}
                          />
                          <span className="text-xs opacity-60">{current.chartData?.labels[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Speaker Notes */}
          {showNotes && (
            <div className="h-32 border-t border-surface-border dark:border-dark-border bg-white dark:bg-dark-card px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Speaker Notes (Slide {selectedSlide + 1})</p>
              <textarea
                value={current.speakerNotes || ""}
                onChange={(e) => updateSlide(current.id, { speakerNotes: e.target.value })}
                placeholder="Add notes for this slide..."
                className="w-full h-16 text-sm text-foreground bg-transparent border-none resize-none focus:outline-none placeholder-muted-foreground"
              />
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-64 flex-shrink-0 bg-white dark:bg-dark-card border-l border-surface-border dark:border-dark-border overflow-y-auto">
          <div className="flex border-b border-surface-border dark:border-dark-border">
            {[
              { id: "design" as const, label: "Design", icon: Palette },
              { id: "ai" as const, label: "AI", icon: Sparkles },
              { id: "notes" as const, label: "Notes", icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveRightTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  activeRightTab === tab.id
                    ? "text-brand-600 dark:text-brand-400 border-b-2 border-brand-500"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon size={12} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeRightTab === "design" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Color Theme</p>
                  <div className="grid grid-cols-3 gap-2">
                    {themePresets.map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => setTheme((prev) => ({ ...prev, primary: preset.primary, secondary: preset.secondary }))}
                        className={`rounded-xl h-9 transition-all border-2 ${theme.primary === preset.primary ? "border-brand-500 scale-110 shadow-brand" : "border-transparent hover:scale-105"}`}
                        style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Background</p>
                  <div className="grid grid-cols-4 gap-2">
                    {["#ffffff", "#0f172a", "#f8fafc", "#fdf4ff", "#f0f9ff", "#f0fdf4", "#1a1a27", "#0a0a0f"].map((bg, i) => (
                      <button
                        key={i}
                        onClick={() => setTheme((prev) => ({ ...prev, background: bg, text: ["#ffffff", "#f8fafc", "#fdf4ff", "#f0f9ff", "#f0fdf4"].includes(bg) ? "#0f172a" : "#f1f5f9" }))}
                        className={`w-full h-8 rounded-lg border-2 transition-all ${theme.background === bg ? "border-brand-500 shadow-brand" : "border-surface-border dark:border-dark-border"}`}
                        style={{ backgroundColor: bg }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Slide Layout</p>
                  <div className="grid grid-cols-2 gap-2">
                    {["title", "content", "image-right", "image-left", "two-column", "chart"].map((layout) => (
                      <button
                        key={layout}
                        onClick={() => updateSlide(current.id, { layout: layout as Slide["layout"] })}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border-2 transition-all capitalize ${
                          current.layout === layout
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                            : "border-surface-border dark:border-dark-border text-muted-foreground hover:border-brand-300 dark:hover:border-brand-700"
                        }`}
                      >
                        {layout.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save to DB button */}
                {!isMockId && !isSessionId && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {saving ? "Saving changes…" : "Save Changes"}
                  </button>
                )}
              </div>
            )}

            {activeRightTab === "ai" && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">AI Actions</p>
                {[
                  { icon: Sparkles, label: "Regenerate Slide", desc: "Rewrite with AI" },
                  { icon: Type, label: "Improve Bullets", desc: "Make more concise" },
                  { icon: Image, label: "Better Image", desc: "Find a new image" },
                  { icon: BarChart2, label: "Add Chart", desc: "Visualize data" },
                  { icon: Layers, label: "Add Slide After", desc: "AI generates next slide" },
                  { icon: Edit3, label: "Expand Topic", desc: "Add more detail" },
                ].map((action, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-muted dark:hover:bg-dark-muted transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <action.icon size={14} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">{action.label}</p>
                      <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeRightTab === "notes" && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Speaker Notes</p>
                <textarea
                  value={current.speakerNotes || ""}
                  onChange={(e) => updateSlide(current.id, { speakerNotes: e.target.value })}
                  placeholder="Add notes for this slide..."
                  className="w-full h-40 text-xs text-foreground bg-surface-muted dark:bg-dark-muted rounded-xl p-3 border border-surface-border dark:border-dark-border resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/50 placeholder-muted-foreground"
                />
                <button className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1.5">
                  <Sparkles size={12} /> AI Generate Notes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Panel */}
      {showExportPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-8 w-full max-w-sm mx-4 shadow-brand-lg animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-foreground">Export Presentation</h2>
              <button onClick={() => setShowExportPanel(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-muted dark:bg-dark-muted text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            {!exportDone ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-4 shadow-glow-blue">
                  <FileDown size={28} className="text-white animate-bounce-slow" />
                </div>
                <p className="font-semibold text-foreground mb-1">Preparing your PPTX...</p>
                <p className="text-sm text-muted-foreground mb-4">Compiling {slides.length} slides with images and notes</p>
                <div className="h-2 bg-surface-muted dark:bg-dark-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-brand rounded-full animate-shimmer" style={{ width: "70%" }} />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                    <Check size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-green-700 dark:text-green-400">Ready to Download!</p>
                    <p className="text-xs text-green-600/80 dark:text-green-500">{slides.length} slides · {title}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = "#";
                    link.download = `${title.replace(/\s+/g, "_")}.pptx`;
                    link.click();
                    setShowExportPanel(false);
                  }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Download PPTX File
                </button>
                <button onClick={() => setShowExportPanel(false)} className="btn-secondary w-full text-sm">
                  Share Link Instead
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
