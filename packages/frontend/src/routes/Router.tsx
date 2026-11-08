import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "src/components/Layout";
import Books from "src/pages/Books";
import Home from "src/pages/Home";

const CitizenLab = lazy(() => import("src/pages/CitizenLab"));

// Keeps citizen links shared before the rename working.
function CitizenMakerRedirect() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: "/citizen-lab", search }} replace />;
}

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route
            path="/citizen-lab"
            element={
              <Suspense fallback={null}>
                <CitizenLab />
              </Suspense>
            }
          />
          <Route path="/citizen-maker" element={<CitizenMakerRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
