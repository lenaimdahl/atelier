import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "@fontsource/vt323/400.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/700.css";
import "src/pages/home.css";

const STACK = [
  "React",
  "TypeScript",
  "Vite",
  "Vitest",
  "pnpm workspaces",
  "Go",
  "PostgreSQL",
  "Open Library API",
  "Docker",
];

const PROJECTS = [
  { id: "books", path: "/books", number: "0x01" },
  { id: "citizenLab", path: "/citizen-maker", number: "0x02" },
] as const;

function Prompt({ command }: { command: string }) {
  return (
    <p className="terminal-prompt">
      <span className="terminal-user">guest@atelier</span>:<span className="terminal-path">~</span>$ {command}
    </p>
  );
}

function Home() {
  const { t } = useTranslation();

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="home-eyebrow">{t("pages.home.eyebrow")}</p>
          <Prompt command="whoami" />
          <h1>
            {t("pages.home.title")}
            <span>
              {t("pages.home.titleAccent")}
              <span className="terminal-cursor" aria-hidden="true" />
            </span>
          </h1>
          <p className="home-subtitle">{t("pages.home.subTitle")}</p>
          <div className="home-actions">
            <Link className="home-button primary" to="/books" aria-label={t("pages.home.ctaBooks")}>
              ./bookshelf
            </Link>
            <Link className="home-button" to="/citizen-maker" aria-label={t("pages.home.ctaCitizenLab")}>
              ./citizen-lab
            </Link>
          </div>
        </div>

        <div className="home-log" aria-label={t("pages.home.log.title")}>
          <div className="home-log-bar">
            <span>{t("pages.home.log.title")}</span>
            <span aria-hidden="true">0x00</span>
          </div>
          <ul>
            <li>
              <span className="log-ok">[ OK ]</span> {t("pages.home.log.bookshelf")}
            </li>
            <li>
              <span className="log-ok">[ OK ]</span> {t("pages.home.log.citizenLab")}
            </li>
            <li>
              <span className="log-pending">[ .. ]</span> {t("pages.home.log.next")}
            </li>
          </ul>
        </div>
      </section>

      <section className="home-section" aria-labelledby="home-projects-title">
        <p className="home-eyebrow">{t("pages.home.projects.eyebrow")}</p>
        <h2 id="home-projects-title">{t("pages.home.projects.title")}</h2>
        <ul className="home-projects">
          {PROJECTS.map(({ id, path, number }) => (
            <li key={id}>
              <Link className="home-project" to={path}>
                <span className="home-project-number">{number}</span>
                <div className="home-project-text">
                  <h3>{t(`pages.home.projects.${id}.title`)}</h3>
                  <p>{t(`pages.home.projects.${id}.description`)}</p>
                </div>
                <span className="home-project-arrow" aria-hidden="true">
                  -&gt;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section" aria-labelledby="home-stack-title">
        <p className="home-eyebrow">{t("pages.home.stack.eyebrow")}</p>
        <h2 id="home-stack-title">{t("pages.home.stack.title")}</h2>
        <Prompt command="cat stack.txt" />
        <ul className="home-stack">
          {STACK.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </section>

      <footer className="home-footer">
        <span>EOF</span>
        <span>{t("pages.home.footer")}</span>
      </footer>
    </main>
  );
}

export default Home;
