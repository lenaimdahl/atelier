import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "src/components/LanguageSwitcher";

export function Layout() {
  const { t } = useTranslation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand-mark">
          ATELIER
        </NavLink>
        <nav className="main-nav" aria-label={t("nav.label")}>
          <NavLink to="/" end>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/books">{t("nav.books")}</NavLink>
        </nav>
        <LanguageSwitcher />
      </header>
      <Outlet />
    </div>
  );
}
