export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
}

export type SlideLayout = "title" | "content" | "two-column" | "image-left" | "image-right" | "blank" | "chart";

export interface Slide {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  bullets?: string[];
  imageUrl?: string;
  imageQuery?: string;
  chartData?: ChartData;
  speakerNotes?: string;
  backgroundColor?: string;
  accentColor?: string;
}

export interface ChartData {
  type: "bar" | "line" | "pie" | "donut";
  labels: string[];
  datasets: { label: string; data: number[]; color?: string }[];
}

export interface Presentation {
  id: string;
  title: string;
  description?: string;
  slides: Slide[];
  templateId: string;
  theme: PresentationTheme;
  sourceType: SourceType;
  sourceFile?: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
  status: "processing" | "ready" | "error";
  slideCount: number;
  thumbnail?: string;
}

export type SourceType = "pdf" | "notes" | "transcript" | "live-class" | "url" | "youtube";

export interface PresentationTheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  font: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: "academic" | "business" | "creative" | "minimal" | "tech";
  theme: PresentationTheme;
  isPro?: boolean;
}

export interface ProcessingStep {
  id: string;
  label: string;
  description: string;
  status: "pending" | "active" | "done" | "error";
  duration?: number;
}

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: "uploading" | "ready" | "error";
}

export type ActiveTool = "select" | "text" | "image" | "shape" | "chart";
