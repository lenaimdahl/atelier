import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "src/components/LanguageSwitcher";

export function Layout() {
  const { t } = useTranslation();
  const isCitizenMaker = useLocation().pathname === "/citizen-maker";

  return (
    <div className={`app-shell${isCitizenMaker ? " citizen-shell" : ""}`}>
      <header className="topbar">
        <NavLink to="/" className="brand-mark">
          ATELIER
        </NavLink>
        <nav className="main-nav" aria-label={t("nav.label")}>
          <NavLink to="/" end>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/books">{t("nav.books")}</NavLink>
          <NavLink to="/citizen-maker">{t("nav.citizenMaker")}</NavLink>
        </nav>
        <LanguageSwitcher />
      </header>
      <Outlet />
    </div>
  );
}
