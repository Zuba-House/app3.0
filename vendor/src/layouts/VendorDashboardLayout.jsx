import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const VendorDashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On desktop, default to open sidebar
      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    checkMobile();

    // Listen for resize
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        isMobile={isMobile}
      />
      <Topbar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />
      <main 
        className={`transition-all duration-300 ${
          !isMobile && isSidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}
        style={{ 
          marginTop: '56px', // h-14 on mobile
          padding: isMobile ? '12px' : '20px',
        }}
      >
        <div className="md:mt-2">
          {children}
        </div>
      </main>
    </div>
  );
};

export default VendorDashboardLayout;

