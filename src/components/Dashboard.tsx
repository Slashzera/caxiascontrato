import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Building2, 
  Users, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  ExternalLink,
  ClipboardList
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Processos Ativos', value: 0, icon: FileText, color: 'text-white', bg: 'bg-gradient-to-br from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
    { title: 'Contratos Vigentes', value: 0, icon: Building2, color: 'text-white', bg: 'bg-gradient-to-br from-green-500 to-green-600', shadow: 'shadow-green-200' },
    { title: 'Empresas Cadastradas', value: 0, icon: Users, color: 'text-white', bg: 'bg-gradient-to-br from-purple-500 to-purple-600', shadow: 'shadow-purple-200' },
    { title: 'Alertas Pendentes', value: 0, icon: AlertTriangle, color: 'text-white', bg: 'bg-gradient-to-br from-red-500 to-red-600', shadow: 'shadow-red-200' },
  ]);
  const [recentProcesses, setRecentProcesses] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [contractAlerts, setContractAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [processesResult, contractsResult, companiesResult] = await Promise.all([
        supabase.from('processes').select('*'),
        supabase.from('contracts').select('*, companies(name)'),
        supabase.from('companies').select('*')
      ]);

      // Check for contracts expiring in 120 days
      const contracts = contractsResult.data || [];
      const today = new Date();
      const alertThreshold = new Date(today.getTime() + (120 * 24 * 60 * 60 * 1000)); // 120 days from now
      
      const expiringContracts = contracts.filter(contract => {
        const endDate = new Date(contract.end_date);
        return endDate <= alertThreshold && endDate >= today && contract.status === 'Vigente';
      }).map(contract => ({
        contractNumber: contract.contract_number,
        companyName: contract.companies?.name || 'N/A',
        endDate: new Date(contract.end_date).toLocaleDateString('pt-BR'),
        daysRemaining: Math.ceil((new Date(contract.end_date) - today) / (1000 * 60 * 60 * 24)),
        sortDate: new Date(contract.end_date) // Adicionar campo para ordenação
      })).sort((a, b) => a.sortDate - b.sortDate); // Ordenar por data (menor para maior)

      setContractAlerts(expiringContracts);

      // Calculate status data
      const processes = processesResult.data || [];
      const statusCounts = processes.reduce((acc, process) => {
        acc[process.status] = (acc[process.status] || 0) + 1;
        return acc;
      }, {});

      const statusColors = {
        'Em Andamento': '#3B82F6',
        'Concluído': '#10B981',
        'Pendente': '#F59E0B',
        'Cancelado': '#EF4444'
      };

      setStatusData(Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
        color: statusColors[name] || '#6B7280'
      })));

      // Calculate stats
      const activeProcesses = processes.filter(p => p.status === 'Em Andamento').length;
      const activeContracts = (contractsResult.data || []).filter(c => c.status === 'Vigente').length;
      const totalCompanies = (companiesResult.data || []).length;
      const pendingAlerts = processes.filter(p => p.status === 'Pendente').length + expiringContracts.length;

      setStats([
        { title: 'Processos Ativos', value: activeProcesses, icon: FileText, color: 'text-white', bg: 'bg-gradient-to-br from-blue-500 to-blue-600', shadow: 'shadow-blue-200' },
        { title: 'Contratos Vigentes', value: activeContracts, icon: Building2, color: 'text-white', bg: 'bg-gradient-to-br from-green-500 to-green-600', shadow: 'shadow-green-200' },
        { title: 'Empresas Cadastradas', value: totalCompanies, icon: Users, color: 'text-white', bg: 'bg-gradient-to-br from-purple-500 to-purple-600', shadow: 'shadow-purple-200' },
        { title: 'Alertas Pendentes', value: pendingAlerts, icon: AlertTriangle, color: 'text-white', bg: 'bg-gradient-to-br from-red-500 to-red-600', shadow: 'shadow-red-200' },
      ]);

      // Get recent processes with company data
      const { data: recentProcessesData } = await supabase
        .from('processes')
        .select(`
          *,
          companies (name)
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentProcesses((recentProcessesData || []).map(process => ({
        id: process.process_number,
        type: process.process_type,
        company: process.companies?.name || 'N/A',
        status: process.status,
        date: new Date(process.created_at).toLocaleDateString('pt-BR')
      })));

      // Generate sample monthly data (you can enhance this with real data)
      setProcessData([
        { name: 'Jan', value: Math.floor(processes.length * 0.15) },
        { name: 'Fev', value: Math.floor(processes.length * 0.18) },
        { name: 'Mar', value: Math.floor(processes.length * 0.12) },
        { name: 'Abr', value: Math.floor(processes.length * 0.20) },
        { name: 'Mai', value: Math.floor(processes.length * 0.16) },
        { name: 'Jun', value: Math.floor(processes.length * 0.19) },
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };


  const upcomingDeadlines = [
    { process: '2023/089', deadline: '28/01/2024', type: 'Vencimento Contrato', priority: 'Alta' },
    { process: '2023/156', deadline: '02/02/2024', type: 'Prazo Recurso', priority: 'Média' },
    { process: '2024/005', deadline: '05/02/2024', type: 'Entrega Documentos', priority: 'Baixa' },
  ];

  const handleExternalSystemAccess = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={`hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 ${stat.shadow} shadow-lg`}>
              <CardContent className={`p-6 ${stat.bg} text-white rounded-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/90 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contract Alerts - Movidos para acima do Acesso a Outros Sistemas */}
      {contractAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 p-6 rounded-lg shadow-lg">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-red-800">
              Contratos Vencendo: {contractAlerts.length} contrato(s) vencendo(s) - {contractAlerts.map(alert => alert.endDate).join(', ')}
            </h3>
          </div>
          <div className="space-y-3">
            {contractAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <p className="font-medium text-gray-900">{alert.contractNumber}</p>
                  <p className="text-sm text-gray-600">{alert.companyName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">Vence em {alert.daysRemaining} dias</p>
                  <p className="text-xs text-gray-500">{alert.endDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Systems Access */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <ExternalLink className="w-6 h-6 mr-3 text-blue-600" />
          Acesso a Outros Sistemas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-500 to-indigo-600 border-0 transform hover:scale-105 shadow-lg shadow-blue-200"
            onClick={() => handleExternalSystemAccess('https://sisgecon.mourascloud.com.br/')}
          >
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <ExternalLink className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Sistema de Atas</h3>
                <p className="text-sm text-white/90 mb-3">
                  Acesse o sistema de gerenciamento de atas e documentos oficiais
                </p>
                <div className="flex items-center text-white text-sm font-medium">
                  <span>Acessar Sistema</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Chart */}
        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
            <CardTitle className="flex items-center text-gray-800">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Processos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1e40af',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#blueGradient)" 
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="flex items-center text-gray-800">
              <BarChart className="w-5 h-5 mr-2 text-purple-600" />
              Status dos Processos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#7c3aed',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Processes and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Processes */}
        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="flex items-center text-gray-800">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Processos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentProcesses.map((process, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div>
                    <p className="font-medium text-gray-900">{process.id}</p>
                    <p className="text-sm text-gray-600">{process.type} - {process.company}</p>
                    <p className="text-xs text-gray-500">{process.date}</p>
                  </div>
                  <Badge 
                    variant={
                      process.status === 'Concluído' ? 'default' :
                      process.status === 'Em Andamento' ? 'secondary' : 'destructive'
                    }
                    className="shadow-sm"
                  >
                    {process.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
            <CardTitle className="flex items-center text-gray-800">
              <Calendar className="w-5 h-5 mr-2 text-orange-600" />
              Prazos Próximos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div>
                    <p className="font-medium text-gray-900">{deadline.process}</p>
                    <p className="text-sm text-gray-600">{deadline.type}</p>
                    <p className="text-xs text-gray-500">Prazo: {deadline.deadline}</p>
                  </div>
                  <Badge 
                    variant={
                      deadline.priority === 'Alta' ? 'destructive' :
                      deadline.priority === 'Média' ? 'secondary' : 'outline'
                    }
                    className="shadow-sm"
                  >
                    {deadline.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
