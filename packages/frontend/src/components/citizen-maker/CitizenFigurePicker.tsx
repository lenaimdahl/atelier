import { useTranslation } from "react-i18next";
import { CITIZENS, COLORS, type CitizenId } from "src/pages/citizenMakerOptions";

type ColorPart = "body" | "head" | "hair" | "fist";
// The fist deco is white by default, so its palette also offers white to switch back.
export const FIST_DEFAULT_COLOR = "#fffbff";
const TAG_FONTS = [
  { value: "Hack, monospace", label: "Hack" },
  { value: "\"Jersey 10\", monospace", label: "Jersey 10" },
  { value: "Georgia, serif", label: "Georgia" },
];

type CitizenFigurePickerProps = {
  selectedId: CitizenId;
  colors: Record<ColorPart, string>;
  showFistColor: boolean;
  tagText: string;
  tagFontFamily: string;
  tagColor: string;
  onSelectFigure: (citizen: (typeof CITIZENS)[number]) => void;
  onSelectColor: (part: ColorPart, color: string) => void;
  onTagTextChange: (text: string) => void;
  onTagFontChange: (fontFamily: string) => void;
  onTagColorChange: (color: string) => void;
};

export function CitizenFigurePicker({
  selectedId,
  colors,
  showFistColor,
  tagText,
  tagFontFamily,
  tagColor,
  onSelectFigure,
  onSelectColor,
  onTagTextChange,
  onTagFontChange,
  onTagColorChange,
}: CitizenFigurePickerProps) {
  const { t } = useTranslation();
  const palettes: { part: ColorPart; color: string; options: readonly string[] }[] = [
    { part: "body", color: colors.body, options: COLORS },
    { part: "head", color: colors.head, options: COLORS },
    { part: "hair", color: colors.hair, options: COLORS },
    ...(showFistColor ? [{ part: "fist" as const, color: colors.fist, options: [FIST_DEFAULT_COLOR, ...COLORS] }] : []),
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
          {palettes.map(({ part, color: partColor, options }) => (
            <fieldset className="color-swatches" key={part}>
              <legend className="control-label">{t(`pages.citizenMaker.colorLabels.${part}`)}</legend>
              {options.map((color) => (
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
        <div className="tag-controls">
          <label className="tag-field">
            <span className="control-label">{t("pages.citizenMaker.tagTextLabel")}</span>
            <input
              type="text"
              maxLength={20}
              placeholder={t("pages.citizenMaker.tagTextPlaceholder")}
              value={tagText}
              onChange={(event) => onTagTextChange(event.currentTarget.value)}
            />
          </label>
          <label className="tag-field">
            <span className="control-label">{t("pages.citizenMaker.tagFontLabel")}</span>
            <select value={tagFontFamily} onChange={(event) => onTagFontChange(event.currentTarget.value)}>
              {TAG_FONTS.map((font) => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </select>
          </label>
          <fieldset className="color-swatches tag-color-swatches">
            <legend className="control-label">{t("pages.citizenMaker.tagColorLabel")}</legend>
            {COLORS.map((color) => (
              <button
                className={`color-swatch${tagColor === color ? " selected" : ""}`}
                key={color}
                type="button"
                style={{ "--swatch-color": color } as React.CSSProperties}
                aria-label={t("pages.citizenMaker.colorPartOption", {
                  part: t("pages.citizenMaker.tagColorLabel"),
                  color,
                })}
                aria-pressed={tagColor === color}
                onClick={() => onTagColorChange(color)}
              />
            ))}
          </fieldset>
        </div>
      </div>
    </div>
  );
}