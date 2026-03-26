import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import AboutPage from "./pages/AboutPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/urunler" replace />} />
        <Route path="/urunler" element={<ProductsPage />} />
        <Route path="/sepet" element={<CartPage />} />
        <Route path="/hakkimizda" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
