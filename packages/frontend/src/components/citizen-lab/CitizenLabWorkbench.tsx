import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { CitizenFigurePicker } from "src/components/citizen-lab/CitizenFigurePicker";
import { CitizenPortrait, type CitizenColors, type CitizenLogo, type CitizenTag } from "src/components/citizen-lab/CitizenPortrait";
import { OptionCycler } from "src/components/citizen-lab/OptionCycler";
import { TagControls } from "src/components/citizen-lab/TagControls";
import { decodeAsset, hasPartGreen, portraitUrls, predecodeAssets } from "src/components/citizen-lab/citizenAssets";
import { decoTint, type CitizenSelection } from "src/components/citizen-lab/citizenLayout";
import {
  DEFAULT_DESIGN,
  designFromSearchParams,
  designToSearchParams,
  hairPositionFor,
  type CitizenDesign,
} from "src/components/citizen-lab/citizenShareState";
import { useMediaQuery } from "src/hooks/useMediaQuery";
import { downloadCitizenPng, downloadCitizenSvg } from "src/components/citizen-lab/downloadCitizen";
import { CITIZENS, COLORS, FEATURES, featureOptionId, type CitizenId, type Feature } from "src/pages/citizenLabOptions";

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

const MOBILE_QUERY = "(max-width: 720px)";

function citizenOf(design: CitizenDesign) {
  return CITIZENS.find((citizen) => citizen.id === design.citizenId) ?? CITIZENS[0];
}

function selectionOf(design: CitizenDesign): CitizenSelection {
  return {
    bodyId: citizenOf(design).bodyId,
    headId: featureOptionId("head", design.features.head),
    eyeId: featureOptionId("eyes", design.features.eyes),
    noseId: featureOptionId("nose", design.features.nose),
    hairId: featureOptionId("hair", design.features.hair),
    mouthId: featureOptionId("mouth", design.features.mouth),
    decoId: featureOptionId("deco", design.features.deco),
  };
}

function randomParts(currentCitizenId?: CitizenId): Pick<CitizenDesign, "citizenId" | "colors" | "features"> {
  const otherCitizens = CITIZENS.filter((citizen) => citizen.id !== currentCitizenId);
  const head = randomColor();
  const contrastColors = COLORS.filter((color) => color !== head);
  const contrastColor = () => contrastColors[randomIndex(contrastColors.length)];
  return {
    citizenId: otherCitizens[randomIndex(otherCitizens.length)].id,
    colors: {
      body: randomColor(),
      head,
      hair: randomColor(),
      deco: randomColor(),
      eyes: contrastColor(),
      nose: contrastColor(),
      mouth: contrastColor(),
    },
    features: Object.fromEntries(
      FEATURES.map(({ key, options }) => [key, randomIndex(options.length)]),
    ) as CitizenDesign["features"],
  };
}

