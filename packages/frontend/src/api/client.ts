import { Api } from "src/api/generated/generated";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export const api = new Api({ baseURL: API_URL });

export function withApiUrl<T extends { coverUrl?: string }>(book: T): T {
  return book.coverUrl
    ? { ...book, coverUrl: `${API_URL}${book.coverUrl}` }
    : book;
}
