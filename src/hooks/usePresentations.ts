import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Presentation, Slide, PresentationTheme } from '@/types';

// ── DB row shape (matches the `presentations` table) ─────────────────────────
interface DBPresentation {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  source_type: string;
  source_url: string | null;
  source_content: string | null;
  template_id: string;
  theme: PresentationTheme;
  slides: Slide[];
  slide_count: number;
  thumbnail: string | null;
  status: 'processing' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
}

// ── Map DB row → app Presentation ────────────────────────────────────────────
function mapRow(row: DBPresentation): Presentation {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    slides: Array.isArray(row.slides) ? row.slides : [],
    templateId: row.template_id,
    theme: row.theme,
    sourceType: row.source_type as Presentation['sourceType'],
    sourceUrl: row.source_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    slideCount: row.slide_count,
    thumbnail: row.thumbnail ?? undefined,
  };
}

// ── Fetch all presentations for the current user ──────────────────────────────
export function usePresentations() {
  return useQuery({
    queryKey: ['presentations'],
    queryFn: async (): Promise<Presentation[]> => {
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data as DBPresentation[]).map(mapRow);
    },
  });
}

// ── Fetch a single presentation by id ────────────────────────────────────────
export function usePresentation(id: string | undefined) {
  return useQuery({
    queryKey: ['presentations', id],
    enabled: !!id && !id.startsWith('p'),          // skip mock ids
    queryFn: async (): Promise<Presentation | null> => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('presentations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // not found
        throw error;
      }
      return mapRow(data as DBPresentation);
    },
  });
}

// ── Save (insert) a new presentation ─────────────────────────────────────────
export interface SavePresentationInput {
  title: string;
  description?: string;
  sourceType: string;
  sourceUrl?: string;
  templateId: string;
  theme: PresentationTheme;
  slides: Slide[];
  slideCount: number;
  thumbnail?: string;
  status?: 'processing' | 'ready' | 'error';
}

export function useSavePresentation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SavePresentationInput): Promise<Presentation> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('presentations')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description ?? null,
          source_type: input.sourceType,
          source_url: input.sourceUrl ?? null,
          template_id: input.templateId,
          theme: input.theme,
          slides: input.slides,
          slide_count: input.slideCount,
          thumbnail: input.thumbnail ?? null,
          status: input.status ?? 'ready',
        })
        .select()
        .single();

      if (error) throw error;
      return mapRow(data as DBPresentation);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presentations'] });
    },
  });
}

// ── Update an existing presentation ──────────────────────────────────────────
export function useUpdatePresentation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SavePresentationInput> }): Promise<Presentation> => {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.slides !== undefined) { payload.slides = updates.slides; payload.slide_count = updates.slides.length; }
      if (updates.theme !== undefined) payload.theme = updates.theme;
      if (updates.templateId !== undefined) payload.template_id = updates.templateId;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.thumbnail !== undefined) payload.thumbnail = updates.thumbnail;

      const { data, error } = await supabase
        .from('presentations')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapRow(data as DBPresentation);
    },
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['presentations'] });
      qc.invalidateQueries({ queryKey: ['presentations', id] });
    },
  });
}

// ── Delete a presentation ─────────────────────────────────────────────────────
export function useDeletePresentation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('presentations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presentations'] });
    },
  });
}
