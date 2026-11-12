import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "src/components/Layout";
import Books from "src/pages/Books";
import Home from "src/pages/Home";
import { LogoMotion } from "src/pages/LogoMotion";
import { PATHS } from "src/routes/paths";

const CitizenLab = lazy(() => import("src/pages/CitizenLab"));

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path={PATHS.HOME} element={<Home />} />
          <Route path={PATHS.BOOKS} element={<Books />} />
          <Route
            path={`${PATHS.CITIZENLAB}/:code?`}
            element={
              <Suspense fallback={null}>
                <CitizenLab />
              </Suspense>
            }
          />
          <Route path={PATHS.LOGOMOTION} element={<LogoMotion />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
