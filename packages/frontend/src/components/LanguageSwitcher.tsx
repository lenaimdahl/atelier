import { useTranslation } from "react-i18next";
import { Button } from "src/components/Button";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const isGerman = i18n.language.startsWith("de");
  const nextLanguage = isGerman ? "en" : "de";

  function changeLanguage() {
    void i18n.changeLanguage(nextLanguage);
  }

  return (
    <Button
      className="language-button"
      variant="icon"
      type="button"
      aria-label={t("common.switchLanguage")}
      onClick={changeLanguage}
    >
      {nextLanguage.toUpperCase()}
    </Button>
  );
}
