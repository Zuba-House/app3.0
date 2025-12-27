# Vendor Panel Frontend - Complete Structure

## 📁 Project Setup

### 1. Create New Vendor App

```bash
cd zuba-web2.0
npm create vite@latest vendor -- --template react
cd vendor
npm install
```

### 2. Install Dependencies

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install react-router-dom
npm install axios
npm install react-hot-toast
npm install recharts
npm install react-icons
npm install @mui/x-data-grid  # For tables
npm install react-collapse
npm install react-simple-wysiwyg  # For rich text editor
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Project Structure

```
vendor/
├── public/
│   └── vite.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── routes/
│   │   └── index.jsx
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   └── VendorDashboardLayout.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── onboarding/
│   │   │   └── VendorOnboarding.jsx
│   │   ├── dashboard/
│   │   │   └── DashboardHome.jsx
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   └── ProductBulkUpload.jsx
│   │   ├── orders/
│   │   │   ├── OrderList.jsx
│   │   │   └── OrderDetail.jsx
│   │   ├── shipping/
│   │   │   └── ShippingSettings.jsx
│   │   ├── finance/
│   │   │   ├── Earnings.jsx
│   │   │   └── Withdrawals.jsx
│   │   ├── coupons/
│   │   │   ├── VendorCoupons.jsx
│   │   │   └── CouponForm.jsx
│   │   ├── store/
│   │   │   ├── StoreProfile.jsx
│   │   │   └── StoreSEO.jsx
│   │   ├── analytics/
│   │   │   └── AnalyticsOverview.jsx
│   │   ├── support/
│   │   │   └── SupportTickets.jsx
│   │   └── settings/
│   │       ├── AccountSettings.jsx
│   │       └── Notifications.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   ├── StatCard.jsx
│   │   ├── DataTable.jsx
│   │   ├── OrderStatusChip.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── ImageUpload.jsx
│   │   └── LoadingSpinner.jsx
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── auth.service.js
│   │   ├── vendor.service.js
│   │   ├── product.service.js
│   │   ├── order.service.js
│   │   ├── coupon.service.js
│   │   └── payout.service.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useVendor.js
│   │   └── useApi.js
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── utils/
│   │   ├── currency.js
│   │   ├── date.js
│   │   └── validation.js
│   └── assets/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🔑 Key Files

### `src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### `src/App.jsx`

```jsx
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import AppRoutes from './routes'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
```

### `src/routes/index.jsx`

```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Layouts
import AuthLayout from '../layouts/AuthLayout'
import VendorDashboardLayout from '../layouts/VendorDashboardLayout'

// Auth Pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'

// Onboarding
import VendorOnboarding from '../pages/onboarding/VendorOnboarding'

// Dashboard
import DashboardHome from '../pages/dashboard/DashboardHome'

// Products
import ProductList from '../pages/products/ProductList'
import ProductForm from '../pages/products/ProductForm'

// Orders
import OrderList from '../pages/orders/OrderList'
import OrderDetail from '../pages/orders/OrderDetail'

// Finance
import Earnings from '../pages/finance/Earnings'
import Withdrawals from '../pages/finance/Withdrawals'

// Coupons
import VendorCoupons from '../pages/coupons/VendorCoupons'
import CouponForm from '../pages/coupons/CouponForm'

// Store
import StoreProfile from '../pages/store/StoreProfile'
import StoreSEO from '../pages/store/StoreSEO'

// Analytics
import AnalyticsOverview from '../pages/analytics/AnalyticsOverview'

// Settings
import AccountSettings from '../pages/settings/AccountSettings'

// Protected Route Component
const ProtectedRoute = ({ children, requireOnboarding = false }) => {
  const { user, vendor, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || user.role !== 'VENDOR') {
    return <Navigate to="/login" replace />
  }

  if (vendor && vendor.status !== 'APPROVED') {
    return <Navigate to="/application-status" replace />
  }

  if (requireOnboarding && vendor && !vendor.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (user && user.role === 'VENDOR') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function AppRoutes() {
  return (
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
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <VendorDashboardLayout>
            <VendorOnboarding />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <DashboardHome />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/products" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <ProductList />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/products/new" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <ProductForm />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/products/:id/edit" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <ProductForm />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/orders" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <OrderList />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/orders/:id" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <OrderDetail />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/finance/earnings" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <Earnings />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/finance/withdrawals" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <Withdrawals />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/coupons" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <VendorCoupons />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/coupons/new" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <CouponForm />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/coupons/:id/edit" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <CouponForm />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/store/profile" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <StoreProfile />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/store/seo" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <StoreSEO />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <AnalyticsOverview />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/settings/account" element={
        <ProtectedRoute requireOnboarding={true}>
          <VendorDashboardLayout>
            <AccountSettings />
          </VendorDashboardLayout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRoutes
```

### `src/services/apiClient.js`

```jsx
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://zuba-api.onrender.com'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
```

### `src/context/AuthContext.jsx`

```jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/apiClient'
import { authService } from '../services/auth.service'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      const userData = await authService.getCurrentUser()
      setUser(userData.user)
      
      if (userData.vendor) {
        setVendor(userData.vendor)
      }
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    if (response.success) {
      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      setUser(response.user)
      if (response.vendor) {
        setVendor(response.vendor)
      }
      return response
    }
    throw new Error(response.message || 'Login failed')
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setVendor(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, vendor, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## 🎨 Component Examples

### `src/components/Sidebar.jsx`

```jsx
import { Link, useLocation } from 'react-router-dom'
import { 
  RxDashboard, 
  RiProductHuntLine, 
  IoBagCheckOutline,
  FaMoneyBillWave,
  FaTag,
  FaStore,
  FaChartLine,
  FaCog
} from 'react-icons/...'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation()
  
  const menuItems = [
    { path: '/dashboard', icon: RxDashboard, label: 'Dashboard' },
    { path: '/products', icon: RiProductHuntLine, label: 'Products' },
    { path: '/orders', icon: IoBagCheckOutline, label: 'Orders' },
    { path: '/finance/earnings', icon: FaMoneyBillWave, label: 'Finance' },
    { path: '/coupons', icon: FaTag, label: 'Coupons' },
    { path: '/store/profile', icon: FaStore, label: 'Store' },
    { path: '/analytics', icon: FaChartLine, label: 'Analytics' },
    { path: '/settings/account', icon: FaCog, label: 'Settings' }
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Sidebar content */}
    </aside>
  )
}

export default Sidebar
```

---

## 📦 Package.json Template

```json
{
  "name": "vendor-panel",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.0.1",
    "axios": "^1.7.9",
    "@mui/material": "^6.2.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "react-hot-toast": "^2.4.1",
    "recharts": "^2.15.0",
    "react-icons": "^5.4.0",
    "react-collapse": "^5.1.1",
    "react-simple-wysiwyg": "^3.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "vite": "^6.0.1",
    "tailwindcss": "^3.4.16",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  }
}
```

---

## 🚀 Deployment

### Vite Config

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    proxy: {
      '/api': {
        target: 'https://zuba-api.onrender.com',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

### Environment Variables

```env
VITE_API_URL=https://zuba-api.onrender.com
```

---

## 📝 Next Steps

1. Create the vendor app structure
2. Implement authentication flow
3. Build dashboard layout
4. Implement product management
5. Implement order management
6. Add finance/payouts
7. Test with real vendor account

---

**Status**: Frontend structure documented ✅
**Ready for**: Implementation

