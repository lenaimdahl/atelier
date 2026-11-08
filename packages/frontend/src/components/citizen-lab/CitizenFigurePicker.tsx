import { useTranslation } from "react-i18next";
import type { CitizenColors, CitizenLogo } from "src/components/citizen-lab/CitizenPortrait";
import { SwatchRow } from "src/components/citizen-lab/SwatchRow";
import { CITIZENS, COLORS, DECO_DEFAULT_COLOR, LOGO_COLORS, type CitizenId } from "src/pages/citizenLabOptions";

type ColorPart = keyof CitizenColors;

type CitizenFigurePickerProps = {
  selectedId: CitizenId;
  colors: CitizenColors;
  decoOriginalColor: string | undefined;
  recolorableParts: { eyes: boolean; nose: boolean; mouth: boolean };
  logo: CitizenLogo;
  onSelectFigure: (citizen: (typeof CITIZENS)[number]) => void;
  onSelectColor: (part: ColorPart, color: string) => void;
  onLogoChange: (change: Partial<CitizenLogo>) => void;
};

export function CitizenFigurePicker({
  selectedId,
  colors,
  decoOriginalColor,
  recolorableParts,
  logo,
  onSelectFigure,
  onSelectColor,
  onLogoChange,
}: CitizenFigurePickerProps) {
  const { t } = useTranslation();
  const palettes: { part: ColorPart; options: readonly string[] }[] = [
    { part: "hair", options: COLORS },
    { part: "head", options: COLORS },
    ...(["eyes", "nose", "mouth"] as const)
      .filter((part) => recolorableParts[part])
      .map((part) => ({ part, options: COLORS })),
    { part: "body", options: COLORS },
    ...(decoOriginalColor ? [{ part: "deco" as const, options: [DECO_DEFAULT_COLOR, ...COLORS] }] : []),
  ];

  return (
    <div className="figure-picker">
      <fieldset className="figure-options">
        <legend className="control-label">{t("pages.citizenLab.chooseFigure")}</legend>
        {CITIZENS.map((citizen) => (
          <button
            className={`figure-option${citizen.id === selectedId ? " selected" : ""}`}
            key={citizen.id}
            type="button"
            aria-pressed={citizen.id === selectedId}
            onClick={() => onSelectFigure(citizen)}
          >
            <span className={`figure-token token-${citizen.id}`} aria-hidden="true" />
            <span>{citizen.name}</span>
          </button>
        ))}
      </fieldset>
      <div className="figure-colors">
        <div className="color-palettes">
          {palettes.map(({ part, options }) => (
            <SwatchRow
              key={part}
              className="color-swatches"
              label={t(`pages.citizenLab.colorLabels.${part}`)}
              options={options}
              selected={colors[part]}
              onSelect={(color) => onSelectColor(part, color)}
              {...(part === "deco" && decoOriginalColor
                ? {
                    displayColor: (color: string) => (color === DECO_DEFAULT_COLOR ? decoOriginalColor : color),
                    swatchLabel: (color: string) => (color === DECO_DEFAULT_COLOR ? t("pages.citizenLab.originalColor") : color),
                  }
                : {})}
            />
          ))}
        </div>
        {logo.style !== "none" && (
          <div className="logo-controls">
            <fieldset className="logo-styles">
              <legend className="control-label">{t("pages.citizenLab.logoLabel")}</legend>
              {(["icon", "text"] as const).map((style) => (
                <button
                  key={style}
                  className={`logo-style-option${logo.style === style ? " selected" : ""}`}
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
        )}
        <span className="palette-note">{t("pages.citizenLab.paletteNote")}</span>
      </div>
    </div>
  );
}
