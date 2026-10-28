import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";

interface BannerProps {
  isFormOpen: boolean;
  setIsFormOpen: Dispatch<SetStateAction<boolean>>;
}

function Banner({ isFormOpen, setIsFormOpen }: BannerProps) {
  const { t } = useTranslation();

  function handleButtonClick() {
    setIsFormOpen((currentState) => !currentState);
  }

  return (
    <section className="hero-banner">
      <div className="hero-copy">
        <p className="eyebrow">{t("pages.books.eyebrow")}</p>
        <h1>{t("pages.books.title")}</h1>
        <p className="hero-subtitle">{t("pages.books.subTitle")}</p>
        <Button type="button" onClick={handleButtonClick}>
          <span aria-hidden="true">+</span>
          {isFormOpen ? t("common.close") : t("common.addBook")}
        </Button>
      </div>
      <div className="hero-image" aria-hidden="true" />
    </section>
  );
}

export default Banner;
