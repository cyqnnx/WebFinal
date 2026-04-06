import { Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import ProductsAdmin from './pages/ProductsAdmin.jsx';
import Cart from './pages/Cart.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import OrdersDashboard from './pages/OrdersDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import Forbidden from './pages/Forbidden.jsx';

export default function App() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-gradient-to-br from-amber-50/50 via-stone-50 to-orange-50/50">
      {/* Universal Ambient Background Scene */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[5%] -top-[5%] h-[40%] w-[40%] rounded-full bg-amber-400/10 blur-[100px]"></div>
        <div className="absolute right-[0%] top-[20%] h-[30%] w-[30%] rounded-full bg-rose-400/10 blur-[120px]"></div>
        <div className="absolute -bottom-[10%] left-[10%] h-[50%] w-[50%] rounded-full bg-orange-400/10 blur-[120px]"></div>
      </div>
      
      <div className="relative z-10 flex flex-1 flex-col">
        <Navbar />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/products"
            element={(
              <ProtectedRoute allowRoles={['admin']}>
                <ProductsAdmin />
              </ProtectedRoute>
            )}
          />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/orders"
            element={(
              <ProtectedRoute allowRoles={['employee', 'admin']}>
                <OrdersDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/users"
            element={(
              <ProtectedRoute allowRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            )}
          />
          <Route path="/my-orders" element={<OrderHistory />} />
          <Route path="/403" element={<Forbidden />} />
        </Routes>
      </main>
      <Footer />
      </div>
    </div>
  );
}

