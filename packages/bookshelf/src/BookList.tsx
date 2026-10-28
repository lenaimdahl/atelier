import { useTranslation } from "react-i18next";
import type { FavoriteBook } from "./types";

type BookListProps = {
  favorites: FavoriteBook[];
};

export function BookList({ favorites }: BookListProps) {
  const { t } = useTranslation();

  return favorites.length === 0 ? (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true">
        01
      </span>
      <div>
        <h3>{t("pages.books.empty.title")}</h3>
        <p>{t("pages.books.empty.description")}</p>
      </div>
    </div>
  ) : (
    <ul className="book-list">
      {favorites.map(({ book, count }, index) => (
        <li className="book-card" key={book.id}>
          {book.coverUrl ? (
            <img className="book-cover" src={book.coverUrl} alt="" />
          ) : (
            <span className="book-cover" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          <div className="book-details">
            <h3>{book.title}</h3>
            <p>{book.author}</p>
          </div>
          <span className="status-badge">
            {t("pages.books.library.picked", { count })}
          </span>
        </li>
      ))}
    </ul>
  );
}
