import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

const identity = (color: string) => color;

export function SwatchRow({
  className,
  label,
  options,
  selected,
  onSelect,
  swatchLabel,
  displayColor = identity,
}: {
  className: string;
  label: string;
  options: readonly string[];
  selected: string;
  onSelect: (color: string) => void;
  /** Accessible name for a swatch; defaults to its color value. */
  swatchLabel?: (color: string) => string;
  /** Color shown on the swatch; defaults to its value (used for the deco's "original" swatch). */
  displayColor?: (color: string) => string;
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
          style={{ "--swatch-color": displayColor(color) } as CSSProperties}
          aria-label={t("pages.citizenMaker.colorPartOption", { part: label, color: swatchLabel?.(color) ?? color })}
          aria-pressed={selected === color}
          onClick={() => onSelect(color)}
        />
      ))}
    </fieldset>
  );
}
