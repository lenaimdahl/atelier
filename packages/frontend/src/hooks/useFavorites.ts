import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => (await api.favorites.listFavorites()).data,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  const addFavoriteMutation = useMutation({
    mutationFn: async (bookId: string) =>
      (await api.favorites.addFavorite({ bookId })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  return {
    addFavorite: addFavoriteMutation.mutate,
    isAddingFavorite: addFavoriteMutation.isPending,
    hasAddFavoriteError: addFavoriteMutation.isError,
  };
}
