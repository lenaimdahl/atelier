import { useTranslation } from "react-i18next";
import type { LogoStyle } from "src/components/citizen-lab/design/citizenLabOptions";
import "src/components/citizen-lab/shared.css";

type PreviewActionsProps = {
  logoStyle: LogoStyle;
  onToggleLogo: () => void;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
};

export function PreviewActions({ logoStyle, onToggleLogo, onDownloadSvg, onDownloadPng }: PreviewActionsProps) {
  const { t } = useTranslation();
  return (
    <div className="preview-actions">
      <span>{t("pages.citizenLab.mood")}</span>
      <button className="lab-button" type="button" aria-pressed={logoStyle !== "none"} onClick={onToggleLogo}>
        {logoStyle === "none" ? t("pages.citizenLab.addLogo") : t("pages.citizenLab.removeLogo")}
      </button>
      <button className="lab-button" type="button" onClick={onDownloadSvg}>
        {t("pages.citizenLab.downloadSvg")}
      </button>
      <button className="lab-button" type="button" onClick={onDownloadPng}>
        {t("pages.citizenLab.downloadPng")}
      </button>
    </div>
  );
}
