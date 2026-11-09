import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HttpStatusCode, isAxiosError } from "axios";
import { api, withApiUrl } from "src/api/client";

const FAVORITES_QUERY_KEY = ["favorites"];

export function useFavorites() {
  return useQuery({
    queryKey: FAVORITES_QUERY_KEY,
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY }),
  });

  return {
    addFavorite: addFavoriteMutation.mutate,
    isAddingFavorite: addFavoriteMutation.isPending,
    hasAddFavoriteError: addFavoriteMutation.isError,
    isRateLimited:
      isAxiosError(addFavoriteMutation.error) &&
      addFavoriteMutation.error.response?.status === HttpStatusCode.TooManyRequests,
    resetAddFavorite: addFavoriteMutation.reset,
  };
}
