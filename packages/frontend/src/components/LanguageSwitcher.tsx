import { useTranslation } from "react-i18next";
import { Button } from "src/components/Button";
import { LANGUAGES } from "src/i18n/config";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const isGerman = i18n.language.startsWith(LANGUAGES.DE);
  const nextLanguage = isGerman ? LANGUAGES.EN : LANGUAGES.DE;

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
