import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { CitizenFigurePicker } from "src/components/citizen-lab/controls/CitizenFigurePicker";
import { CitizenPortrait } from "src/components/citizen-lab/portrait/CitizenPortrait";
import type { CitizenColors, CitizenLogo, CitizenTag } from "src/components/citizen-lab/design/citizenTypes";
import { OptionCycler } from "src/components/citizen-lab/controls/OptionCycler";
import { TagControls } from "src/components/citizen-lab/controls/TagControls";
import { citizenOf, cycleOption, randomParts, selectionOf } from "src/components/citizen-lab/design/citizenDesign";
import { decodeAsset, hasPartGreen, portraitUrls, predecodeAssets } from "src/components/citizen-lab/portrait/citizenAssets";
import { decoTint } from "src/components/citizen-lab/portrait/citizenLayout";
import {
  DEFAULT_DESIGN,
  decodeDesign,
  encodeDesign,
  hairPositionFor,
  type CitizenDesign,
} from "src/components/citizen-lab/design/citizenShareState";
import { useMediaQuery } from "src/hooks/useMediaQuery";
import { downloadCitizenPng, downloadCitizenSvg } from "src/components/citizen-lab/export/downloadCitizen";
import { CITIZENS, FEATURES, type Feature } from "src/components/citizen-lab/design/citizenLabOptions";

type Citizen = (typeof CITIZENS)[number];

const MOBILE_QUERY = "(max-width: 720px)";

export function CitizenLabWorkbench() {
  const { t } = useTranslation();
  const portraitRef = useRef<SVGSVGElement>(null);
  const { code } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [design, setDesign] = useState<CitizenDesign>(
    () => (code ? decodeDesign(code) : null) ?? { ...DEFAULT_DESIGN, ...randomParts() },
  );
  const { features, colors, tag, logo } = design;
  const selectedCitizen = citizenOf(design);

  useEffect(() => {
    void predecodeAssets();
  }, []);

  useEffect(() => {
    const nextCode = encodeDesign(design);
    if (nextCode !== code) {
      void navigate(`/citizen-lab/${nextCode}`, { replace: true });
    }
  }, [design, code, navigate]);

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
                className="lab-button"
                type="button"
                aria-pressed={logo.style !== "none"}
                onClick={() => updateLogo({ style: logo.style === "none" ? "icon" : "none" })}
              >
                {logo.style === "none" ? t("pages.citizenLab.addLogo") : t("pages.citizenLab.removeLogo")}
              </button>
              <button
                className="lab-button"
                type="button"
                onClick={() => downloadCitizenSvg(portraitRef.current, `${selectedCitizen.id}-citizen.svg`)}
              >
                {t("pages.citizenLab.downloadSvg")}
              </button>
              <button
                className="lab-button"
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
