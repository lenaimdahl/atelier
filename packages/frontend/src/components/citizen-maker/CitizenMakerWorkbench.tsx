import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CitizenFigurePicker, DECO_DEFAULT_COLOR } from "src/components/citizen-maker/CitizenFigurePicker";
import { CitizenPortrait, type CitizenColors, type CitizenTag } from "src/components/citizen-maker/CitizenPortrait";
import { OptionCycler } from "src/components/citizen-maker/OptionCycler";
import { isTintableDeco, type CitizenSelection } from "src/components/citizen-maker/citizenLayout";
import { downloadCitizenSvg } from "src/components/citizen-maker/downloadCitizenSvg";
import {
  CITIZENS,
  COLORS,
  DECO,
  EYES,
  HAIR,
  HEADS,
  MOUTHS,
  NOSES,
  type CitizenId,
} from "src/pages/citizenMakerOptions";

// Cyclable features in display order. State stores each feature's position in its option list;
// the portrait receives the option's asset id.
const FEATURES = [
  { key: "head", options: HEADS },
  { key: "eyes", options: EYES },
  { key: "nose", options: NOSES },
  { key: "hair", options: HAIR },
  { key: "mouth", options: MOUTHS },
  { key: "deco", options: DECO },
] as const;

type Feature = (typeof FEATURES)[number]["key"];
type FeaturePositions = Record<Feature, number>;
type Citizen = (typeof CITIZENS)[number];

function cycleOption(index: number, length: number, direction: -1 | 1) {
  return (index + direction + length) % length;
}

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

function randomColor() {
  return COLORS[randomIndex(COLORS.length)];
}

function hairPosition(citizen: Citizen) {
  return Math.max(0, HAIR.findIndex((hair) => hair.id === citizen.hairId));
}

export function CitizenMakerWorkbench() {
  const { t } = useTranslation();
  const portraitRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<CitizenId>(CITIZENS[0].id);
  const [features, setFeatures] = useState<FeaturePositions>({
    head: 0,
    eyes: 0,
    nose: 4,
    hair: hairPosition(CITIZENS[0]),
    mouth: 1,
    deco: 0,
  });
  const [colors, setColors] = useState<CitizenColors>({
    body: COLORS[0],
    head: COLORS[0],
    hair: COLORS[0],
    deco: DECO_DEFAULT_COLOR,
  });
  const [tag, setTag] = useState<CitizenTag>({ text: "", fontFamily: "Hack, monospace", color: "#ffbc40" });
  const [isHardToClassify, setIsHardToClassify] = useState(false);
  const selectedCitizen = CITIZENS.find((citizen) => citizen.id === selectedId) ?? CITIZENS[0];

  const selection: CitizenSelection = {
    bodyId: selectedCitizen.bodyId,
    headId: HEADS[features.head].id,
    hairId: HAIR[features.hair].id,
    eyeId: EYES[features.eyes].id,
    noseId: NOSES[features.nose].id,
    mouthId: MOUTHS[features.mouth].id,
    decoId: DECO[features.deco].id,
  };

  function selectCitizen(citizen: Citizen) {
    setSelectedId(citizen.id);
    setFeatures((current) => ({ ...current, hair: hairPosition(citizen) }));
  }

  function cycleFeature(feature: Feature, length: number, direction: -1 | 1) {
    setFeatures((current) => ({ ...current, [feature]: cycleOption(current[feature], length, direction) }));
  }

  function randomizeCitizen() {
    const otherCitizens = CITIZENS.filter((citizen) => citizen.id !== selectedId);
    const nextCitizen = otherCitizens[randomIndex(otherCitizens.length)];
    if (nextCitizen) {
      setSelectedId(nextCitizen.id);
    }
    setColors({ body: randomColor(), head: randomColor(), hair: randomColor(), deco: randomColor() });
    setFeatures(
      Object.fromEntries(FEATURES.map(({ key, options }) => [key, randomIndex(options.length)])) as FeaturePositions,
    );
  }

  return (
    <section className="citizen-workbench" aria-labelledby="citizen-workbench-title">
      <header className="workbench-bar">
        <h2 id="citizen-workbench-title">{t("pages.citizenMaker.workbench")}</h2>
        <span>{t("pages.citizenMaker.localSession")}</span>
      </header>
      <div className="workbench-grid">
        <section className="preview-column" aria-label={t("pages.citizenMaker.previewLabel")}>
          <div className="preview-heading">
            <span>{t("pages.citizenMaker.previewLabel")}</span>
            <div className="preview-actions">
              <span>{t("pages.citizenMaker.mood")}</span>
              <button
                className="download-svg-button"
                type="button"
                onClick={() => downloadCitizenSvg(portraitRef.current, `${selectedCitizen.id}-citizen.svg`)}
              >
                {t("pages.citizenMaker.downloadSvg")}
              </button>
            </div>
          </div>
          <div className={`citizen-stage${isHardToClassify ? " hard-to-classify" : ""}`}>
            <div className="stage-orbit orbit-one" />
            <div className="stage-orbit orbit-two" />
            <span className="stage-cross cross-one" aria-hidden="true">+</span>
            <span className="stage-cross cross-two" aria-hidden="true">+</span>
            <CitizenPortrait
              portraitRef={portraitRef}
              citizenName={selectedCitizen.name}
              selection={selection}
              colors={colors}
              tag={tag}
            />
            <span className="stage-signal">{t("pages.citizenMaker.signal")}</span>
          </div>
          <CitizenFigurePicker
            selectedId={selectedId}
            colors={colors}
            showDecoColor={isTintableDeco(selection.decoId)}
            tag={tag}
            onSelectFigure={selectCitizen}
            onSelectColor={(part, color) => setColors((current) => ({ ...current, [part]: color }))}
            onTagChange={(change) => setTag((current) => ({ ...current, ...change }))}
          />
        </section>

        <aside className="citizen-controls">
          <p className="citizen-eyebrow">{t("pages.citizenMaker.parameters")}</p>
          <h2>{t("pages.citizenMaker.controlsTitle")}</h2>
          <div className="control-group">
            <span className="control-label">{t("pages.citizenMaker.figureType")}</span>
            <div className="control-readout">
              <span>{selectedCitizen.name}</span>
              <span>{t(selectedCitizen.typeKey)}</span>
            </div>
          </div>
          <div className="feature-cyclers">
            {FEATURES.map(({ key, options }) => {
              const label = t(`pages.citizenMaker.featureLabels.${key}`);
              return (
                <OptionCycler
                  key={key}
                  label={label}
                  value={t("pages.citizenMaker.optionNumber", { number: options[features[key]].number })}
                  previousLabel={t("pages.citizenMaker.previousOption", { option: label })}
                  nextLabel={t("pages.citizenMaker.nextOption", { option: label })}
                  onPrevious={() => cycleFeature(key, options.length, -1)}
                  onNext={() => cycleFeature(key, options.length, 1)}
                />
              );
            })}
          </div>
          <label className="classification-toggle">
            <input
              type="checkbox"
              checked={isHardToClassify}
              onChange={(event) => setIsHardToClassify(event.currentTarget.checked)}
            />
            <span>{t("pages.citizenMaker.hardToClassify")}</span>
          </label>
          <button className="randomize-button" type="button" onClick={randomizeCitizen}>
            <span aria-hidden="true">*</span>
            {t("pages.citizenMaker.randomize")}
          </button>
        </aside>
      </div>
    </section>
  );
}
