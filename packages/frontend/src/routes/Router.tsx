import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "src/components/Layout";
import Books from "src/pages/Books";
import Home from "src/pages/Home";

const CitizenMaker = lazy(() => import("src/pages/CitizenMaker"));

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route
            path="/citizen-maker"
            element={
              <Suspense fallback={null}>
                <CitizenMaker />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
