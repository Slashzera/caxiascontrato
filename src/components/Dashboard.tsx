
import React from 'react';
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
  DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const stats = [
    { title: 'Processos Ativos', value: 87, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Contratos Vigentes', value: 142, icon: Building2, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Empresas Cadastradas', value: 89, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Alertas Pendentes', value: 12, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const processData = [
    { name: 'Jan', value: 12 },
    { name: 'Fev', value: 19 },
    { name: 'Mar', value: 15 },
    { name: 'Abr', value: 22 },
    { name: 'Mai', value: 18 },
    { name: 'Jun', value: 25 },
  ];

  const statusData = [
    { name: 'Em Andamento', value: 45, color: '#3B82F6' },
    { name: 'Concluídos', value: 30, color: '#10B981' },
    { name: 'Pendentes', value: 15, color: '#F59E0B' },
    { name: 'Cancelados', value: 10, color: '#EF4444' },
  ];

  const recentProcesses = [
    { id: '2024/001', type: 'Inexigibilidade', company: 'MedSupply Ltda', status: 'Em Andamento', date: '15/01/2024' },
    { id: '2024/002', type: 'Termo Aditivo', company: 'HealthCorp SA', status: 'Pendente', date: '18/01/2024' },
    { id: '2024/003', type: 'Reajuste', company: 'BioMed Soluções', status: 'Concluído', date: '20/01/2024' },
  ];

  const upcomingDeadlines = [
    { process: '2023/089', deadline: '28/01/2024', type: 'Vencimento Contrato', priority: 'Alta' },
    { process: '2023/156', deadline: '02/02/2024', type: 'Prazo Recurso', priority: 'Média' },
    { process: '2024/005', deadline: '05/02/2024', type: 'Entrega Documentos', priority: 'Baixa' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral dos processos e contratos administrativos</p>
      </div>

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
