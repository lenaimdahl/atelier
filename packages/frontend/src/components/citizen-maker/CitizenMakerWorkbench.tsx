import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { CitizenFigurePicker } from "src/components/citizen-maker/CitizenFigurePicker";
import { CitizenPortrait, type CitizenColors, type CitizenLogo, type CitizenTag } from "src/components/citizen-maker/CitizenPortrait";
import { OptionCycler } from "src/components/citizen-maker/OptionCycler";
import { TagControls } from "src/components/citizen-maker/TagControls";
import { predecodeAssets } from "src/components/citizen-maker/citizenAssets";
import { decoTint, type CitizenSelection } from "src/components/citizen-maker/citizenLayout";
import {
  designFromSearchParams,
  designToSearchParams,
  hairPositionFor,
  type CitizenDesign,
} from "src/components/citizen-maker/citizenShareState";
import { downloadCitizenSvg } from "src/components/citizen-maker/downloadCitizenSvg";
import { CITIZENS, COLORS, FEATURES, featureOptionId, type Feature } from "src/pages/citizenMakerOptions";

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

export function CitizenMakerWorkbench() {
  const { t } = useTranslation();
  const portraitRef = useRef<SVGSVGElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [design, setDesign] = useState<CitizenDesign>(() => designFromSearchParams(searchParams));
  const { features, colors, tag, logo } = design;
  const selectedCitizen = CITIZENS.find((citizen) => citizen.id === design.citizenId) ?? CITIZENS[0];

  useEffect(() => {
    void predecodeAssets();
  }, []);

  useEffect(() => {
    const nextParams = designToSearchParams(design);
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [design, searchParams, setSearchParams]);

  const selection: CitizenSelection = {
    bodyId: selectedCitizen.bodyId,
    headId: featureOptionId("head", features.head),
    eyeId: featureOptionId("eyes", features.eyes),
    noseId: featureOptionId("nose", features.nose),
    hairId: featureOptionId("hair", features.hair),
    mouthId: featureOptionId("mouth", features.mouth),
    decoId: featureOptionId("deco", features.deco),
  };

  function updateDesign(change: (current: CitizenDesign) => Partial<CitizenDesign>) {
    setDesign((current) => ({ ...current, ...change(current) }));
  }

  function updateLogo(change: Partial<CitizenLogo>) {
    updateDesign((current) => ({ logo: { ...current.logo, ...change } }));
  }

  function selectCitizen(citizen: Citizen) {
    updateDesign((current) => ({
      citizenId: citizen.id,
      features: { ...current.features, hair: hairPositionFor(citizen) },
    }));
  }

  function cycleFeature(feature: Feature, length: number, direction: -1 | 1) {
    updateDesign((current) => ({
      features: { ...current.features, [feature]: cycleOption(current.features[feature], length, direction) },
    }));
  }

  function randomizeCitizen() {
    const otherCitizens = CITIZENS.filter((citizen) => citizen.id !== design.citizenId);
    const nextCitizen = otherCitizens[randomIndex(otherCitizens.length)] ?? selectedCitizen;
    updateDesign(() => ({
      citizenId: nextCitizen.id,
      colors: { body: randomColor(), head: randomColor(), hair: randomColor(), deco: randomColor() },
      features: Object.fromEntries(
        FEATURES.map(({ key, options }) => [key, randomIndex(options.length)]),
      ) as CitizenDesign["features"],
    }));
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
                aria-pressed={logo.style !== "none"}
                onClick={() => updateLogo({ style: logo.style === "none" ? "icon" : "none" })}
              >
                {logo.style === "none" ? t("pages.citizenMaker.addLogo") : t("pages.citizenMaker.removeLogo")}
              </button>
              <button
                className="download-svg-button"
                type="button"
                onClick={() => downloadCitizenSvg(portraitRef.current, `${selectedCitizen.id}-citizen.svg`)}
              >
                {t("pages.citizenMaker.downloadSvg")}
              </button>
            </div>
          </div>
          <div className={`citizen-stage${design.hardToClassify ? " hard-to-classify" : ""}`}>
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
              logo={logo}
            />
            <span className="stage-signal">{t("pages.citizenMaker.signal")}</span>
          </div>
          <CitizenFigurePicker
            selectedId={design.citizenId}
            colors={colors}
            decoOriginalColor={decoTint(selection.decoId)?.originalColor}
            logo={logo}
            onLogoChange={updateLogo}
            onSelectFigure={selectCitizen}
            onSelectColor={(part: keyof CitizenColors, color) =>
              updateDesign((current) => ({ colors: { ...current.colors, [part]: color } }))
            }
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
              checked={design.hardToClassify}
              onChange={(event) => {
                const hardToClassify = event.currentTarget.checked;
                updateDesign(() => ({ hardToClassify }));
              }}
            />
            <span>{t("pages.citizenMaker.hardToClassify")}</span>
          </label>
          <button className="randomize-button" type="button" onClick={randomizeCitizen}>
            <span aria-hidden="true">*</span>
            {t("pages.citizenMaker.randomize")}
          </button>
          <TagControls
            tag={tag}
            onTagChange={(change: Partial<CitizenTag>) => updateDesign((current) => ({ tag: { ...current.tag, ...change } }))}
          />
        </aside>
      </div>
    </section>
  );
}
