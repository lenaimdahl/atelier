import { useState } from "react";
import {
  BookList,
  BookPicker,
  BookDialog,
  type Book,
} from "@atelier/bookshelf";
import { useTranslation } from "react-i18next";
import Banner from "src/components/Banner";
import { useCatalogSearch } from "src/hooks/useCatalogSearch";
import { useAddFavorite, useFavorites } from "src/hooks/useFavorites";

function Books() {
  const { t } = useTranslation();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: favorites = [] } = useFavorites();
  const { data: books = [], isFetching } = useCatalogSearch(query);
  const { addFavorite, isAddingFavorite, hasAddFavoriteError } =
    useAddFavorite();

  function pickBook(book: Book) {
    addFavorite(book.id, {
      onSuccess: () => {
        setIsFormOpen(false);
        setQuery("");
      },
    });
  }

  return (
    <main className="books-page">
      <Banner isFormOpen={isFormOpen} setIsFormOpen={setIsFormOpen} />

      {isFormOpen && (
        <BookDialog
          eyebrow={t("pages.books.dialog.eyebrow")}
          title={t("pages.books.dialog.title")}
          onClose={() => setIsFormOpen(false)}
        >
          <BookPicker
            query={query}
            onQueryChange={setQuery}
            books={books}
            isSearching={isFetching}
            isSaving={isAddingFavorite}
            onPick={pickBook}
          />
          {hasAddFavoriteError && (
            <p className="book-picker-empty" role="alert">
              {t("components.bookPicker.error")}
            </p>
          )}
        </BookDialog>
      )}

      <section className="library-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("pages.books.library.eyebrow")}</p>
            <h2>{t("pages.books.library.title")}</h2>
          </div>
          <span className="book-count">
            {t("pages.books.library.count", { count: favorites.length })}
          </span>
        </div>
        <BookList favorites={favorites} />
      </section>
    </main>
  );
}

export default Books;
