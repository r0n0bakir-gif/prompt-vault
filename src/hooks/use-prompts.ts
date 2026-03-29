import { useQueryClient } from "@tanstack/react-query";
import {
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
  useToggleFavorite,
  getListPromptsQueryKey,
  getListCategoriesQueryKey,
} from "@workspace/api-client-react";

export function useCreatePromptWithCache() {
  const queryClient = useQueryClient();
  return useCreatePrompt({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPromptsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      },
    },
  });
}

export function useUpdatePromptWithCache() {
  const queryClient = useQueryClient();
  return useUpdatePrompt({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPromptsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      },
    },
  });
}

export function useDeletePromptWithCache() {
  const queryClient = useQueryClient();
  return useDeletePrompt({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPromptsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
      },
    },
  });
}

export function useToggleFavoriteWithCache() {
  const queryClient = useQueryClient();
  return useToggleFavorite({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPromptsQueryKey() });
      },
    },
  });
}

// Re-export standard query hooks for convenience
export { useListPrompts, useListCategories } from "@workspace/api-client-react";
