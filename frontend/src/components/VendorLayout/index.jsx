import React, { useState, useEffect } from 'react';
import VendorSidebar from '../VendorSidebar';
import VendorHeader from '../VendorHeader';

const VendorLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 992) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0b2735' }}>
      <VendorSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <VendorHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      
      <div
        className="contentRight overflow-hidden py-4 px-5 transition-all"
        style={{
          width: isSidebarOpen ? '80%' : '100%',
          marginLeft: isSidebarOpen ? '20%' : '0',
          marginTop: '70px',
          minHeight: 'calc(100vh - 70px)'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default VendorLayout;

