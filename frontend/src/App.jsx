import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Menu from './pages/Menu';
import CustomizeBowl from './pages/CustomizeBowl';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Componentes Admin
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Productos from './pages/admin/Productos';
import Ingredientes from './pages/admin/Ingredientes';
import Pedidos from './pages/admin/Pedidos';
import Historial from './pages/admin/Historial';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Menu />} />
          <Route path="personalizar/:id" element={<CustomizeBowl />} />
          <Route path="carrito" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>

        <Route path="/admin/login" element={<Login />} />

        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />
            <Route path="ingredientes" element={<Ingredientes />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="historial" element={<Historial />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;