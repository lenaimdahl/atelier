import { useTranslation } from "react-i18next";
import { SwatchRow } from "src/components/citizen-lab/controls/SwatchRow";
import { LOGO_COLORS } from "src/components/citizen-lab/design/citizenLabOptions";
import type { CitizenLogo } from "src/components/citizen-lab/design/citizenTypes";
import "src/components/citizen-lab/shared.css";
import "src/components/citizen-lab/controls/LogoControls.css";

type LogoControlsProps = {
  logo: CitizenLogo;
  onLogoChange: (change: Partial<CitizenLogo>) => void;
};

export function LogoControls({ logo, onLogoChange }: LogoControlsProps) {
  const { t } = useTranslation();
  return (
    <div className="logo-controls">
      <fieldset className="logo-styles">
        <legend className="control-label">{t("pages.citizenLab.logoLabel")}</legend>
        {(["icon", "text"] as const).map((style) => (
          <button
            key={style}
            className="lab-button"
            type="button"
            aria-pressed={logo.style === style}
            onClick={() => onLogoChange({ style })}
          >
            {t(`pages.citizenLab.logoStyles.${style}`)}
          </button>
        ))}
      </fieldset>
      <SwatchRow
        className="color-swatches"
        label={t("pages.citizenLab.logoColorLabel")}
        options={LOGO_COLORS}
        selected={logo.color}
        onSelect={(color) => onLogoChange({ color })}
      />
    </div>
  );
}
