import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface CreateBookDialogProps {
  eyebrow: string;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function CreateBookDialog({
  eyebrow,
  title,
  children,
  onClose,
}: CreateBookDialogProps) {
  const { t } = useTranslation();

  return (
    <div className="dialog-backdrop">
      <dialog
        className="form-panel dialog-panel"
        open
        aria-labelledby="dialog-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h2 id="dialog-title">{title}</h2>
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
    </div>
  );
}