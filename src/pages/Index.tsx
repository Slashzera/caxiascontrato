
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import ProcessManagement from '@/components/ProcessManagement';
import ContractManagement from '@/components/ContractManagement';
import CompanyManagement from '@/components/CompanyManagement';
import DocumentManagement from '@/components/DocumentManagement';
import ReportsPage from '@/components/ReportsPage';
import LoginPage from '@/components/LoginPage';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    setCurrentPage('dashboard');
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

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
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Index;
