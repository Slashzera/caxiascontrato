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
    { title: 'Processos Ativos', value: 0, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Contratos Vigentes', value: 0, icon: Building2, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Empresas Cadastradas', value: 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Alertas Pendentes', value: 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
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
        daysRemaining: Math.ceil((new Date(contract.end_date) - today) / (1000 * 60 * 60 * 24))
      }));
      
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
        { title: 'Processos Ativos', value: activeProcesses, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Contratos Vigentes', value: activeContracts, icon: Building2, color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Empresas Cadastradas', value: totalCompanies, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: 'Alertas Pendentes', value: pendingAlerts, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral dos processos e contratos administrativos</p>
      </div>

      {/* Contract Alerts */}
      {contractAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">
              Contratos Vencendo: {contractAlerts.length} contrato(s) vencendo(s) - {contractAlerts.map(alert => alert.endDate).join(', ')}
            </h3>
          </div>
          <div className="space-y-2">
            {contractAlerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded border border-red-100">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* External Systems Access */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acesso a Outros Sistemas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:border-blue-300 transform hover:scale-105"
            onClick={() => handleExternalSystemAccess('https://sisgecon.mourascloud.com.br/')}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-full bg-blue-500 text-white">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <ExternalLink className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Sistema de Atas</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Acesse o sistema de gerenciamento de atas e documentos oficiais
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Processos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-blue-600" />
              Status dos Processos
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Processes and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Processes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Processos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProcesses.map((process, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{process.id}</p>
                    <p className="text-sm text-gray-600">{process.type} - {process.company}</p>
                    <p className="text-xs text-gray-500">{process.date}</p>
                  </div>
                  <Badge variant={
                    process.status === 'Concluído' ? 'default' :
                    process.status === 'Em Andamento' ? 'secondary' : 'destructive'
                  }>
                    {process.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Prazos Próximos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{deadline.process}</p>
                    <p className="text-sm text-gray-600">{deadline.type}</p>
                    <p className="text-xs text-gray-500">Prazo: {deadline.deadline}</p>
                  </div>
                  <Badge variant={
                    deadline.priority === 'Alta' ? 'destructive' :
                    deadline.priority === 'Média' ? 'secondary' : 'outline'
                  }>
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
