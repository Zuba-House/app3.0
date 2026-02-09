import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, Wallet, 
  Tag, Store, BarChart2, Settings, ChevronDown, 
  DollarSign, CreditCard, Search, X
} from 'lucide-react';
import Logo from '/Logo.png';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState(['finance', 'store']);
  
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { 
      id: 'finance',
      icon: Wallet, 
      label: 'Finance',
      children: [
        { path: '/finance/earnings', icon: DollarSign, label: 'Earnings' },
        { path: '/finance/withdrawals', icon: CreditCard, label: 'Withdrawals' },
      ]
    },
    { path: '/coupons', icon: Tag, label: 'Coupons' },
    { 
      id: 'store',
      icon: Store, 
      label: 'Store',
      children: [
        { path: '/store/profile', icon: Store, label: 'Profile' },
        { path: '/store/seo', icon: Search, label: 'SEO' },
      ]
    },
    { path: '/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/settings/account', icon: Settings, label: 'Settings' }
  ];

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const isMenuActive = (item) => {
    if (item.path) {
      return location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    }
    if (item.children) {
      return item.children.some(child => 
        location.pathname === child.path || location.pathname.startsWith(child.path)
      );
    }
    return false;
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const isActive = isMenuActive(item);
    const isExpanded = item.children && expandedMenus.includes(item.id);

    // Menu item with children
    if (item.children) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[#0b2735] hover:bg-opacity-80 transition-all rounded-lg mx-2 ${
              isActive ? 'bg-[#0b2735] bg-opacity-90 border-l-4 border-[#efb291]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#efb291]' : 'text-[#e5e2db]'}`} />
              <span className={`text-sm md:text-base ${isActive ? 'text-[#efb291] font-semibold' : 'text-[#e5e2db]'}`}>{item.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {isExpanded && (
            <div className="bg-[#0b2735] bg-opacity-50 rounded-lg mx-2 my-1">
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const isChildActive = location.pathname === child.path;
                
                return (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 pl-10 md:pl-12 pr-4 py-2.5 hover:bg-[#0b2735] hover:bg-opacity-70 transition-all rounded-lg mx-2 my-1 ${
                      isChildActive ? 'bg-[#0b2735] bg-opacity-80 text-[#efb291] font-medium' : 'text-[#e5e2db] text-opacity-80'
                    }`}
                  >
                    <ChildIcon className={`w-4 h-4 ${isChildActive ? 'text-[#efb291]' : 'text-[#e5e2db]'}`} />
                    <span className="text-sm">{child.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Simple menu item
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={handleLinkClick}
        className={`flex items-center gap-3 px-4 py-3 hover:bg-[#0b2735] hover:bg-opacity-80 transition-all rounded-lg mx-2 ${
          isActive ? 'bg-[#0b2735] bg-opacity-90 border-l-4 border-[#efb291]' : ''
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-[#efb291]' : 'text-[#e5e2db]'}`} />
        <span className={`text-sm md:text-base ${isActive ? 'text-[#efb291] font-semibold' : 'text-[#e5e2db]'}`}>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-[#0b2735] text-white z-50 transition-all duration-300 shadow-large
          ${isMobile 
            ? (isOpen ? 'w-[280px] translate-x-0' : 'w-[280px] -translate-x-full') 
            : (isOpen ? 'w-64' : 'w-0 overflow-hidden')
          }`}
      >
        <div className="p-4 border-b border-[#0b2735] border-opacity-30 flex items-center justify-between bg-[#0b2735] bg-opacity-95">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Zuba House" className="h-8 w-8 object-contain" />
            <h2 className="text-lg md:text-xl font-bold text-[#efb291]">Zuba House</h2>
          </div>
          {isMobile && (
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-[#0b2735] hover:bg-opacity-80 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-[#e5e2db]" />
            </button>
          )}
        </div>
        <nav className="mt-4 overflow-y-auto pb-20 px-2" style={{ maxHeight: 'calc(100vh - 70px)' }}>
          {menuItems.map(renderMenuItem)}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
