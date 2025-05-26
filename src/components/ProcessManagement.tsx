
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Eye, Edit, FileText, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ProcessManagement = () => {
  const [processes, setProcesses] = useState([
    {
      id: '2024/001',
      type: 'Inexigibilidade',
      number: 'PROC-2024-001',
      openDate: '15/01/2024',
      responsible: 'Maria Silva',
      status: 'Em Andamento',
      company: 'MedSupply Ltda',
      object: 'Aquisição de equipamentos médicos',
      value: 'R$ 85.000,00'
    },
    {
      id: '2024/002',
      type: 'Termo Aditivo',
      number: 'PROC-2024-002',
      openDate: '18/01/2024',
      responsible: 'João Santos',
      status: 'Pendente',
      company: 'HealthCorp SA',
      object: 'Prorrogação de contrato de serviços',
      value: 'R$ 120.000,00'
    },
    {
      id: '2024/003',
      type: 'Reajuste de Preços',
      number: 'PROC-2024-003',
      openDate: '20/01/2024',
      responsible: 'Ana Costa',
      status: 'Concluído',
      company: 'BioMed Soluções',
      object: 'Reajuste anual de medicamentos',
      value: 'R$ 45.000,00'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const processTypes = [
    'Inexigibilidade',
    'Termo Aditivo / Prorrogação',
    'Reajuste de Preços',
    'Reequilíbrio Econômico',
    'Repactuação',
    'Rescisão Contratual',
    'Sanção Administrativa',
    'Termo de Ajustes de Contas',
    'Piso da Enfermagem',
    'Isenção de IPTU',
    'Pagamentos'
  ];

  const [newProcess, setNewProcess] = useState({
    type: '',
    number: '',
    responsible: '',
    company: '',
    object: '',
    value: '',
    description: ''
  });

  const handleCreateProcess = () => {
    if (!newProcess.type || !newProcess.number || !newProcess.responsible) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const process = {
      id: `2024/${String(processes.length + 1).padStart(3, '0')}`,
      ...newProcess,
      openDate: new Date().toLocaleDateString('pt-BR'),
      status: 'Em Andamento'
    };

    setProcesses([...processes, process]);
    setNewProcess({
      type: '',
      number: '',
      responsible: '',
      company: '',
      object: '',
      value: '',
      description: ''
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Processo criado com sucesso!",
      description: `Processo ${process.id} foi criado`,
    });
  };

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Processos</h1>
          <p className="text-gray-600">Gerenciar processos administrativos da secretaria</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Processo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Processo</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo de Processo *</Label>
                <Select value={newProcess.type} onValueChange={(value) => setNewProcess({...newProcess, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {processTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="number">Número do Processo *</Label>
                <Input
                  id="number"
                  value={newProcess.number}
                  onChange={(e) => setNewProcess({...newProcess, number: e.target.value})}
                  placeholder="PROC-2024-XXX"
                />
              </div>
              
              <div>
                <Label htmlFor="responsible">Responsável *</Label>
                <Input
                  id="responsible"
                  value={newProcess.responsible}
                  onChange={(e) => setNewProcess({...newProcess, responsible: e.target.value})}
                  placeholder="Nome do responsável"
                />
              </div>
              
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={newProcess.company}
                  onChange={(e) => setNewProcess({...newProcess, company: e.target.value})}
                  placeholder="Nome da empresa"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="object">Objeto</Label>
                <Input
                  id="object"
                  value={newProcess.object}
                  onChange={(e) => setNewProcess({...newProcess, object: e.target.value})}
                  placeholder="Descrição do objeto"
                />
              </div>
              
              <div>
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  value={newProcess.value}
                  onChange={(e) => setNewProcess({...newProcess, value: e.target.value})}
                  placeholder="R$ 0,00"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newProcess.description}
                  onChange={(e) => setNewProcess({...newProcess, description: e.target.value})}
                  placeholder="Descrição detalhada do processo"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateProcess} className="bg-blue-600 hover:bg-blue-700">
                Criar Processo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por número, empresa ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Process List */}
      <div className="grid gap-4">
        {filteredProcesses.map((process) => (
          <Card key={process.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="font-semibold text-lg">{process.number}</h3>
                    <Badge variant={
                      process.status === 'Concluído' ? 'default' :
                      process.status === 'Em Andamento' ? 'secondary' : 'destructive'
                    }>
                      {process.status}
                    </Badge>
                    <Badge variant="outline">{process.type}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Empresa:</span>
                      <p className="font-medium">{process.company}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Responsável:</span>
                      <p className="font-medium">{process.responsible}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Data Abertura:</span>
                      <p className="font-medium">{process.openDate}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Valor:</span>
                      <p className="font-medium">{process.value}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mt-2">{process.object}</p>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProcesses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum processo encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros de busca ou criar um novo processo.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcessManagement;
