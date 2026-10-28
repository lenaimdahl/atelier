export interface Book {
  id: string;
  title: string;
  author: string;
  language: "en" | "de";
  coverUrl?: string;
}

export interface FavoriteBook {
  book: Book;
  count: number;
  lastAddedAt: string;
}
