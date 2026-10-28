import { useState } from "react";
import type { Book } from "../types/generated/book";
import { useCreateBook } from "../hooks/useCreateBook";
import {
  CreateBook,
  type CreateBookInput,
} from "../Features/createBooks/CreateBook";
import { BookList } from "../Features/bookList/BookList";
import { CreateBookDialog } from "../Features/createBooks/CreateBookDialog";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import Banner from "../components/Banner";

function Home() {
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
    <main className="home-page">
      <header className="topbar">
        <span className="brand-mark">ATELIER</span>
        <LanguageSwitcher />
      </header>
      <Banner isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} />

      {isFormOpen && (
        <CreateBookDialog
          eyebrow={t("pages.home.dialog.eyebrow")}
          title={t("pages.home.dialog.title")}
          onClose={() => setIsFormOpen(false)}
        >
          <CreateBook onSave={saveBook} />
        </CreateBookDialog>
      )}

      <section className="library-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("pages.home.library.eyebrow")}</p>
            <h2>{t("pages.home.library.title")}</h2>
          </div>
          <span className="book-count">
            {t("pages.home.library.count", { count: books.length })}
          </span>
        </div>
        <BookList books={books} />
      </section>
    </main>
  );
}

export default Home;
