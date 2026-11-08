import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "src/components/Layout";
import Books from "src/pages/Books";
import Home from "src/pages/Home";

const CitizenLab = lazy(() => import("src/pages/CitizenLab"));

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route
            path="/citizen-lab/:code?"
            element={
              <Suspense fallback={null}>
                <CitizenLab />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
