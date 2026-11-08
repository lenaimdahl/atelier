import { useTranslation } from "react-i18next";
import type { CitizenColors } from "src/components/citizen-maker/CitizenPortrait";
import { SwatchRow } from "src/components/citizen-maker/SwatchRow";
import { CITIZENS, COLORS, DECO_DEFAULT_COLOR, type CitizenId } from "src/pages/citizenMakerOptions";

type ColorPart = keyof CitizenColors;

type CitizenFigurePickerProps = {
  selectedId: CitizenId;
  colors: CitizenColors;
  decoOriginalColor: string | undefined;
  onSelectFigure: (citizen: (typeof CITIZENS)[number]) => void;
  onSelectColor: (part: ColorPart, color: string) => void;
};

export function CitizenFigurePicker({
  selectedId,
  colors,
  decoOriginalColor,
  onSelectFigure,
  onSelectColor,
}: CitizenFigurePickerProps) {
  const { t } = useTranslation();
  const palettes: { part: ColorPart; options: readonly string[] }[] = [
    { part: "body", options: COLORS },
    { part: "head", options: COLORS },
    { part: "hair", options: COLORS },
    ...(decoOriginalColor ? [{ part: "deco" as const, options: [DECO_DEFAULT_COLOR, ...COLORS] }] : []),
  ];

  return (
    <div className="figure-picker">
      <fieldset className="figure-options">
        <legend className="control-label">{t("pages.citizenMaker.chooseFigure")}</legend>
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
              label={t(`pages.citizenMaker.colorLabels.${part}`)}
              options={options}
              selected={colors[part]}
              onSelect={(color) => onSelectColor(part, color)}
              {...(part === "deco" && decoOriginalColor
                ? {
                    displayColor: (color: string) => (color === DECO_DEFAULT_COLOR ? decoOriginalColor : color),
                    swatchLabel: (color: string) => (color === DECO_DEFAULT_COLOR ? t("pages.citizenMaker.originalColor") : color),
                  }
                : {})}
            />
          ))}
        </div>
        <span className="palette-note">{t("pages.citizenMaker.paletteNote")}</span>
      </div>
    </div>
  );
}
