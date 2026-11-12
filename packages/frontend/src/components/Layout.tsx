import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "src/components/LanguageSwitcher";
import { LANGUAGES } from "src/i18n/config";
import { PATHS } from "src/routes/paths";

const HOME_PAGE = { titleKey: "nav.home", shellClass: "app-shell terminal-shell home-shell" } as const;
const PAGES = [
  { path: PATHS.BOOKS, titleKey: "nav.books", shellClass: "app-shell" },
  { path: PATHS.CITIZENLAB, titleKey: "nav.citizenLab", shellClass: "app-shell terminal-shell" },
  { path: PATHS.LOGOMOTION, titleKey: "nav.logoMotion", shellClass: "app-shell terminal-shell" },
] as const;

export function Layout() {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? LANGUAGES.EN;
  }, [i18n.resolvedLanguage]);
  const page = PAGES.find(({ path }) => pathname.startsWith(path)) ?? HOME_PAGE;
  const pageTitle = t(page.titleKey);

  useEffect(() => {
    document.title = `Atelier / ${pageTitle}`;
  }, [pageTitle]);

  return (
    <div className={page.shellClass}>
      <header className="topbar">
        <NavLink to={PATHS.HOME} className="brand-mark">
          LENA IMDAHL / ATELIER
        </NavLink>
        <nav className="main-nav" aria-label={t("nav.label")}>
          <NavLink to={PATHS.HOME} end>
            {t("nav.home")}
          </NavLink>
          <NavLink to={PATHS.BOOKS}>{t("nav.books")}</NavLink>
          <NavLink to={PATHS.CITIZENLAB}>{t("nav.citizenLab")}</NavLink>
          <NavLink to={PATHS.LOGOMOTION}>{t("nav.logoMotion")}</NavLink>
        </nav>
        <LanguageSwitcher />
      </header>
      <Outlet />
    </div>
  );
}
