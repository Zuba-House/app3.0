import React, { useContext } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { MyContext } from '../../App';

const AdminLayout = ({ children, contentClass = 'py-3 px-3 sm:py-4 sm:px-4 md:px-5' }) => {
  const context = useContext(MyContext);
  const { isSidebarOpen, windowWidth } = context;

  const isDesktop = windowWidth >= 992;
  const sidebarOpen = isSidebarOpen === true;
  const showSidebarMargin = sidebarOpen && isDesktop;
  const showMobileOverlay = sidebarOpen && !isDesktop;

  return (
    <section className="main admin-shell min-h-[100dvh]">
      <Header sidebarOpen={sidebarOpen && isDesktop} />

      <Sidebar isOpen={sidebarOpen} isDesktop={isDesktop} />

      {showMobileOverlay && (
        <div
          className="sidebarOverlay fixed left-0 right-0 bottom-0 z-[51] bg-black/45"
          style={{ top: 'var(--admin-header-h)' }}
          aria-hidden
          onClick={() => context?.setisSidebarOpen(false)}
        />
      )}

      <main
        className={`admin-content-area is-scroll contentRight ${contentClass} ${
          showSidebarMargin ? 'with-sidebar' : ''
        }`}
      >
        <div className="admin-page-inner max-w-full">{children}</div>
      </main>
    </section>
  );
};

export default AdminLayout;
