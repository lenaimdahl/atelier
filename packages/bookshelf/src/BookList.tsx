import { useTranslation } from "react-i18next";
import type { Book } from "./types";

type BookListProps = {
  books: Book[];
};

export function BookList({ books }: BookListProps) {
  const { t } = useTranslation();

  return books.length === 0 ? (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true">
        01
      </span>
      <div>
        <h3>{t("pages.home.empty.title")}</h3>
        <p>{t("pages.home.empty.description")}</p>
      </div>
    </div>
  ) : (
    <ul className="book-list">
      {books.map((book, index) => (
        <li className="book-card" key={book.id || index}>
          <span className="book-number">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="book-details">
            <h3>{book.title}</h3>
            <p>{book.author}</p>
            {book.notes && <small>{book.notes}</small>}
          </div>
          <span className="status-badge" data-status={book.status}>
            {t(`status.${book.status}`)}
          </span>
        </li>
      ))}
    </ul>
  );
}