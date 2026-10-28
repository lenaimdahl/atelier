import { useState } from "react";
import {
  BookList,
  CreateBook,
  CreateBookDialog,
  type CreateBookInput,
} from "@atelier/bookshelf";
import type { Book } from "../types/generated/book";
import { useCreateBook } from "../hooks/useCreateBook";
import { useTranslation } from "react-i18next";
import Banner from "../components/Banner";

function Books() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { createBook } = useCreateBook();

  async function saveBook(book: CreateBookInput) {
    const savedBook = await createBook(book);

    setBooks((currentBooks) => [...currentBooks, savedBook]);
    setIsFormOpen(false);
  }

  return (
    <main className="books-page">
      <Banner isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} />

      {isFormOpen && (
        <CreateBookDialog
          eyebrow={t("pages.books.dialog.eyebrow")}
          title={t("pages.books.dialog.title")}
          onClose={() => setIsFormOpen(false)}
        >
          <CreateBook onSave={saveBook} />
        </CreateBookDialog>
      )}

      <section className="library-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("pages.books.library.eyebrow")}</p>
            <h2>{t("pages.books.library.title")}</h2>
          </div>
          <span className="book-count">
            {t("pages.books.library.count", { count: books.length })}
          </span>
        </div>
        <BookList books={books} />
      </section>
    </main>
  );
}

export default Books;
