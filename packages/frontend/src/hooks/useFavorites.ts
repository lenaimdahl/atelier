import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { api, withApiUrl } from "src/api/client";

export function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const favorites = (await api.favorites.listFavorites()).data;
      for (const favorite of favorites) {
        favorite.book = withApiUrl(favorite.book);
      }
      return favorites;
    },
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
    isRateLimited:
      isAxiosError(addFavoriteMutation.error) &&
      addFavoriteMutation.error.response?.status === 429,
    resetAddFavorite: addFavoriteMutation.reset,
  };
}
