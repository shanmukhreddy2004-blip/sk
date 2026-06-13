import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, Loader2, Sparkles, X, AlertCircle } from "lucide-react";
import type { GeneratedPresentation } from "@/lib/api";

interface ProcessingModalProps {
  isOpen: boolean;
  fileName: string;
  onComplete: (result: GeneratedPresentation) => void;
  onClose: () => void;
  generateFn: () => Promise<{ data: GeneratedPresentation | null; error: string | null }>;
}

const STEPS = [
  { id: "parse", label: "Parsing Content", description: "Extracting text and structure from your source" },
  { id: "analyze", label: "AI Analysis", description: "Understanding topics, key concepts, and flow" },
  { id: "outline", label: "Generating Outline", description: "Creating logical slide structure" },
  { id: "slides", label: "Building Slides", description: "Writing titles, bullets, and speaker notes" },
  { id: "images", label: "Adding Visuals", description: "Sourcing relevant images for each slide" },
  { id: "design", label: "Applying Design", description: "Applying your chosen template and theme" },
];

export default function ProcessingModal({ isOpen, fileName, onComplete, onClose, generateFn }: ProcessingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedPresentation | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const runGeneration = useCallback(async () => {
    if (hasStarted) return;
    setHasStarted(true);
    setError(null);
    setCurrentStep(0);
    setDone(false);
    setResult(null);

    // Animate through initial visual steps while AI works in background
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 2) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1800);

    const { data, error: genError } = await generateFn();

    clearInterval(stepInterval);

    if (genError || !data) {
      setError(genError || "Generation failed. Please try again.");
      setHasStarted(false);
      return;
    }

    setCurrentStep(STEPS.length - 1);
    await new Promise((r) => setTimeout(r, 600));
    setResult(data);
    setDone(true);
    setHasStarted(false);
  }, [generateFn, hasStarted]);

  useEffect(() => {
    if (isOpen && !hasStarted && !done && !error) {
      runGeneration();
    }
  }, [isOpen]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setDone(false);
      setError(null);
      setResult(null);
      setHasStarted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card rounded-3xl p-8 w-full max-w-md mx-4 shadow-brand-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-blue">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">
                {done ? "Presentation Ready!" : error ? "Generation Failed" : "AI is Working..."}
              </h2>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{fileName}</p>
            </div>
          </div>
          {(done || error) && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-muted dark:bg-dark-muted text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Something went wrong</p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80 break-all">{error}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setError(null);
                  setHasStarted(false);
                  runGeneration();
                }}
                className="btn-primary flex-1 text-sm"
              >
                Try Again
              </button>
              <button onClick={onClose} className="btn-secondary text-sm px-4">Cancel</button>
            </div>
          </div>
        )}

        {/* Processing Steps */}
        {!error && !done && (
          <div className="space-y-3 mb-6">
            {STEPS.map((step, i) => {
              const isActive = i === currentStep;
              const isDone = i < currentStep;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                    isActive ? "bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800" :
                    isDone ? "opacity-60" : "opacity-30"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                  ) : isActive ? (
                    <Loader2 size={18} className="text-brand-500 animate-spin flex-shrink-0" />
                  ) : (
                    <Circle size={18} className="text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${isActive ? "text-brand-700 dark:text-brand-300" : "text-foreground"}`}>
                      {step.label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-muted-foreground truncate">{step.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Progress bar (processing) */}
        {!error && !done && (
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Processing with AI</span>
              <span>{Math.round(((currentStep + 1) / STEPS.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-surface-muted dark:bg-dark-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-brand rounded-full transition-all duration-700"
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Using <span className="text-brand-500 font-medium">Gemini 3 Flash</span> · Usually takes 15–30 seconds
            </p>
          </div>
        )}

        {/* Done State */}
        {done && result && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="font-display font-bold text-xl text-foreground mb-1">{result.title}</h3>
              <p className="text-sm text-muted-foreground">{result.description}</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {result.slideCount} slides generated
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles size={11} className="text-brand-500" />
                  AI-powered
                </span>
              </div>
            </div>
            <button
              onClick={() => onComplete(result)}
              className="btn-primary w-full flex items-center justify-center gap-2 shadow-glow-blue"
            >
              Open in Editor →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
