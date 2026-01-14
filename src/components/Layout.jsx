import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, currentPage, headerTitle }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#0d141b] dark:text-white flex h-screen overflow-hidden font-display antialiased">
      <Sidebar 
        currentPage={currentPage} 
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark relative">
        <Header 
          title={headerTitle} 
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

