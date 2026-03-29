import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Prompt {
  id: string;
  title: string;
  text: string;
  category: string;
  note?: string | null;
  isFavorite: boolean;
  createdAt: string;
}

const STORAGE_KEY = "prompt-vault-prompts";

function loadPrompts(): Prompt[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function savePrompts(prompts: Prompt[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export const LIST_PROMPTS_KEY = ["prompts"];
export const LIST_CATEGORIES_KEY = ["categories"];

export function getListPromptsQueryKey() {
  return LIST_PROMPTS_KEY;
}

export function getListCategoriesQueryKey() {
  return LIST_CATEGORIES_KEY;
}

export function useListPrompts(params?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: [...LIST_PROMPTS_KEY, params],
    queryFn: () => {
      let prompts = loadPrompts();
      if (params?.search) {
        const s = params.search.toLowerCase();
        prompts = prompts.filter(
          (p) =>
            p.title.toLowerCase().includes(s) ||
            p.text.toLowerCase().includes(s) ||
            p.note?.toLowerCase().includes(s)
        );
      }
      if (params?.category) {
        prompts = prompts.filter((p) => p.category === params.category);
      }
      return prompts;
    },
  });
}

export function useListCategories() {
  return useQuery({
    queryKey: LIST_CATEGORIES_KEY,
    queryFn: () => {
      const prompts = loadPrompts();
      return [...new Set(prompts.map((p) => p.category))].sort();
    },
  });
}

export function useCreatePrompt(options?: { mutation?: { onSuccess?: () => void } }) {
  return useMutation({
    mutationFn: async (data: { title: string; text: string; category: string; note?: string | null }) => {
      const prompts = loadPrompts();
      const newPrompt: Prompt = {
        id: crypto.randomUUID(),
        ...data,
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };
      savePrompts([...prompts, newPrompt]);
      return newPrompt;
    },
    onSuccess: options?.mutation?.onSuccess,
  });
}

export function useUpdatePrompt(options?: { mutation?: { onSuccess?: () => void } }) {
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title: string; text: string; category: string; note?: string | null }) => {
      const prompts = loadPrompts();
      const updated = prompts.map((p) => (p.id === id ? { ...p, ...data } : p));
      savePrompts(updated);
      return updated.find((p) => p.id === id)!;
    },
    onSuccess: options?.mutation?.onSuccess,
  });
}

export function useDeletePrompt(options?: { mutation?: { onSuccess?: () => void } }) {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const prompts = loadPrompts();
      savePrompts(prompts.filter((p) => p.id !== id));
    },
    onSuccess: options?.mutation?.onSuccess,
  });
}

export function useToggleFavorite(options?: { mutation?: { onSuccess?: () => void } }) {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const prompts = loadPrompts();
      const updated = prompts.map((p) =>
        p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
      );
      savePrompts(updated);
      return updated.find((p) => p.id === id)!;
    },
    onSuccess: options?.mutation?.onSuccess,
  });
}
