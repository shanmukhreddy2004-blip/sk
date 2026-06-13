import { useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText, Video, Mic, Globe, Upload as UploadIcon, X, Check, ArrowRight,
  Link as LinkIcon, Youtube, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import ProcessingModal from "@/components/features/ProcessingModal";
import { TEMPLATES } from "@/constants";
import type { SourceType } from "@/types";
import { generatePresentation, readFileAsText, type GeneratedPresentation } from "@/lib/api";
import { useSavePresentation } from "@/hooks/usePresentations";

export default function Upload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSource, setActiveSource] = useState<SourceType>((searchParams.get("type") as SourceType) || "pdf");
  const [selectedTemplate, setSelectedTemplate] = useState(searchParams.get("template") || "academic-blue");
  const [files, setFiles] = useState<File[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState<"source" | "template" | "settings">("source");
  const [showProcessing, setShowProcessing] = useState(false);
  const [processingFile, setProcessingFile] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slideCount, setSlideCount] = useState("8");
  const [includeImages, setIncludeImages] = useState(true);
  const [includeSpeakerNotes, setIncludeSpeakerNotes] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(true);

  const savePresentation = useSavePresentation();

  const sources = [
    { id: "pdf" as SourceType, icon: FileText, label: "PDF / Notes", desc: "PDF, DOCX, TXT, PPT files", color: "from-red-400 to-rose-500", accept: ".pdf,.docx,.txt,.ppt,.pptx" },
    { id: "youtube" as SourceType, icon: Youtube, label: "YouTube Video", desc: "Paste video or playlist URL", color: "from-rose-500 to-red-600", accept: "" },
    { id: "live-class" as SourceType, icon: Mic, label: "Live Class Stream", desc: "Zoom, Meet, Teams, stream URL", color: "from-violet-500 to-purple-600", accept: "" },
    { id: "url" as SourceType, icon: Globe, label: "Web Page / Article", desc: "Any URL, blog or transcript", color: "from-blue-500 to-cyan-500", accept: "" },
  ];

  const activeSourceData = sources.find((s) => s.id === activeSource)!;

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) setFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const canProceed = () => {
    if (activeSource === "pdf") return files.length > 0;
    if (activeSource === "youtube") return urlInput.length > 5;
    if (activeSource === "live-class") return liveUrl.length > 5;
    if (activeSource === "url") return urlInput.length > 5;
    return false;
  };

  const handleGenerate = () => {
    const name = files.length > 0 ? files[0].name : urlInput || liveUrl || "Your Content";
    setProcessingFile(name);
    setShowProcessing(true);
  };

  const buildGenerateFn = useCallback(() => {
    return async () => {
      let content = "";
      const url = urlInput || liveUrl || undefined;
      const fileName = files.length > 0 ? files[0].name : undefined;

      if (files.length > 0) {
        try {
          content = await readFileAsText(files[0]);
        } catch {
          content = `File: ${files[0].name}`;
        }
      }

      return generatePresentation({
        sourceType: activeSource,
        content: content || undefined,
        url,
        fileName,
        slideCount: parseInt(slideCount),
        includeImages,
        includeSpeakerNotes,
        includeCharts,
        templateId: selectedTemplate,
      });
    };
  }, [activeSource, files, urlInput, liveUrl, slideCount, includeImages, includeSpeakerNotes, includeCharts, selectedTemplate]);

  const handleComplete = async (result: GeneratedPresentation) => {
    setShowProcessing(false);
    const template = TEMPLATES.find((t) => t.id === selectedTemplate) || TEMPLATES[0];

    // Derive a thumbnail from the first slide's image
    const firstSlideWithImage = result.slides.find((s) => s.imageUrl);
    const thumbnail = firstSlideWithImage?.imageUrl || undefined;

    savePresentation.mutate(
      {
        title: result.title,
        description: result.description,
        sourceType: activeSource,
        sourceUrl: urlInput || liveUrl || undefined,
        templateId: selectedTemplate,
        theme: template.theme,
        slides: result.slides,
        slideCount: result.slideCount,
        thumbnail,
        status: "ready",
      },
      {
        onSuccess: (saved) => {
          toast.success(`${result.slideCount} slides generated for "${result.title}"`);
          navigate(`/editor/${saved.id}`);
        },
        onError: (err: unknown) => {
          // Fallback: save to sessionStorage if DB fails (e.g., not logged in)
          console.error("DB save failed, falling back to sessionStorage:", err);
          const presentationId = `ai_${Date.now()}`;
          const fullPresentation = {
            id: presentationId,
            title: result.title,
            description: result.description,
            slides: result.slides,
            templateId: selectedTemplate,
            theme: template.theme,
            sourceType: activeSource,
            slideCount: result.slideCount,
            status: "ready",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          sessionStorage.setItem(`pres_${presentationId}`, JSON.stringify(fullPresentation));
          toast.success(`${result.slideCount} slides generated for "${result.title}"`);
          navigate(`/editor/${presentationId}`);
        },
      }
    );
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const steps = [
    { id: "source", label: "Select Source" },
    { id: "template", label: "Choose Template" },
    { id: "settings", label: "AI Settings" },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="font-display font-bold text-3xl text-foreground mb-2">Create New Presentation</h1>
          <p className="text-muted-foreground">Upload your class content and let AI do the rest</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => {
            const idx = steps.findIndex((x) => x.id === step);
            const isActive = s.id === step;
            const isDone = steps.findIndex((x) => x.id === s.id) < idx;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  onClick={() => { if (isDone || isActive) setStep(s.id as typeof step); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive ? "bg-gradient-brand text-white shadow-glow-blue"
                    : isDone ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 cursor-pointer"
                    : "bg-surface-muted dark:bg-dark-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check size={14} /> : <span>{i + 1}</span>}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < steps.length - 1 && <div className={`w-8 h-0.5 ${isDone ? "bg-green-400" : "bg-surface-border dark:bg-dark-border"}`} />}
              </div>
            );
          })}
        </div>

        {/* STEP 1: Source */}
        {step === "source" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {sources.map((src) => (
                <button
                  key={src.id}
                  onClick={() => { setActiveSource(src.id); setFiles([]); setUrlInput(""); setLiveUrl(""); }}
                  className={`glass-card rounded-2xl p-4 text-left transition-all duration-200 border-2 ${
                    activeSource === src.id ? "border-brand-500 shadow-brand" : "hover:border-brand-300 dark:hover:border-brand-700"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${src.color} flex items-center justify-center mb-3`}>
                    <src.icon size={18} className="text-white" />
                  </div>
                  <p className="font-semibold text-sm text-foreground mb-0.5">{src.label}</p>
                  <p className="text-xs text-muted-foreground">{src.desc}</p>
                </button>
              ))}
            </div>

            <div className="glass-card rounded-3xl p-6">
              {activeSource === "pdf" ? (
                <div>
                  <div
                    className={`upload-zone ${dragging ? "dragging" : ""}`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input ref={fileInputRef} type="file" multiple accept={activeSourceData.accept} onChange={handleFileSelect} className="hidden" />
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activeSourceData.color} flex items-center justify-center mx-auto mb-4`}>
                      <UploadIcon size={28} className="text-white" />
                    </div>
                    <p className="font-semibold text-foreground mb-1">Drop files here or click to browse</p>
                    <p className="text-sm text-muted-foreground">Supports PDF, DOCX, TXT, PPTX · Max 50MB per file</p>
                  </div>
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted dark:bg-dark-muted">
                          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <FileText size={16} className="text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                          <button onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-500 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeSource === "live-class" ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
                    <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Mic size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-1">Live Class Integration</p>
                      <p className="text-xs text-violet-600/80 dark:text-violet-400/80">Paste your Zoom, Google Meet, Teams, or streaming URL. Class2PPT will join, listen, and generate slides in real-time as your class proceeds.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Live Class / Stream URL</label>
                    <div className="relative">
                      <LinkIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="url"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        placeholder="https://zoom.us/j/... or meet.google.com/..."
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {["Start of class — I'll monitor from beginning", "Already in progress — join now", "Scheduled — set start time", "Recording URL — class already ended"].map((opt, i) => (
                      <button key={i} className={`glass-card rounded-xl p-3 text-left text-xs font-medium ${i === 0 ? "border-brand-500 text-brand-600 dark:text-brand-400" : "text-muted-foreground"} border hover:border-brand-400 transition-colors`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {activeSource === "youtube" ? "YouTube Video URL" : "Webpage or Article URL"}
                  </label>
                  <div className="relative">
                    {activeSource === "youtube" ? (
                      <Youtube size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                    ) : (
                      <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    )}
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={activeSource === "youtube" ? "https://youtube.com/watch?v=..." : "https://example.com/article..."}
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-surface-border dark:border-dark-border bg-white dark:bg-dark-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
                    />
                  </div>
                  {activeSource === "youtube" && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-300">AI will analyze the video topic and extract key concepts to build your slide deck.</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Try a sample URL:</p>
                    <div className="flex flex-wrap gap-2">
                      {activeSource === "youtube"
                        ? [
                            { label: "Khan Academy Algebra", url: "https://www.youtube.com/watch?v=NybHckSEQBI" },
                            { label: "MIT OCW Lecture", url: "https://ocw.mit.edu/courses/6-001-structure-and-interpretation-of-computer-programs-spring-2005/" },
                          ].map((s) => (
                            <button key={s.label} onClick={() => setUrlInput(s.url)} className="text-xs px-3 py-1 rounded-full bg-surface-muted dark:bg-dark-muted text-muted-foreground hover:text-foreground hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors">
                              {s.label}
                            </button>
                          ))
                        : [
                            { label: "Machine Learning (Wikipedia)", url: "https://en.wikipedia.org/wiki/Machine_learning" },
                            { label: "Climate Change (Wikipedia)", url: "https://en.wikipedia.org/wiki/Climate_change" },
                          ].map((s) => (
                            <button key={s.label} onClick={() => setUrlInput(s.url)} className="text-xs px-3 py-1 rounded-full bg-surface-muted dark:bg-dark-muted text-muted-foreground hover:text-foreground hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors">
                              {s.label}
                            </button>
                          ))
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep("template")}
                disabled={!canProceed()}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Choose Template <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Template */}
        {step === "template" && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="font-display font-semibold text-xl text-foreground mb-4">Choose a Template</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`rounded-2xl overflow-hidden border-2 transition-all duration-200 group ${
                      selectedTemplate === t.id ? "border-brand-500 shadow-brand scale-105" : "border-transparent hover:border-brand-300 dark:hover:border-brand-700"
                    }`}
                  >
                    <div className="relative aspect-video">
                      <img src={t.thumbnail} alt={t.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {t.isPro && (
                        <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">PRO</div>
                      )}
                      {selectedTemplate === t.id && (
                        <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shadow-lg">
                            <Check size={16} className="text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-white dark:bg-dark-card">
                      <p className="text-xs font-semibold text-foreground">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{t.category}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep("source")} className="btn-secondary">← Back</button>
              <button onClick={() => setStep("settings")} className="btn-primary flex items-center gap-2">
                AI Settings <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Settings */}
        {step === "settings" && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass-card rounded-3xl p-6 space-y-6">
              <h2 className="font-display font-semibold text-xl text-foreground">AI Generation Settings</h2>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Number of Slides</label>
                <div className="flex gap-2">
                  {["5", "8", "10", "12", "15", "20"].map((n) => (
                    <button
                      key={n}
                      onClick={() => setSlideCount(n)}
                      className={`w-12 h-10 rounded-xl text-sm font-semibold transition-all ${
                        slideCount === n ? "bg-gradient-brand text-white shadow-sm" : "bg-surface-muted dark:bg-dark-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Include Relevant Images", desc: "AI sources and attaches topic-matching images to each slide", val: includeImages, set: setIncludeImages },
                  { label: "Generate Speaker Notes", desc: "AI writes presenter notes for confident delivery", val: includeSpeakerNotes, set: setIncludeSpeakerNotes },
                  { label: "Auto-generate Charts", desc: "Converts data and statistics in your content to visual charts", val: includeCharts, set: setIncludeCharts },
                ].map((toggle, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-muted dark:bg-dark-muted">
                    <div>
                      <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{toggle.desc}</p>
                    </div>
                    <button
                      onClick={() => toggle.set(!toggle.val)}
                      className={`relative w-12 h-6 rounded-full transition-all duration-200 ${toggle.val ? "bg-gradient-brand" : "bg-surface-border dark:bg-dark-border"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${toggle.val ? "left-6" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
                <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center flex-shrink-0">
                  <Video size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">Generation Summary</p>
                  <p className="text-xs text-brand-600/80 dark:text-brand-400/80 mt-1">
                    {slideCount} slides · {TEMPLATES.find((t) => t.id === selectedTemplate)?.name} template · {[includeImages && "Images", includeSpeakerNotes && "Speaker notes", includeCharts && "Charts"].filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-xs text-brand-600/60 dark:text-brand-500/60 mt-0.5">Powered by Gemini 3 Flash · ~15–30 seconds</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep("template")} className="btn-secondary">← Back</button>
              <button
                onClick={handleGenerate}
                disabled={savePresentation.isPending}
                className="btn-primary flex items-center gap-2 shadow-glow-blue disabled:opacity-50"
              >
                <Video size={16} />
                Generate with AI
              </button>
            </div>
          </div>
        )}
      </div>

      <ProcessingModal
        isOpen={showProcessing}
        fileName={processingFile}
        generateFn={buildGenerateFn()}
        onComplete={handleComplete}
        onClose={() => setShowProcessing(false)}
      />
    </div>
  );
}
