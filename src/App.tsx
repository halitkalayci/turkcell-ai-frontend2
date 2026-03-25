import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/urunler" replace />} />
        <Route path="/urunler" element={<ProductsPage />} />
        <Route path="/sepet" element={<CartPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
