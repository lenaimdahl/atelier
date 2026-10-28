export type BookStatus = "will-read" | "reading" | "finished" | "quit";

export interface Book {
  id?: string;
  title: string;
  author: string;
  status: BookStatus;
  notes?: string;
}