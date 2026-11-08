import { useTranslation } from "react-i18next";
import { CitizenMakerWorkbench } from "src/components/citizen-maker/CitizenMakerWorkbench";
import { RocketIllustration } from "src/components/citizen-maker/RocketIllustration";
import "src/pages/citizen-maker.css";

function CitizenMaker() {
  const { t } = useTranslation();

  return (
    <main className="citizen-page">
      <section className="citizen-intro">
        <div className="citizen-intro-copy">
          <p className="citizen-eyebrow">{t("pages.citizenMaker.eyebrow")}</p>
          <h1>
            {t("pages.citizenMaker.titleFirstLine")}
            <span>{t("pages.citizenMaker.titleSecondLine")}</span>
          </h1>
          <p className="citizen-lede">{t("pages.citizenMaker.description")}</p>
          <div className="citizen-status">
            <span>{t("pages.citizenMaker.newCitizen")}</span>
            <span>{t("pages.citizenMaker.classification")}</span>
          </div>
        </div>
        <div className="rocket-scene">
          <RocketIllustration />
          <span>{t("pages.citizenMaker.rocketLabel")}</span>
        </div>
      </section>
      <CitizenMakerWorkbench />

      <footer className="citizen-footer">
        <span>{t("pages.citizenMaker.footerTitle")}</span>
        <span>{t("pages.citizenMaker.privacyNote")}</span>
      </footer>
    </main>
  );
}

export default CitizenMaker;