import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { CitizenFigurePicker } from "src/components/citizen-lab/controls/CitizenFigurePicker";
import { CitizenPortrait } from "src/components/citizen-lab/portrait/CitizenPortrait";
import type { CitizenColors } from "src/components/citizen-lab/design/citizenTypes";
import { PreviewActions } from "src/components/citizen-lab/controls/PreviewActions";
import { ControlsPanel } from "src/components/citizen-lab/controls/ControlsPanel";
import { citizenOf, selectionOf } from "src/components/citizen-lab/design/citizenDesign";
import { hasPartGreen } from "src/components/citizen-lab/portrait/citizenAssets";
import { decoTint } from "src/components/citizen-lab/portrait/decoLayout";
import { useMediaQuery } from "src/hooks/useMediaQuery";
import { downloadCitizenPng, downloadCitizenSvg } from "src/components/citizen-lab/export/downloadCitizen";
import { useCitizenDesign } from "src/components/citizen-lab/useCitizenDesign";
import "src/components/citizen-lab/styles.css";

const MOBILE_QUERY = "(max-width: 720px)";

export function CitizenLabWorkbench() {
  const { t } = useTranslation();
  const portraitRef = useRef<SVGSVGElement>(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const { design, shownDesign, updateDesign, updateLogo, selectCitizen, cycleFeature, randomizeCitizen } =
    useCitizenDesign();
  const { features, colors, tag, logo } = design;
  const selectedCitizen = citizenOf(design);
  const selection = selectionOf(design);

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
            <PreviewActions
              logoStyle={logo.style}
              onToggleLogo={() => updateLogo({ style: logo.style === "none" ? "icon" : "none" })}
              onDownloadSvg={() => downloadCitizenSvg(portraitRef.current, `${selectedCitizen.id}-citizen.svg`)}
              onDownloadPng={() =>
                void downloadCitizenPng(portraitRef.current, `${selectedCitizen.id}-citizen.png`, shownDesign.tag.fontFamily)
              }
            />
          </div>
          {isMobile && <div className="quick-actions">{quickActions}</div>}
          <div className={`citizen-stage${design.hardToClassify ? " hard-to-classify" : ""}`}>
            <div className="stage-orbit orbit-one" />
            <div className="stage-orbit orbit-two" />
            <span className="stage-cross cross-one" aria-hidden="true">+</span>
            <span className="stage-cross cross-two" aria-hidden="true">+</span>
            <CitizenPortrait
              portraitRef={portraitRef}
              title={t("pages.citizenLab.portraitTitle", { name: citizenOf(shownDesign).name })}
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

        <ControlsPanel
          citizen={selectedCitizen}
          features={features}
          tag={tag}
          quickActions={isMobile ? null : quickActions}
          onCycleFeature={cycleFeature}
          onTagChange={(change) => updateDesign((current) => ({ tag: { ...current.tag, ...change } }))}
        />
      </div>
    </section>
  );
}
