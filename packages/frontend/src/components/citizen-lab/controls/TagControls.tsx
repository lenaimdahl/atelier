import { useTranslation } from "react-i18next";
import type { CitizenTag } from "src/components/citizen-lab/design/citizenTypes";
import { SwatchRow } from "src/components/citizen-lab/controls/SwatchRow";
import { TAG_MAX_LENGTH } from "src/components/citizen-lab/design/citizenShareState";
import { TAG_COLORS, TAG_FONTS } from "src/components/citizen-lab/design/citizenLabOptions";

type TagControlsProps = {
  tag: CitizenTag;
  onTagChange: (change: Partial<CitizenTag>) => void;
};

export function TagControls({ tag, onTagChange }: TagControlsProps) {
  const { t } = useTranslation();
  return (
    <div className="tag-controls">
      <label className="tag-field">
        <span className="control-label">{t("pages.citizenLab.tagTextLabel")}</span>
        <input
          type="text"
          maxLength={TAG_MAX_LENGTH}
          placeholder={t("pages.citizenLab.tagTextPlaceholder")}
          value={tag.text}
          onChange={(event) => onTagChange({ text: event.currentTarget.value })}
        />
      </label>
      <label className="tag-field">
        <span className="control-label">{t("pages.citizenLab.tagFontLabel")}</span>
        <select value={tag.fontFamily} onChange={(event) => onTagChange({ fontFamily: event.currentTarget.value })}>
          {TAG_FONTS.map((font) => (
            <option key={font.value} value={font.value}>{font.label}</option>
          ))}
        </select>
      </label>
      <SwatchRow
        className="color-swatches tag-color-swatches"
        label={t("pages.citizenLab.tagColorLabel")}
        options={TAG_COLORS}
        selected={tag.color}
        onSelect={(color) => onTagChange({ color })}
      />
    </div>
  );
}
