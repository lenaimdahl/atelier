import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { BookStatus } from "./types";

export type CreateBookInput = {
  title: string;
  author: string;
  status: BookStatus;
  notes?: string;
};

type EditableBookField = keyof CreateBookInput;

type CreateBookProps = {
  onSave: (book: CreateBookInput) => Promise<void>;
};

export function CreateBook({ onSave }: CreateBookProps) {
  const { t } = useTranslation();
  const [book, setBook] = useState<CreateBookInput>({
    title: "",
    author: "",
    status: "will-read",
    notes: "",
  });

  function handleChangeBook(field: EditableBookField, value: string) {
    setBook(
      (currentBook) =>
        ({
          ...currentBook,
          [field]: value,
        }) as CreateBookInput,
    );
  }

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();

    const title = book.title.trim();
    const author = book.author.trim();
    const notes = book.notes?.trim();
    if (!title || !author) {
      return;
    }

    await onSave({ title, author, status: book.status, notes });
    setBook({ title: "", author: "", status: "will-read", notes: "" });
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <input
        aria-label={t("components.createBook.title")}
        type="text"
        placeholder={t("components.createBook.title")}
        value={book.title}
        onChange={(event) => handleChangeBook("title", event.target.value)}
      />
      <input
        aria-label={t("components.createBook.author")}
        type="text"
        placeholder={t("components.createBook.author")}
        value={book.author}
        onChange={(event) => handleChangeBook("author", event.target.value)}
      />
      <select
        aria-label={t("components.createBook.status")}
        value={book.status}
        onChange={(event) =>
          handleChangeBook("status", event.target.value as BookStatus)
        }
      >
        <option value="will-read">{t("status.will-read")}</option>
        <option value="reading">{t("status.reading")}</option>
        <option value="finished">{t("status.finished")}</option>
        <option value="quit">{t("status.quit")}</option>
      </select>
      <textarea
        aria-label={t("common.notes")}
        placeholder={t("common.notes")}
        value={book.notes}
        onChange={(event) => handleChangeBook("notes", event.target.value)}
      />
      <button className="submit-button" type="submit">
        {t("components.createBook.submit")}
      </button>
    </form>
  );
}