export function CitizenLabWorkbench() {
  const { t } = useTranslation();
  const portraitRef = useRef<SVGSVGElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [design, setDesign] = useState<CitizenDesign>(() =>
    searchParams.toString() === "" ? { ...DEFAULT_DESIGN, ...randomParts() } : designFromSearchParams(searchParams),
  );
  const { features, colors, tag, logo } = design;
  const selectedCitizen = citizenOf(design);

  useEffect(() => {
    void predecodeAssets();
  }, []);

  useEffect(() => {
    const nextParams = designToSearchParams(design);
    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [design, searchParams, setSearchParams]);

  const selection = selectionOf(design);

  // Swapping in a design only after its images are decoded keeps parts from flashing empty.
  const [shownDesign, setShownDesign] = useState(design);
  useEffect(() => {
    let current = true;
    const urls = Object.values(portraitUrls(selectionOf(design), design.colors, design.logo));
    void Promise.all(urls.filter((url) => url !== null).map(decodeAsset)).then(() => {
      if (current) {
        setShownDesign(design);
      }
    });
    return () => {
      current = false;
    };
  }, [design]);

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
    updateDesign(() => randomParts(design.citizenId));
  }

  const quickActions = (
    <>
      <label className="classification-toggle">
        <input
          type="checkbox"
          checked={design.hardToClassify}
          onChange={(event) => {
            const hardToClassify = event.currentTarget.checked;
            updateDesign(() => ({ hardToClassify }));
          }}
        />
        <span>{t("pages.citizenLab.hardToClassify")}</span>
      </label>
      <button className="randomize-button" type="button" onClick={randomizeCitizen}>
        <span aria-hidden="true">*</span>
        {t("pages.citizenLab.randomize")}
      </button>
    </>
  );

  return (
    <section className="citizen-workbench" aria-labelledby="citizen-workbench-title">
      <header className="workbench-bar">
        <h2 id="citizen-workbench-title">{t("pages.citizenLab.workbench")}</h2>
        <span>{t("pages.citizenLab.localSession")}</span>
      </header>
      <div className="workbench-grid">
        <section className="preview-column" aria-label={t("pages.citizenLab.previewLabel")}>
          <div className="preview-heading">
            <span>{t("pages.citizenLab.previewLabel")}</span>
            <div className="preview-actions">
              <span>{t("pages.citizenLab.mood")}</span>
              <button
                className="download-svg-button"
                type="button"
                aria-pressed={logo.style !== "none"}
                onClick={() => updateLogo({ style: logo.style === "none" ? "icon" : "none" })}
              >
                {logo.style === "none" ? t("pages.citizenLab.addLogo") : t("pages.citizenLab.removeLogo")}
              </button>
              <button
                className="download-svg-button"
                type="button"
                onClick={() => downloadCitizenSvg(portraitRef.current, `${selectedCitizen.id}-citizen.svg`)}
              >
                {t("pages.citizenLab.downloadSvg")}
              </button>
              <button
                className="download-svg-button"
                type="button"
                onClick={() =>
                  void downloadCitizenPng(portraitRef.current, `${selectedCitizen.id}-citizen.png`, shownDesign.tag.fontFamily)
                }
              >
                {t("pages.citizenLab.downloadPng")}
              </button>
            </div>
          </div>
          {isMobile && <div className="quick-actions">{quickActions}</div>}
          <div className={`citizen-stage${design.hardToClassify ? " hard-to-classify" : ""}`}>
            <div className="stage-orbit orbit-one" />
            <div className="stage-orbit orbit-two" />
            <span className="stage-cross cross-one" aria-hidden="true">+</span>
            <span className="stage-cross cross-two" aria-hidden="true">+</span>
            <CitizenPortrait
              portraitRef={portraitRef}
              citizenName={citizenOf(shownDesign).name}
              selection={selectionOf(shownDesign)}
              colors={shownDesign.colors}
              tag={shownDesign.tag}
              logo={shownDesign.logo}
              tilted={shownDesign.hardToClassify}
            />
            <span className="stage-signal">{t("pages.citizenLab.signal")}</span>
          </div>
          <CitizenFigurePicker
            selectedId={design.citizenId}
            colors={colors}
            decoOriginalColor={decoTint(selection.decoId)?.originalColor}
            recolorableParts={{
              eyes: hasPartGreen(`Eyes/Eyes${selection.eyeId}.svg`),
              nose: hasPartGreen(`Noses/Nose${selection.noseId}.svg`),
              mouth: hasPartGreen(`Mouths/Mouth${selection.mouthId}.svg`),
            }}
            logo={logo}
            onLogoChange={updateLogo}
            onSelectFigure={selectCitizen}
            onSelectColor={(part: keyof CitizenColors, color) =>
              updateDesign((current) => ({ colors: { ...current.colors, [part]: color } }))
            }
          />
        </section>

        <aside className="citizen-controls">
          <p className="citizen-eyebrow">{t("pages.citizenLab.parameters")}</p>
          <h2>{t("pages.citizenLab.controlsTitle")}</h2>
          <div className="control-group">
            <span className="control-label">{t("pages.citizenLab.figureType")}</span>
            <div className="control-readout">
              <span>{selectedCitizen.name}</span>
              <span>{t(selectedCitizen.typeKey)}</span>
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
                  onPrevious={() => cycleFeature(key, options.length, -1)}
                  onNext={() => cycleFeature(key, options.length, 1)}
                />
              );
            })}
          </div>
          {!isMobile && quickActions}
          <TagControls
            tag={tag}
            onTagChange={(change: Partial<CitizenTag>) => updateDesign((current) => ({ tag: { ...current.tag, ...change } }))}
          />
        </aside>
      </div>
    </section>
  );
}
