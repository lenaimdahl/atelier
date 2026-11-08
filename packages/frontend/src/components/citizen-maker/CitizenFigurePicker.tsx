import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import type { CitizenColors, CitizenTag } from "src/components/citizen-maker/CitizenPortrait";
import { CITIZENS, COLORS, type CitizenId } from "src/pages/citizenMakerOptions";

type ColorPart = keyof CitizenColors;
// Colorable decos are white by default, so their palette also offers white to switch back.
export const DECO_DEFAULT_COLOR = "#fffbff";
const TAG_FONTS = [
  { value: "Hack, monospace", label: "Hack" },
  { value: "\"Jersey 10\", monospace", label: "Jersey 10" },
  { value: "Georgia, serif", label: "Georgia" },
];

function SwatchRow({
  className,
  label,
  options,
  selected,
  onSelect,
}: {
  className: string;
  label: string;
  options: readonly string[];
  selected: string;
  onSelect: (color: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <fieldset className={className}>
      <legend className="control-label">{label}</legend>
      {options.map((color) => (
        <button
          className={`color-swatch${selected === color ? " selected" : ""}`}
          key={color}
          type="button"
          style={{ "--swatch-color": color } as CSSProperties}
          aria-label={t("pages.citizenMaker.colorPartOption", { part: label, color })}
          aria-pressed={selected === color}
          onClick={() => onSelect(color)}
        />
      ))}
    </fieldset>
  );
}

type CitizenFigurePickerProps = {
  selectedId: CitizenId;
  colors: CitizenColors;
  showDecoColor: boolean;
  tag: CitizenTag;
  onSelectFigure: (citizen: (typeof CITIZENS)[number]) => void;
  onSelectColor: (part: ColorPart, color: string) => void;
  onTagChange: (change: Partial<CitizenTag>) => void;
};

export function CitizenFigurePicker({
  selectedId,
  colors,
  showDecoColor,
  tag,
  onSelectFigure,
  onSelectColor,
  onTagChange,
}: CitizenFigurePickerProps) {
  const { t } = useTranslation();
  const palettes: { part: ColorPart; options: readonly string[] }[] = [
    { part: "body", options: COLORS },
    { part: "head", options: COLORS },
    { part: "hair", options: COLORS },
    ...(showDecoColor ? [{ part: "deco" as const, options: [DECO_DEFAULT_COLOR, ...COLORS] }] : []),
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
            />
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
              value={tag.text}
              onChange={(event) => onTagChange({ text: event.currentTarget.value })}
            />
          </label>
          <label className="tag-field">
            <span className="control-label">{t("pages.citizenMaker.tagFontLabel")}</span>
            <select value={tag.fontFamily} onChange={(event) => onTagChange({ fontFamily: event.currentTarget.value })}>
              {TAG_FONTS.map((font) => (
                <option key={font.value} value={font.value}>{font.label}</option>
              ))}
            </select>
          </label>
          <SwatchRow
            className="color-swatches tag-color-swatches"
            label={t("pages.citizenMaker.tagColorLabel")}
            options={COLORS}
            selected={tag.color}
            onSelect={(color) => onTagChange({ color })}
          />
        </div>
      </div>
    </div>
  );
}
