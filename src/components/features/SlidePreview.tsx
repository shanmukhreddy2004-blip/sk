import { BarChart2, PieChart } from "lucide-react";
import type { Slide, PresentationTheme } from "@/types";

interface SlidePreviewProps {
  slide: Slide;
  theme: PresentationTheme;
  isSelected?: boolean;
  onClick?: () => void;
  scale?: number;
  showNumber?: number;
}

export default function SlidePreview({ slide, theme, isSelected, onClick, scale = 1, showNumber }: SlidePreviewProps) {
  const bgStyle = {
    backgroundColor: theme.background,
    color: theme.text,
    fontFamily: theme.font,
  };

  const accentStyle = { color: theme.primary };
  const accentBg = { backgroundColor: theme.primary };

  return (
    <div
      onClick={onClick}
      className={`slide-card ${isSelected ? "border-brand-500 shadow-brand" : "border-transparent"}`}
      style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
    >
      <div
        className="relative overflow-hidden"
        style={{ ...bgStyle, aspectRatio: "16/9", width: "100%", minHeight: "160px" }}
      >
        {/* Background image for title/image slides */}
        {slide.imageUrl && (slide.layout === "title" || slide.layout === "image-right" || slide.layout === "image-left") && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(${slide.imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}

        {/* Gradient overlay for title slides */}
        {slide.layout === "title" && (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}30 0%, ${theme.secondary}20 100%)`,
            }}
          />
        )}

        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1" style={accentBg} />

        <div className="relative z-10 p-5 h-full flex flex-col justify-between">
          {slide.layout === "title" && (
            <div className="flex flex-col justify-center h-full text-center gap-2">
              <h1 className="font-bold text-lg leading-tight" style={accentStyle}>{slide.title}</h1>
              {slide.subtitle && (
                <p className="text-xs opacity-70 leading-relaxed">{slide.subtitle}</p>
              )}
            </div>
          )}

          {(slide.layout === "content" || slide.layout === "two-column") && (
            <>
              <h2 className="font-bold text-sm mb-3" style={accentStyle}>{slide.title}</h2>
              <div className="flex gap-3 flex-1">
                <ul className="space-y-1.5 flex-1">
                  {slide.bullets?.slice(0, 4).map((bullet, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs opacity-80">
                      <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={accentBg} />
                      <span className="leading-tight">{bullet}</span>
                    </li>
                  ))}
                </ul>
                {slide.layout === "two-column" && slide.imageUrl && (
                  <div className="w-1/3">
                    <img src={slide.imageUrl} alt="" className="w-full h-full object-cover rounded-lg opacity-80" />
                  </div>
                )}
              </div>
            </>
          )}

          {(slide.layout === "image-right" || slide.layout === "image-left") && (
            <div className={`flex gap-3 h-full ${slide.layout === "image-left" ? "flex-row-reverse" : ""}`}>
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="font-bold text-sm mb-2" style={accentStyle}>{slide.title}</h2>
                <ul className="space-y-1">
                  {slide.bullets?.slice(0, 4).map((bullet, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs opacity-80">
                      <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={accentBg} />
                      <span className="leading-tight">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-2/5">
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full rounded-xl opacity-30" style={accentBg} />
                )}
              </div>
            </div>
          )}

          {slide.layout === "chart" && (
            <>
              <h2 className="font-bold text-sm mb-3" style={accentStyle}>{slide.title}</h2>
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-end gap-1.5 h-20">
                  {slide.chartData?.datasets[0].data.slice(0, 6).map((val, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <div
                        className="w-7 rounded-t-sm transition-all"
                        style={{ height: `${(val / 100) * 72}px`, backgroundColor: theme.primary, opacity: 0.85 + i * 0.02 }}
                      />
                      <span className="text-[7px] opacity-60">{slide.chartData?.labels[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Slide number */}
        {showNumber !== undefined && (
          <div className="absolute top-2 right-2 bg-black/30 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
            {showNumber}
          </div>
        )}
      </div>
    </div>
  );
}
