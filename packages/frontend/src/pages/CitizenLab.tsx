import { useTranslation } from "react-i18next";
import { CitizenLabWorkbench } from "src/components/citizen-lab/CitizenLabWorkbench";
import { RocketIllustration } from "src/components/citizen-lab/RocketIllustration";
import "src/pages/citizen-lab.css";
import "src/components/citizen-lab/shared.css";

function CitizenLab() {
  const { t } = useTranslation();

  return (
    <main className="citizen-page">
      <section className="citizen-intro">
        <div className="citizen-intro-copy">
          <p className="citizen-eyebrow">{t("pages.citizenLab.eyebrow")}</p>
          <h1>
            {t("pages.citizenLab.titleFirstLine")}
            <span>{t("pages.citizenLab.titleSecondLine")}</span>
          </h1>
          <p className="citizen-lede">{t("pages.citizenLab.description")}</p>
          <div className="citizen-status">
            <span>{t("pages.citizenLab.newCitizen")}</span>
            <span>{t("pages.citizenLab.classification")}</span>
          </div>
        </div>
        <div className="rocket-scene">
          <RocketIllustration />
          <span>{t("pages.citizenLab.rocketLabel")}</span>
        </div>
      </section>
      <CitizenLabWorkbench />

      <footer className="citizen-footer">
        <span>{t("pages.citizenLab.footerTitle")}</span>
        <span>{t("pages.citizenLab.privacyNote")}</span>
      </footer>
    </main>
  );
}

export default CitizenLab;