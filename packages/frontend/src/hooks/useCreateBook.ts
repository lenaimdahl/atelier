import type { Book } from "../types/generated/book";
import type { CreateBookInput } from "@atelier/bookshelf";
import { useMutation } from "@tanstack/react-query";

export function useCreateBook() {
  const createBookMutation = useMutation<Book, Error, CreateBookInput>({
    mutationFn: async (book) => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/books`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(book),
      });

      if (!response.ok) {
        throw new Error("Buch konnte nicht gespeichert werden");
      }

      return response.json();
    },
  });

  return {
    createBook: createBookMutation.mutateAsync,
    isCreatingBook: createBookMutation.isPending,
  };
}
