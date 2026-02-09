import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, LogOut, Bell, User } from 'lucide-react';
import Logo from '/Logo.png';

const Topbar = ({ isSidebarOpen, setIsSidebarOpen, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('vendorId');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/products') return 'Products';
    if (path.includes('/products/new')) return 'Add Product';
    if (path.includes('/products/') && path.includes('/edit')) return 'Edit Product';
    if (path === '/orders') return 'Orders';
    if (path.includes('/orders/')) return 'Order Details';
    if (path === '/finance/earnings') return 'Earnings';
    if (path === '/finance/withdrawals') return 'Withdrawals';
    if (path === '/coupons') return 'Coupons';
    if (path === '/store/profile') return 'Store Profile';
    if (path === '/store/seo') return 'Store SEO';
    if (path === '/analytics') return 'Analytics';
    if (path === '/settings/account') return 'Settings';
    return 'Vendor Panel';
  };

  return (
    <header 
      className={`fixed top-0 right-0 h-14 md:h-16 bg-white shadow-soft z-40 flex items-center justify-between px-3 md:px-6 transition-all duration-300 border-b border-[#e5e2db]`}
      style={{ 
        left: isMobile ? '0' : (isSidebarOpen ? '256px' : '0'),
      }}
    >
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-[#e5e2db] rounded-xl transition-all"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 md:w-6 md:h-6 text-[#0b2735]" />
        </button>
        
        {/* Logo on mobile */}
        {isMobile && (
          <img src={Logo} alt="Zuba House" className="h-6 w-6 object-contain" />
        )}
        
        {/* Page title */}
        <h1 className="text-sm md:text-lg font-semibold text-[#0b2735] truncate max-w-[150px] md:max-w-none">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications - hidden on very small screens */}
        <button className="hidden sm:flex p-2 hover:bg-[#e5e2db] rounded-xl transition-all relative">
          <Bell className="w-5 h-5 text-[#0b2735]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#efb291] rounded-full"></span>
        </button>
        
        {/* User avatar - hidden on small screens */}
        <button className="hidden md:flex p-2 hover:bg-[#e5e2db] rounded-xl transition-all">
          <User className="w-5 h-5 text-[#0b2735]" />
        </button>
        
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#0b2735] text-white rounded-xl hover:bg-[#0b2735] hover:bg-opacity-90 transition-all text-sm md:text-base font-medium shadow-soft"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;

