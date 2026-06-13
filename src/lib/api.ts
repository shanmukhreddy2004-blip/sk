import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface GenerateOptions {
  sourceType: 'pdf' | 'url' | 'youtube' | 'live-class' | 'notes' | 'transcript';
  content?: string;
  url?: string;
  fileName?: string;
  slideCount?: number;
  includeImages?: boolean;
  includeSpeakerNotes?: boolean;
  includeCharts?: boolean;
  templateId?: string;
}

export interface GeneratedPresentation {
  title: string;
  description: string;
  slides: GeneratedSlide[];
  slideCount: number;
}

export interface GeneratedSlide {
  id: string;
  layout: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  speakerNotes?: string;
  imageUrl?: string;
  imageQuery?: string;
  chartData?: {
    type: string;
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
}

export async function generatePresentation(
  options: GenerateOptions
): Promise<{ data: GeneratedPresentation | null; error: string | null }> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return { data: null, error: 'VITE_GEMINI_API_KEY is not configured in .env' };
    }

    const {
      sourceType,
      content,
      url,
      fileName,
      slideCount = 8,
      includeImages = true,
      includeSpeakerNotes = true,
      includeCharts = true,
    } = options;

    let sourceDescription = '';
    if (sourceType === 'url' || sourceType === 'youtube') {
      sourceDescription = `URL: ${url}`;
    } else if (sourceType === 'live-class') {
      sourceDescription = `Live class stream URL: ${url || 'provided'}`;
    } else if (content) {
      sourceDescription = `File: ${fileName || 'uploaded file'}\nContent:\n${content.slice(0, 8000)}`;
    } else {
      sourceDescription = `Source: ${fileName || sourceType}`;
    }

    let processedContent = content || '';
    if ((sourceType === 'url' || sourceType === 'youtube' || sourceType === 'live-class') && url) {
      try {
        const fetchRes = await fetch(url, {
          signal: AbortSignal.timeout(8000),
        });
        if (fetchRes.ok) {
          const html = await fetchRes.text();
          processedContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim()
            .slice(0, 6000);
        }
      } catch (err) {
        console.log(`[generate-presentation] URL fetch failed (CORS likely): ${err}`);
      }
    }

    const systemPrompt = `You are Class2PPT, an expert AI that converts class content into structured slide presentations. 
You always return valid JSON only, no markdown, no code fences.
You create engaging, educational, well-organized slides.`;

    const userPrompt = `Convert the following class content into a ${slideCount}-slide presentation.

SOURCE TYPE: ${sourceType}
${sourceDescription}
${processedContent ? `\nEXTRACTED CONTENT:\n${processedContent.slice(0, 5000)}` : ''}

REQUIREMENTS:
- Generate exactly ${slideCount} slides
- First slide must be a title slide (layout: "title")
- Last slide should be a summary/conclusion (layout: "content")
- Mix layouts: title, content, image-right, image-left, two-column${includeCharts ? ', chart' : ''}
- Each content slide has 3-5 bullet points
${includeSpeakerNotes ? '- Include natural speaker notes (2-3 sentences each)' : '- speakerNotes: ""'}
${includeImages ? '- Include an imageQuery (3-5 descriptive words for Unsplash image search) for each slide' : '- imageQuery: ""'}
- For chart slides, include realistic chartData with labels and percentage values

Return ONLY a JSON object with this exact structure:
{
  "title": "Presentation Title",
  "description": "Brief 1-sentence description",
  "slides": [
    {
      "id": "s1",
      "layout": "title",
      "title": "...",
      "subtitle": "...",
      "speakerNotes": "...",
      "imageQuery": "..."
    },
    {
      "id": "s2",
      "layout": "content",
      "title": "...",
      "bullets": ["...", "...", "..."],
      "speakerNotes": "...",
      "imageQuery": "..."
    }
  ]
}`;

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          { parts: [{ text: userPrompt }] }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return { data: null, error: `Gemini AI Error: ${errText}` };
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let parsed: { title: string; description: string; slides: GeneratedSlide[] };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI returned invalid JSON');
      parsed = JSON.parse(jsonMatch[0]);
    }

    const enrichedSlides = parsed.slides.map((slide: GeneratedSlide, i: number) => {
      const enriched = { ...slide };
      if (includeImages && slide.imageQuery) {
        const query = encodeURIComponent(slide.imageQuery);
        enriched.imageUrl = `https://source.unsplash.com/800x450/?${query}`;
      }
      return enriched;
    });

    return { 
      data: {
        title: parsed.title,
        description: parsed.description,
        slides: enrichedSlides,
        slideCount: enrichedSlides.length
      }, 
      error: null 
    };

  } catch (error) {
    console.error(error);
    return { data: null, error: String(error) };
  }
}

/**
 * Read a File object as text (for PDFs this gives raw text, not ideal but workable)
 */
export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
