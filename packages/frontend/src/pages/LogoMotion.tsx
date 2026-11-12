import { useTranslation } from "react-i18next";
import "src/pages/logo-motion.css";

const VARIANTS = ["ledWall", "assembly", "glitch"] as const;

export const LogoMotion = () => {
  const { t } = useTranslation();

  return (
    <main className="logo-motion-page">
      <section className="logo-motion-intro">
        <p className="logo-motion-eyebrow">{t("pages.logoMotion.eyebrow")}</p>
        <h1>{t("pages.logoMotion.title")}</h1>
        <p>{t("pages.logoMotion.description")}</p>
      </section>

      <ul className="logo-motion-grid">
        {VARIANTS.map((variant) => (
          <li key={variant} className="logo-motion-card">
            <div className="logo-motion-stage" />
            <div className="logo-motion-card-text">
              <h2>{t(`pages.logoMotion.variants.${variant}.title`)}</h2>
              <p>{t(`pages.logoMotion.variants.${variant}.description`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};
