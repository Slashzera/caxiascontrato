
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'processes', label: 'Processos', icon: FileText },
    { id: 'contracts', label: 'Contratos', icon: Building2 },
    { id: 'companies', label: 'Empresas', icon: Users },
    { id: 'documents', label: 'Documentos', icon: FolderOpen },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'trash', label: 'Lixeira', icon: Trash2 },
  ];

  return (
    <aside className="w-64 bg-blue-900 text-white">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
          </div>
          <div>
            <h2 className="font-bold">SIGeProc</h2>
            <p className="text-xs text-blue-200">Gestão de Contratos</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? "secondary" : "ghost"}
                className={`w-full justify-start text-left ${
                  currentPage === item.id 
                    ? 'bg-white text-blue-900 hover:bg-white' 
                    : 'text-white hover:bg-blue-800'
                }`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
