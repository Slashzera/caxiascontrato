
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Download, Calendar, FileText, Building2, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState('processes');
  const [dateRange, setDateRange] = useState('last30days');
  const [summaryStats, setSummaryStats] = useState([]);
  const [processData, setProcessData] = useState([]);
  const [valueData, setValueData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const reportTypes = [
    { id: 'processes', name: 'Relatório de Processos', icon: FileText },
    { id: 'contracts', name: 'Relatório de Contratos', icon: Building2 },
    { id: 'companies', name: 'Relatório de Empresas', icon: Users },
    { id: 'financial', name: 'Relatório Financeiro', icon: BarChart3 },
  ];

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSummaryStats(),
        fetchProcessData(),
        fetchValueData(),
        fetchRecentActivities()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryStats = async () => {
    const [processesResult, contractsResult, companiesResult] = await Promise.all([
      supabase.from('processes').select('*'),
      supabase.from('contracts').select('value'),
      supabase.from('companies').select('*')
    ]);

    const totalProcesses = processesResult.data?.length || 0;
    const totalValue = contractsResult.data?.reduce((sum, contract) => sum + (contract.value || 0), 0) || 0;
    const totalCompanies = companiesResult.data?.length || 0;

    // Calcular processos dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentProcesses = processesResult.data?.filter(process => 
      new Date(process.created_at) >= thirtyDaysAgo
    ).length || 0;

    // Calcular taxa de aprovação (processos concluídos vs total)
    const approvedProcesses = processesResult.data?.filter(process => 
      process.status === 'Concluído'
    ).length || 0;
    const approvalRate = totalProcesses > 0 ? Math.round((approvedProcesses / totalProcesses) * 100) : 0;

    setSummaryStats([
      { 
        title: 'Total de Processos', 
        value: totalProcesses.toString(), 
        subtitle: `${recentProcesses} nos últimos 30 dias`, 
        color: 'text-blue-600' 
      },
      { 
        title: 'Valor Total Contratado', 
        value: `R$ ${(totalValue / 1000000).toFixed(1)}M`, 
        subtitle: 'Este ano', 
        color: 'text-green-600' 
      },
      { 
        title: 'Total de Empresas', 
        value: totalCompanies.toString(), 
        subtitle: 'Cadastradas', 
        color: 'text-purple-600' 
      },
      { 
        title: 'Taxa de Aprovação', 
        value: `${approvalRate}%`, 
        subtitle: 'Processos concluídos', 
        color: 'text-orange-600' 
      },
    ]);
  };

  const fetchProcessData = async () => {
    const { data: processes } = await supabase.from('processes').select('process_type, created_at');
    
    if (!processes) {
      setProcessData([]);
      return;
    }

    // Agrupar por mês e tipo
    const monthlyData = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    processes.forEach(process => {
      const date = new Date(process.created_at);
      const month = monthNames[date.getMonth()];
      
      if (!monthlyData[month]) {
        monthlyData[month] = { month, inexigibilidade: 0, termoAditivo: 0, reajuste: 0, outros: 0 };
      }
      
      const type = process.process_type?.toLowerCase() || 'outros';
      if (type.includes('inexigibilidade')) {
        monthlyData[month].inexigibilidade++;
      } else if (type.includes('termo') || type.includes('aditivo')) {
        monthlyData[month].termoAditivo++;
      } else if (type.includes('reajuste')) {
        monthlyData[month].reajuste++;
      } else {
        monthlyData[month].outros++;
      }
    });
    
    setProcessData(Object.values(monthlyData).slice(-6)); // Últimos 6 meses
  };

  const fetchValueData = async () => {
    const { data: contracts } = await supabase.from('contracts').select('value, created_at');
    
    if (!contracts) {
      setValueData([]);
      return;
    }

    // Agrupar por mês
    const monthlyValues = {};
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    contracts.forEach(contract => {
      const date = new Date(contract.created_at);
      const month = monthNames[date.getMonth()];
      
      if (!monthlyValues[month]) {
        monthlyValues[month] = { month, valor: 0 };
      }
      
      monthlyValues[month].valor += contract.value || 0;
    });
    
    setValueData(Object.values(monthlyValues).slice(-6)); // Últimos 6 meses
  };

  const fetchRecentActivities = async () => {
    const [processesResult, contractsResult, documentsResult] = await Promise.all([
      supabase.from('processes').select('process_number, status, created_at').order('created_at', { ascending: false }).limit(2),
      supabase.from('contracts').select('contract_number, status, created_at').order('created_at', { ascending: false }).limit(2),
      supabase.from('documents').select('name, status, created_at').order('created_at', { ascending: false }).limit(2)
    ]);

    const activities: any[] = [];

    // Adicionar atividades de processos
    processesResult.data?.forEach(process => {
      activities.push({
        action: 'Processo criado',
        process: process.process_number,
        user: 'Sistema',
        time: getTimeAgo(process.created_at),
        created_at: process.created_at,
        status: process.status === 'Em Andamento' ? 'novo' : process.status === 'Concluído' ? 'concluido' : 'em-andamento'
      });
    });

    // Adicionar atividades de contratos
    contractsResult.data?.forEach(contract => {
      activities.push({
        action: 'Contrato criado',
        process: contract.contract_number,
        user: 'Sistema',
        time: getTimeAgo(contract.created_at),
        created_at: contract.created_at,
        status: contract.status === 'Vigente' ? 'concluido' : 'novo'
      });
    });

    // Adicionar atividades de documentos
    documentsResult.data?.forEach(document => {
      activities.push({
        action: 'Documento enviado',
        process: document.name,
        user: 'Sistema',
        time: getTimeAgo(document.created_at),
        created_at: document.created_at,
        status: document.status === 'Aprovado' ? 'aprovado' : document.status === 'Pendente' ? 'novo' : 'em-andamento'
      });
    });

    // Ordenar por data e pegar os 4 mais recentes
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setRecentActivities(activities.slice(0, 4));
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora';
    if (diffInHours < 24) return `${diffInHours} horas atrás`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 dia atrás';
    return `${diffInDays} dias atrás`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatórios e Análises</h1>
        <p className="text-gray-600">Visualizar dados e gerar relatórios dos processos administrativos</p>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Configurações do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Tipo de Relatório</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Período</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                  <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                  <SelectItem value="last90days">Últimos 90 dias</SelectItem>
                  <SelectItem value="thisyear">Este ano</SelectItem>
                  <SelectItem value="lastyear">Ano passado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Data Início</Label>
              <Input type="date" />
            </div>
            
            <div>
              <Label>Data Fim</Label>
              <Input type="date" />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={fetchReportData} disabled={loading}>
              <Calendar className="w-4 h-4 mr-2" />
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="text-center animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          summaryStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Types Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Processos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inexigibilidade" stackId="a" fill="#3B82F6" name="Inexigibilidade" />
                <Bar dataKey="termoAditivo" stackId="a" fill="#10B981" name="Termo Aditivo" />
                <Bar dataKey="reajuste" stackId="a" fill="#F59E0B" name="Reajuste" />
                <Bar dataKey="outros" stackId="a" fill="#EF4444" name="Outros" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Financial Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Valores Contratados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={valueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']} />
                <Line type="monotone" dataKey="valor" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.process} - {activity.user}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      activity.status === 'novo' ? 'default' :
                      activity.status === 'concluido' ? 'secondary' :
                      activity.status === 'aprovado' ? 'outline' : 'destructive'
                    }>
                      {activity.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">Nenhuma atividade recente encontrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
