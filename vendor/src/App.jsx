// Force rebuild - v2.0 Dashboard Implementation
import "./App.css";
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import VendorDashboardLayout from './layouts/VendorDashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard
import DashboardHome from './pages/dashboard/DashboardHome';

// Products
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import ProductFormEnhanced from './pages/products/ProductFormEnhanced';

// Orders
import OrderList from './pages/orders/OrderList';
import OrderDetail from './pages/orders/OrderDetail';

// Finance
import Earnings from './pages/finance/Earnings';
import Withdrawals from './pages/finance/Withdrawals';

// Coupons
import VendorCoupons from './pages/coupons/VendorCoupons';
import CouponForm from './pages/coupons/CouponForm';

// Store
import StoreProfile from './pages/store/StoreProfile';
import StoreSEO from './pages/store/StoreSEO';

// Analytics
import AnalyticsOverview from './pages/analytics/AnalyticsOverview';

// Settings
import AccountSettings from './pages/settings/AccountSettings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');
  
  if (!token || userRole !== 'VENDOR') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');
  
  if (token && userRole === 'VENDOR') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <AuthLayout>
              <Register />
            </AuthLayout>
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <AuthLayout>
            <ForgotPassword />
          </AuthLayout>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <DashboardHome />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <ProductList />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/products/new" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <ProductFormEnhanced />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/products/:id/edit" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <ProductFormEnhanced />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <OrderList />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <OrderDetail />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/finance/earnings" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <Earnings />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/finance/withdrawals" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <Withdrawals />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/coupons" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <VendorCoupons />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/coupons/new" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <CouponForm />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/coupons/:id/edit" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <CouponForm />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/store/profile" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <StoreProfile />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/store/seo" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <StoreSEO />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <AnalyticsOverview />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/settings/account" element={
          <ProtectedRoute>
            <VendorDashboardLayout>
              <AccountSettings />
            </VendorDashboardLayout>
          </ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;

