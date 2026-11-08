import { useTranslation } from "react-i18next";
import { CITIZENS, COLORS, type CitizenId } from "src/pages/citizenMakerOptions";

type ColorPart = "body" | "head" | "hair";

type CitizenFigurePickerProps = {
  selectedId: CitizenId;
  colors: Record<ColorPart, string>;
  onSelectFigure: (citizen: (typeof CITIZENS)[number]) => void;
  onSelectColor: (part: ColorPart, color: string) => void;
};

export function CitizenFigurePicker({
  selectedId,
  colors,
  onSelectFigure,
  onSelectColor,
}: CitizenFigurePickerProps) {
  const { t } = useTranslation();
  const palettes: { part: ColorPart; color: string }[] = [
    { part: "body", color: colors.body },
    { part: "head", color: colors.head },
    { part: "hair", color: colors.hair },
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
          {palettes.map(({ part, color: partColor }) => (
            <fieldset className="color-swatches" key={part}>
              <legend className="control-label">{t(`pages.citizenMaker.colorLabels.${part}`)}</legend>
              {COLORS.map((color) => (
                <button
                  className={`color-swatch${partColor === color ? " selected" : ""}`}
                  key={color}
                  type="button"
                  style={{ "--swatch-color": color } as React.CSSProperties}
                  aria-label={t("pages.citizenMaker.colorPartOption", {
                    part: t(`pages.citizenMaker.colorLabels.${part}`),
                    color,
                  })}
                  aria-pressed={partColor === color}
                  onClick={() => onSelectColor(part, color)}
                />
              ))}
            </fieldset>
          ))}
        </div>
        <span className="palette-note">{t("pages.citizenMaker.paletteNote")}</span>
      </div>
    </div>
  );
}