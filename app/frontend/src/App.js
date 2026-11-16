import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import StoreLayout from "@/store/Layout";
import Home from "@/store/pages/Home";
import Catalog from "@/store/pages/Catalog";
import ProductPage from "@/store/pages/ProductPage";
import Checkout from "@/store/pages/Checkout";
import OrderPage from "@/store/pages/OrderPage";
import MpSandbox from "@/store/pages/MpSandbox";
import { LoginPage, RegisterPage, AccountPage } from "@/store/pages/Auth";
import ExtraPage from "@/store/pages/ExtraPage";
import AdminLayout from "@/admin/AdminLayout";
import Dashboard from "@/admin/Dashboard";
import ThemeEditor from "@/admin/ThemeEditor";
import HomeBuilder from "@/admin/HomeBuilder";
import HeaderEditor from "@/admin/HeaderEditor";
import SiteEditor from "@/admin/SiteEditor";
import PagesAdmin from "@/admin/PagesAdmin";
import ProductsAdmin from "@/admin/ProductsAdmin";
import ProductForm from "@/admin/ProductForm";
import Taxonomy from "@/admin/Taxonomy";
import Pricing from "@/admin/Pricing";
import Coupons from "@/admin/Coupons";
import Orders from "@/admin/Orders";
import Users from "@/admin/Users";
import Payments from "@/admin/Payments";
import Comments from "@/admin/Comments";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalog />} />
                <Route path="/producto/:slug" element={<ProductPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/orden/:id" element={<OrderPage />} />
                <Route path="/pago-mp/:id" element={<MpSandbox />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegisterPage />} />
                <Route path="/cuenta" element={<AccountPage />} />
                <Route path="/pagina/:slug" element={<ExtraPage />} />
                <Route path="*" element={<ExtraPage notFound />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="tema" element={<ThemeEditor />} />
                <Route path="home" element={<HomeBuilder />} />
                <Route path="cabecera" element={<HeaderEditor />} />
                <Route path="sitio" element={<SiteEditor />} />
                <Route path="paginas" element={<PagesAdmin />} />
                <Route path="productos" element={<ProductsAdmin />} />
                <Route path="productos/:id" element={<ProductForm />} />
                <Route path="catalogo" element={<Taxonomy />} />
                <Route path="precios" element={<Pricing />} />
                <Route path="cupones" element={<Coupons />} />
                <Route path="comentarios" element={<Comments />} />
                <Route path="pedidos" element={<Orders />} />
                <Route path="usuarios" element={<Users />} />
                <Route path="pagos" element={<Payments />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-center" richColors />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
