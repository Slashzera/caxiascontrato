
import React, { useState } from 'react';
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

  const reportTypes = [
    { id: 'processes', name: 'Relatório de Processos', icon: FileText },
    { id: 'contracts', name: 'Relatório de Contratos', icon: Building2 },
    { id: 'companies', name: 'Relatório de Empresas', icon: Users },
    { id: 'financial', name: 'Relatório Financeiro', icon: BarChart3 },
  ];

  const processData = [
    { month: 'Jan', inexigibilidade: 4, termoAditivo: 6, reajuste: 3, outros: 2 },
    { month: 'Fev', inexigibilidade: 7, termoAditivo: 4, reajuste: 5, outros: 3 },
    { month: 'Mar', inexigibilidade: 5, termoAditivo: 8, reajuste: 2, outros: 4 },
    { month: 'Abr', inexigibilidade: 6, termoAditivo: 5, reajuste: 7, outros: 2 },
    { month: 'Mai', inexigibilidade: 8, termoAditivo: 7, reajuste: 4, outros: 5 },
    { month: 'Jun', inexigibilidade: 9, termoAditivo: 6, reajuste: 6, outros: 3 },
  ];

  const valueData = [
    { month: 'Jan', valor: 850000 },
    { month: 'Fev', valor: 920000 },
    { month: 'Mar', valor: 780000 },
    { month: 'Abr', valor: 1100000 },
    { month: 'Mai', valor: 950000 },
    { month: 'Jun', valor: 1250000 },
  ];

  const summaryStats = [
    { title: 'Total de Processos', value: '87', subtitle: 'Últimos 30 dias', color: 'text-blue-600' },
    { title: 'Valor Total Contratado', value: 'R$ 5.8M', subtitle: 'Este ano', color: 'text-green-600' },
    { title: 'Tempo Médio', value: '45 dias', subtitle: 'Conclusão processo', color: 'text-purple-600' },
    { title: 'Taxa de Aprovação', value: '92%', subtitle: 'Processos aprovados', color: 'text-orange-600' },
  ];

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
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Atualizar
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
        {summaryStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        ))}
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
            {[
              { action: 'Processo criado', process: 'PROC-2024-015', user: 'Maria Silva', time: '2 horas atrás', status: 'novo' },
              { action: 'Contrato assinado', process: 'CT-2024-008', user: 'João Santos', time: '4 horas atrás', status: 'concluido' },
              { action: 'Documento aprovado', process: 'PROC-2024-012', user: 'Ana Costa', time: '1 dia atrás', status: 'aprovado' },
              { action: 'Prazo vencendo', process: 'PROC-2023-189', user: 'Sistema', time: '2 dias atrás', status: 'alerta' },
            ].map((activity, index) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
