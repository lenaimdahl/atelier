import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "src/components/Layout";
import Books from "src/pages/Books";
import Home from "src/pages/Home";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
