import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface BookDialogProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function BookDialog({
  eyebrow,
  title,
  children,
  onClose,
}: BookDialogProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="form-panel dialog-panel"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={titleId}>{title}</h2>
        </div>
        <button
          className="icon-button"
          type="button"
          aria-label={t("common.close")}
          onClick={onClose}
        >
          x
        </button>
      </div>
      {children}
    </dialog>
  );
}
