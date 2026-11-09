import { useTranslation } from "react-i18next";
import type { CitizenColors, CitizenLogo } from "src/components/citizen-lab/design/citizenTypes";
import { LogoControls } from "src/components/citizen-lab/controls/LogoControls";
import { SwatchRow } from "src/components/citizen-lab/controls/SwatchRow";
import { PARTS, ASSET_PART_GREEN, CITIZENS, COLORS, type Citizen, DECO_COLORS, DECO_DEFAULT_COLOR, type CitizenId } from "src/components/citizen-lab/design/citizenLabOptions";
import "src/components/citizen-lab/shared.css";
import "src/components/citizen-lab/controls/CitizenFigurePicker.css";

type ColorPart = keyof CitizenColors;

interface CitizenFigurePickerProps {
  selectedId: CitizenId;
  colors: CitizenColors;
  decoOriginalColor: string | undefined;
  recolorableParts: { eyes: boolean; nose: boolean; mouth: boolean };
  logo: CitizenLogo;
  onSelectFigure: (citizen: Citizen) => void;
  onSelectColor: (part: ColorPart, color: string) => void;
  onLogoChange: (change: Partial<CitizenLogo>) => void;
}

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
    { part: PARTS.HAIR, options: COLORS },
    { part: PARTS.HEAD, options: COLORS },
    ...[PARTS.EYES, PARTS.NOSE, PARTS.MOUTH]
      .filter((part) => recolorableParts[part])
      .map((part) => ({ part, options: COLORS })),
    { part: PARTS.BODY, options: COLORS },
    ...(decoOriginalColor
      ? [
          {
            part: PARTS.DECO,
            options: decoOriginalColor === ASSET_PART_GREEN ? DECO_COLORS.filter((color) => color !== COLORS[0]) : DECO_COLORS,
          },
        ]
      : []),
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
              selected={
                part === PARTS.DECO && decoOriginalColor === ASSET_PART_GREEN && colors.deco === COLORS[0]
                  ? DECO_DEFAULT_COLOR
                  : colors[part]
              }
              onSelect={(color) => onSelectColor(part, color)}
              {...(part === PARTS.DECO && decoOriginalColor
                ? {
                    displayColor: (color: string) => (color === DECO_DEFAULT_COLOR ? decoOriginalColor : color),
                    swatchLabel: (color: string) => (color === DECO_DEFAULT_COLOR ? t("pages.citizenLab.originalColor") : color),
                  }
                : {})}
            />
          ))}
        </div>
        {logo.style !== "none" && <LogoControls logo={logo} onLogoChange={onLogoChange} />}
        <span className="palette-note">{t("pages.citizenLab.paletteNote")}</span>
      </div>
    </div>
  );
}
