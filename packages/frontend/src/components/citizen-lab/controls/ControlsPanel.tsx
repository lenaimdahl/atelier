import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { OptionCycler } from "src/components/citizen-lab/controls/OptionCycler";
import { TagControls } from "src/components/citizen-lab/controls/TagControls";
import { FEATURES, type Citizen, type Feature } from "src/components/citizen-lab/design/citizenLabOptions";
import type { CitizenDesign } from "src/components/citizen-lab/design/citizenShareState";
import type { CitizenTag } from "src/components/citizen-lab/design/citizenTypes";
import "src/components/citizen-lab/shared.css";
import "src/components/citizen-lab/controls/ControlsPanel.css";

interface ControlsPanelProps {
  citizen: Citizen;
  features: CitizenDesign["features"];
  tag: CitizenTag;
  quickActions: ReactNode;
  onCycleFeature: (feature: Feature, length: number, direction: -1 | 1) => void;
  onTagChange: (change: Partial<CitizenTag>) => void;
}

export function ControlsPanel({ citizen, features, tag, quickActions, onCycleFeature, onTagChange }: ControlsPanelProps) {
  const { t } = useTranslation();
  return (
    <aside className="citizen-controls">
      <p className="citizen-eyebrow">{t("pages.citizenLab.parameters")}</p>
      <h2>{t("pages.citizenLab.controlsTitle")}</h2>
      <div className="control-group">
        <span className="control-label">{t("pages.citizenLab.figureType")}</span>
        <div className="control-readout">
          <span>{citizen.name}</span>
          <span>{t(citizen.typeKey)}</span>
        </div>
      </div>
      <div className="feature-cyclers">
        {FEATURES.map(({ key, options }) => {
          const label = t(`pages.citizenLab.featureLabels.${key}`);
          return (
            <OptionCycler
              key={key}
              label={label}
              value={t("pages.citizenLab.optionNumber", { number: options[features[key]].number })}
              previousLabel={t("pages.citizenLab.previousOption", { option: label })}
              nextLabel={t("pages.citizenLab.nextOption", { option: label })}
              onPrevious={() => onCycleFeature(key, options.length, -1)}
              onNext={() => onCycleFeature(key, options.length, 1)}
            />
          );
        })}
      </div>
      {quickActions}
      <TagControls tag={tag} onTagChange={onTagChange} />
    </aside>
  );
}
