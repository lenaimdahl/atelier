import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CitizenFigurePicker, DECO_DEFAULT_COLOR } from "src/components/citizen-maker/CitizenFigurePicker";
import { CitizenPortrait } from "src/components/citizen-maker/CitizenPortrait";
import { OptionCycler } from "src/components/citizen-maker/OptionCycler";
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

// Decos whose white parts can be tinted: chest badge and raised fist.
const COLORABLE_DECO_IDS = [2, 4];

function cycleOption(index: number, length: number, direction: -1 | 1) {
  return (index + direction + length) % length;
}

function randomIndex(length: number) {
  return Math.floor(Math.random() * length);
}

export function CitizenMakerWorkbench() {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<CitizenId>(CITIZENS[0].id);
  const portraitRef = useRef<SVGSVGElement>(null);
  const [bodyColor, setBodyColor] = useState(COLORS[0]);
  const [headColor, setHeadColor] = useState(COLORS[0]);
  const [hairColor, setHairColor] = useState(COLORS[0]);
  const [decoColor, setDecoColor] = useState(DECO_DEFAULT_COLOR);
  const [tagText, setTagText] = useState("");
  const [tagFontFamily, setTagFontFamily] = useState("Hack, monospace");
  const [tagColor, setTagColor] = useState("#ffbc40");
  const [headIndex, setHeadIndex] = useState(0);
  const [eyeIndex, setEyeIndex] = useState(0);
  const [noseIndex, setNoseIndex] = useState(4);
  const [hairIndex, setHairIndex] = useState<number>(CITIZENS[0].hairIndex);
  const [mouthIndex, setMouthIndex] = useState(1);
  const [decoIndex, setDecoIndex] = useState(0);
  const [isHardToClassify, setIsHardToClassify] = useState(false);
  const selectedCitizen = CITIZENS.find((citizen) => citizen.id === selectedId) ?? CITIZENS[0];

  function randomizeCitizen() {
    const otherCitizens = CITIZENS.filter((citizen) => citizen.id !== selectedId);
    const nextCitizen = otherCitizens[randomIndex(otherCitizens.length)];
    if (nextCitizen) {
      setSelectedId(nextCitizen.id);
    }
    setBodyColor(COLORS[randomIndex(COLORS.length)]);
    setHeadColor(COLORS[randomIndex(COLORS.length)]);
    setHairColor(COLORS[randomIndex(COLORS.length)]);
    setDecoColor(COLORS[randomIndex(COLORS.length)]);
    setHeadIndex(randomIndex(HEADS.length));
    setEyeIndex(randomIndex(EYES.length));
    setNoseIndex(randomIndex(NOSES.length));
    setHairIndex(randomIndex(HAIR.length));
    setMouthIndex(randomIndex(MOUTHS.length));
    setDecoIndex(randomIndex(DECO.length));
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
              bodyColor={bodyColor}
              headColor={headColor}
              hairColor={hairColor}
              decoColor={decoColor}
              tagText={tagText}
              tagFontFamily={tagFontFamily}
              tagColor={tagColor}
              bodyIndex={selectedCitizen.bodyIndex}
              hairIndex={hairIndex}
              headIndex={HEADS[headIndex].id}
              eyeIndex={EYES[eyeIndex].id}
              noseIndex={NOSES[noseIndex].id}
              mouthIndex={MOUTHS[mouthIndex].id}
              decoIndex={DECO[decoIndex].id}
            />
            <span className="stage-signal">{t("pages.citizenMaker.signal")}</span>
          </div>
          <CitizenFigurePicker
            selectedId={selectedId}
            colors={{ body: bodyColor, head: headColor, hair: hairColor, deco: decoColor }}
            showDecoColor={COLORABLE_DECO_IDS.includes(DECO[decoIndex].id)}
            tagText={tagText}
            tagFontFamily={tagFontFamily}
            tagColor={tagColor}
            onSelectFigure={(citizen) => {
              setSelectedId(citizen.id);
              setHairIndex(citizen.hairIndex);
            }}
            onSelectColor={(part, color) => {
              if (part === "body") {
                setBodyColor(color);
              } else if (part === "head") {
                setHeadColor(color);
              } else if (part === "deco") {
                setDecoColor(color);
              } else {
                setHairColor(color);
              }
            }}
            onTagTextChange={setTagText}
            onTagFontChange={setTagFontFamily}
            onTagColorChange={setTagColor}
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
            <OptionCycler
              label={t("pages.citizenMaker.featureLabels.head")}
              value={t("pages.citizenMaker.optionNumber", { number: HEADS[headIndex].number })}
              previousLabel={t("pages.citizenMaker.previousOption", { option: t("pages.citizenMaker.featureLabels.head") })}
              nextLabel={t("pages.citizenMaker.nextOption", { option: t("pages.citizenMaker.featureLabels.head") })}
              onPrevious={() => setHeadIndex((index) => cycleOption(index, HEADS.length, -1))}
              onNext={() => setHeadIndex((index) => cycleOption(index, HEADS.length, 1))}
            />
            <OptionCycler
              label={t("pages.citizenMaker.featureLabels.eyes")}
              value={t("pages.citizenMaker.optionNumber", { number: EYES[eyeIndex].number })}
              previousLabel={t("pages.citizenMaker.previousOption", { option: t("pages.citizenMaker.featureLabels.eyes") })}
              nextLabel={t("pages.citizenMaker.nextOption", { option: t("pages.citizenMaker.featureLabels.eyes") })}
              onPrevious={() => setEyeIndex((index) => cycleOption(index, EYES.length, -1))}
              onNext={() => setEyeIndex((index) => cycleOption(index, EYES.length, 1))}
            />
            <OptionCycler
              label={t("pages.citizenMaker.featureLabels.nose")}
              value={t("pages.citizenMaker.optionNumber", { number: NOSES[noseIndex].number })}
              previousLabel={t("pages.citizenMaker.previousOption", { option: t("pages.citizenMaker.featureLabels.nose") })}
              nextLabel={t("pages.citizenMaker.nextOption", { option: t("pages.citizenMaker.featureLabels.nose") })}
              onPrevious={() => setNoseIndex((index) => cycleOption(index, NOSES.length, -1))}
              onNext={() => setNoseIndex((index) => cycleOption(index, NOSES.length, 1))}
            />
            <OptionCycler
              label={t("pages.citizenMaker.featureLabels.hair")}
              value={t("pages.citizenMaker.optionNumber", { number: HAIR[hairIndex].number })}
              previousLabel={t("pages.citizenMaker.previousOption", { option: t("pages.citizenMaker.featureLabels.hair") })}
              nextLabel={t("pages.citizenMaker.nextOption", { option: t("pages.citizenMaker.featureLabels.hair") })}
              onPrevious={() => setHairIndex((index) => cycleOption(index, HAIR.length, -1))}
              onNext={() => setHairIndex((index) => cycleOption(index, HAIR.length, 1))}
            />
            <OptionCycler
              label={t("pages.citizenMaker.featureLabels.mouth")}
              value={t("pages.citizenMaker.optionNumber", { number: MOUTHS[mouthIndex].number })}
              previousLabel={t("pages.citizenMaker.previousOption", { option: t("pages.citizenMaker.featureLabels.mouth") })}
              nextLabel={t("pages.citizenMaker.nextOption", { option: t("pages.citizenMaker.featureLabels.mouth") })}
              onPrevious={() => setMouthIndex((index) => cycleOption(index, MOUTHS.length, -1))}
              onNext={() => setMouthIndex((index) => cycleOption(index, MOUTHS.length, 1))}
            />
            <OptionCycler
              label={t("pages.citizenMaker.featureLabels.deco")}
              value={t("pages.citizenMaker.optionNumber", { number: DECO[decoIndex].number })}
              previousLabel={t("pages.citizenMaker.previousOption", { option: t("pages.citizenMaker.featureLabels.deco") })}
              nextLabel={t("pages.citizenMaker.nextOption", { option: t("pages.citizenMaker.featureLabels.deco") })}
              onPrevious={() => setDecoIndex((index) => cycleOption(index, DECO.length, -1))}
              onNext={() => setDecoIndex((index) => cycleOption(index, DECO.length, 1))}
            />
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