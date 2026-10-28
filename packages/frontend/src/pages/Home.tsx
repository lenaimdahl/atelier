import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const STACK = [
  "React",
  "TypeScript",
  "Vite",
  "pnpm workspaces",
  "Go",
  "PostgreSQL",
  "Open Library API",
  "Docker",
];

function Home() {
  const { t } = useTranslation();

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">{t("pages.home.eyebrow")}</p>
          <h1>{t("pages.home.title")}</h1>
          <p className="landing-subtitle">{t("pages.home.subTitle")}</p>
          <Link className="landing-cta" to="/books">
            {t("pages.home.cta")}
          </Link>
        </div>
        <div className="landing-art" aria-hidden="true">
          <span />
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("pages.home.projects.eyebrow")}</p>
            <h2>{t("pages.home.projects.title")}</h2>
          </div>
        </div>
        <ul className="project-list">
          <li>
            <Link className="project-card" to="/books">
              <span className="project-number">01</span>
              <div>
                <h3>{t("pages.home.projects.books.title")}</h3>
                <p>{t("pages.home.projects.books.description")}</p>
              </div>
              <svg
                className="project-arrow"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </Link>
          </li>
        </ul>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("pages.home.stack.eyebrow")}</p>
            <h2>{t("pages.home.stack.title")}</h2>
          </div>
        </div>
        <ul className="stack-list">
          {STACK.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default Home;
