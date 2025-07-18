
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Building2, 
  Users, 
  FolderOpen, 
  BarChart3,
  Trash2
} from 'lucide-react';

const Sidebar = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      color: 'from-[#3275F1] to-[#2563eb]',
      iconColor: 'text-[#3275F1]',
      hoverColor: 'hover:bg-blue-50'
    },
    { 
      id: 'processes', 
      label: 'Processos', 
      icon: FileText, 
      color: 'from-green-500 to-green-600',
      iconColor: 'text-green-500',
      hoverColor: 'hover:bg-green-50'
    },
    { 
      id: 'contracts', 
      label: 'Contratos', 
      icon: Building2, 
      color: 'from-purple-500 to-purple-600',
      iconColor: 'text-purple-500',
      hoverColor: 'hover:bg-purple-50'
    },
    { 
      id: 'companies', 
      label: 'Empresas', 
      icon: Users, 
      color: 'from-orange-500 to-orange-600',
      iconColor: 'text-orange-500',
      hoverColor: 'hover:bg-orange-50'
    },
    { 
      id: 'documents', 
      label: 'Documentos', 
      icon: FolderOpen, 
      color: 'from-teal-500 to-teal-600',
      iconColor: 'text-teal-500',
      hoverColor: 'hover:bg-teal-50'
    },
    { 
      id: 'reports', 
      label: 'Relatórios', 
      icon: BarChart3, 
      color: 'from-indigo-500 to-indigo-600',
      iconColor: 'text-indigo-500',
      hoverColor: 'hover:bg-indigo-50'
    },
    { 
      id: 'trash', 
      label: 'Lixeira', 
      icon: Trash2, 
      color: 'from-red-500 to-red-600',
      iconColor: 'text-red-500',
      hoverColor: 'hover:bg-red-50'
    },
  ];

  return (
    <aside className="w-64 bg-[#3275F1] text-white shadow-2xl">
      <div className="p-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-3 mb-8 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <img 
              src="/logotipo-p.png" 
              alt="SIGeProc Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              SIGeProc
            </h2>
            <p className="text-xs text-blue-200 font-medium">Gestão de Contratos</p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <div key={item.id} className="relative group">
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left relative overflow-hidden transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105 border border-white/20` 
                      : `text-white/80 hover:text-white hover:bg-white/10 hover:transform hover:scale-105`
                  }`}
                  onClick={() => onNavigate(item.id)}
                >
                  {/* Background gradient for active state */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
                  )}
                  
                  {/* Icon with colored background */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 transition-all duration-300 ${
                    isActive 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : 'bg-white/10 group-hover:bg-white/20'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                    }`} />
                  </div>
                  
                  <span className={`font-medium transition-all duration-300 ${
                    isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-lg"></div>
                  )}
                </Button>
                
                {/* Hover effect line */}
                <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-0 bg-gradient-to-b ${item.color} rounded-r-full transition-all duration-300 group-hover:h-8 opacity-0 group-hover:opacity-100`}></div>
              </div>
            );
          })}
        </nav>
        
        {/* Bottom decoration */}
        <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
          <div className="flex items-center space-x-2 text-xs text-white/60">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Sistema Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
