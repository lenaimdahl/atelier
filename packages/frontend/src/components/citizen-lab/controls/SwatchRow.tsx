import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import "src/components/citizen-lab/shared.css";
import "src/components/citizen-lab/controls/SwatchRow.css";

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
  swatchLabel?: (color: string) => string;
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
          aria-label={t("pages.citizenLab.colorPartOption", { part: label, color: swatchLabel?.(color) ?? color })}
          aria-pressed={selected === color}
          onClick={() => onSelect(color)}
        />
      ))}
    </fieldset>
  );
}
