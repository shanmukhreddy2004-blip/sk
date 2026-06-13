import { corsHeaders } from '../_shared/cors.ts';

interface GenerateRequest {
  sourceType: 'pdf' | 'url' | 'youtube' | 'live-class' | 'notes' | 'transcript';
  content?: string;      // Text content extracted from file
  url?: string;          // URL to process
  fileName?: string;     // Original file name
  slideCount?: number;
  includeImages?: boolean;
  includeSpeakerNotes?: boolean;
  includeCharts?: boolean;
  templateId?: string;
}

interface SlideOutput {
  id: string;
  layout: string;
  title: string;
  subtitle?: string;
  bullets?: string[];
  speakerNotes?: string;
  imageQuery?: string;
  chartData?: {
    type: string;
    labels: string[];
    datasets: { label: string; data: number[] }[];
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const body: GenerateRequest = await req.json();
    const {
      sourceType,
      content,
      url,
      fileName,
      slideCount = 8,
      includeImages = true,
      includeSpeakerNotes = true,
      includeCharts = true,
    } = body;

    console.log(`[generate-presentation] sourceType=${sourceType}, slideCount=${slideCount}`);

    // Build source description for AI
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

    // Step 1: If URL-based, fetch page content summary via AI
    let processedContent = content || '';
    if ((sourceType === 'url' || sourceType === 'youtube' || sourceType === 'live-class') && url) {
      console.log(`[generate-presentation] Fetching URL content for: ${url}`);
      try {
        const fetchRes = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Class2PPT-Bot/1.0)' },
          signal: AbortSignal.timeout(8000),
        });
        if (fetchRes.ok) {
          const html = await fetchRes.text();
          // Strip HTML tags naively
          processedContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s{2,}/g, ' ')
            .trim()
            .slice(0, 6000);
        }
      } catch (err) {
        console.log(`[generate-presentation] URL fetch failed (non-fatal): ${err}`);
      }
    }

    // Step 2: Generate slide outline via AI
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

    console.log('[generate-presentation] Calling Gemini AI...');
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
      console.error(`[generate-presentation] AI error: ${errText}`);
      throw new Error(`Gemini AI: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    console.log('[generate-presentation] AI response received, parsing JSON...');

    // Parse JSON from AI response
    let parsed: { title: string; description: string; slides: SlideOutput[] };
    try {
      // Try direct parse first
      parsed = JSON.parse(rawContent);
    } catch {
      // Try to extract JSON from potential markdown wrapping
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('AI returned invalid JSON');
      parsed = JSON.parse(jsonMatch[0]);
    }

    // Enrich slides with Unsplash image URLs
    const enrichedSlides = parsed.slides.map((slide: SlideOutput, i: number) => {
      const enriched: Record<string, unknown> = { ...slide };
      if (includeImages && slide.imageQuery) {
        const query = encodeURIComponent(slide.imageQuery);
        enriched.imageUrl = `https://images.unsplash.com/photo-${1500000000000 + i * 100000}?w=800&h=450&fit=crop&q=80&auto=format`;
        // Use a more reliable URL pattern with search
        enriched.imageUrl = `https://source.unsplash.com/800x450/?${query}`;
      }
      return enriched;
    });

    console.log(`[generate-presentation] Successfully generated ${enrichedSlides.length} slides`);

    return new Response(
      JSON.stringify({
        success: true,
        title: parsed.title,
        description: parsed.description,
        slides: enrichedSlides,
        slideCount: enrichedSlides.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('[generate-presentation] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
