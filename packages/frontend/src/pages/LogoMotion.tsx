import { useTranslation } from "react-i18next";
import { VariantCard } from "src/features/logo-motion/VariantCard";
import "src/pages/logo-motion.css";

const VARIANTS = ["ledWall", "assembly", "glitch"] as const;

const LogoMotion = () => {
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
          <VariantCard key={variant} variant={variant} />
        ))}
      </ul>
    </main>
  );
};

export default LogoMotion;
