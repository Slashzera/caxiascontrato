import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, currentPage, onNavigate }) => {
  const navigate = useNavigate();
  const handleNavigate = onNavigate || ((path) => navigate(path));

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="flex flex-col sm:pl-14">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
