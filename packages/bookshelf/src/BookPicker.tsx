import { useTranslation } from "react-i18next";
import type { Book } from "./types";

type BookPickerProps = {
  query: string;
  onQueryChange: (query: string) => void;
  books: Book[];
  isSearching: boolean;
  isSaving: boolean;
  onPick: (book: Book) => void;
};

export function BookPicker({
  query,
  onQueryChange,
  books,
  isSearching,
  isSaving,
  onPick,
}: BookPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="book-picker">
      <input
        aria-label={t("components.bookPicker.search")}
        type="search"
        placeholder={t("components.bookPicker.search")}
        value={query}
        autoFocus
        onChange={(event) => onQueryChange(event.target.value)}
      />
      {books.length === 0 && !isSearching ? (
        <p className="book-picker-empty">{t("components.bookPicker.empty")}</p>
      ) : (
        <ul className="book-picker-list">
          {books.map((book) => (
            <li key={book.id}>
              <button
                className="book-picker-item"
                type="button"
                disabled={isSaving}
                onClick={() => onPick(book)}
              >
                {book.coverUrl ? (
                  <img className="book-cover" src={book.coverUrl} alt="" />
                ) : (
                  <span className="book-cover" aria-hidden="true" />
                )}
                <span>
                  <strong>{book.title}</strong>
                  <small>{book.author}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
