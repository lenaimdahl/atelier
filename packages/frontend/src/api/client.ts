import { Api } from "src/api/generated/generated";

export const api = new Api({ baseURL: import.meta.env.VITE_API_URL });

/**
 * Resolve a path returned by the API, such as a cover path, against the API base URL
 */
export function withApiUrl<T extends { coverUrl?: string }>(book: T): T {
  return book.coverUrl
    ? { ...book, coverUrl: `${import.meta.env.VITE_API_URL}${book.coverUrl}` }
    : book;
}
