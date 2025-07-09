import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import ProcessManagement from '@/components/ProcessManagement';
import ContractManagement from '@/components/ContractManagement';
import CompanyManagement from '@/components/CompanyManagement';
import DocumentManagement from '@/components/DocumentManagement';
import ReportsPage from '@/components/ReportsPage';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'processes':
        return <ProcessManagement />;
      case 'contracts':
        return <ContractManagement />;
      case 'companies':
        return <CompanyManagement />;
      case 'documents':
        return <DocumentManagement />;
      case 'reports':
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;