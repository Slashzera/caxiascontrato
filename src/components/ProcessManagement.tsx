import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Eye, Edit, FileText, Calendar, Tag, CheckSquare, Trash2, Calculator } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ProcessMeasurements from './ProcessMeasurements';

const ProcessManagement = () => {
  const availableTags = [
    { name: 'RESOLVIDO', color: 'bg-green-500' },
    { name: 'PRESTAÇÃO DE SERVIÇO', color: 'bg-emerald-600' },
    { name: 'ADESÃO À ATA', color: 'bg-orange-400' },
    { name: 'AQUISIÇÃO GLOBAL', color: 'bg-orange-600' },
    { name: 'NOMEAÇÃO', color: 'bg-rose-300' },
    { name: 'URGENTE', color: 'bg-red-500' },
    { name: 'VENCIDO', color: 'bg-red-600' },
    { name: 'FORNECIMENTO DE INSUMO', color: 'bg-purple-400' },
    { name: 'DISPENSA DE LICITAÇÃO', color: 'bg-blue-400' },
    { name: 'ATA DE REGISTRO DE PREÇO', color: 'bg-blue-600' },
    { name: 'CLASSIFICAÇÃO', color: 'bg-cyan-400' },
    { name: 'DEMANDA ESPECÍFICA', color: 'bg-lime-400' },
    { name: 'OUVIDORIA', color: 'bg-green-400' },
    { name: 'ATA REGISTRO DE PREÇO', color: 'bg-pink-400' },
    { name: 'SIGFIS', color: 'bg-pink-500' },
    { name: 'LOCAÇÃO DE IMÓVEIS', color: 'bg-green-500' },
    { name: 'SUPRESSÃO', color: 'bg-green-600' },
    { name: 'CONVÊNIO - PRORROGAÇÃO', color: 'bg-yellow-300' },
    { name: 'REPASSE', color: 'bg-yellow-400' },
    { name: 'PRIORIDADE', color: 'bg-orange-400' },
    { name: 'REEQUILÍBRIO', color: 'bg-orange-600' },
    { name: 'ACRÉSCIMO', color: 'bg-red-400' },
    { name: 'RESCISÃO', color: 'bg-red-500' },
    { name: 'SUSPENSO', color: 'bg-red-600' },
    { name: 'PRORROGAÇÃO', color: 'bg-purple-500' },
    { name: 'A INSTRUIR', color: 'bg-purple-400' },
    { name: 'CHAMAMENTO PÚBLICO', color: 'bg-blue-500' },
    { name: 'LOCAÇÃO- PRORROGAÇÃO...', color: 'bg-cyan-500' }
  ];

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
      value: 'R$ 85.000,00',
      tags: ['PRESTAÇÃO DE SERVIÇO', 'URGENTE'],
      checklist: [
        { id: 1, text: 'Documentação da empresa verificada', completed: true },
        { id: 2, text: 'Orçamento aprovado', completed: false }
      ]
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
      value: 'R$ 120.000,00',
      tags: ['PRORROGAÇÃO'],
      checklist: []
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
      value: 'R$ 45.000,00',
      tags: ['RESOLVIDO'],
      checklist: [
        { id: 1, text: 'Cálculo de reajuste aprovado', completed: true },
        { id: 2, text: 'Termo assinado', completed: true }
      ]
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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
    description: '',
    tags: [],
    checklist: []
  });

  const [newChecklistItem, setNewChecklistItem] = useState('');

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
      status: 'Em Andamento',
      checklist: newProcess.checklist.map((item, index) => ({
        id: index + 1,
        text: item,
        completed: false
      }))
    };

    setProcesses([...processes, process]);
    setNewProcess({
      type: '',
      number: '',
      responsible: '',
      company: '',
      object: '',
      value: '',
      description: '',
      tags: [],
      checklist: []
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Processo criado com sucesso!",
      description: `Processo ${process.id} foi criado`,
    });
  };

  const handleViewProcess = (process) => {
    setSelectedProcess(process);
    setIsViewDialogOpen(true);
  };

  const handleEditProcess = (process) => {
    setSelectedProcess({ ...process });
    setIsEditDialogOpen(true);
  };

  const handleSaveProcess = () => {
    setProcesses(processes.map(p => 
      p.id === selectedProcess.id ? selectedProcess : p
    ));
    setIsEditDialogOpen(false);
    toast({
      title: "Processo atualizado!",
      description: "As alterações foram salvas com sucesso",
    });
  };

  const handleToggleTag = (tagName, isEdit = false) => {
    if (isEdit && selectedProcess) {
      const currentTags = selectedProcess.tags || [];
      const updatedTags = currentTags.includes(tagName)
        ? currentTags.filter(t => t !== tagName)
        : [...currentTags, tagName];
      setSelectedProcess({ ...selectedProcess, tags: updatedTags });
    } else {
      const currentTags = newProcess.tags || [];
      const updatedTags = currentTags.includes(tagName)
        ? currentTags.filter(t => t !== tagName)
        : [...currentTags, tagName];
      setNewProcess({ ...newProcess, tags: updatedTags });
    }
  };

  const handleAddChecklistItem = (isEdit = false) => {
    if (!newChecklistItem.trim()) return;
    
    if (isEdit && selectedProcess) {
      const newItem = {
        id: (selectedProcess.checklist?.length || 0) + 1,
        text: newChecklistItem,
        completed: false
      };
      setSelectedProcess({
        ...selectedProcess,
        checklist: [...(selectedProcess.checklist || []), newItem]
      });
    } else {
      setNewProcess({
        ...newProcess,
        checklist: [...(newProcess.checklist || []), newChecklistItem]
      });
    }
    setNewChecklistItem('');
  };

  const handleToggleChecklistItem = (itemId) => {
    if (selectedProcess) {
      const updatedChecklist = selectedProcess.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );
      setSelectedProcess({ ...selectedProcess, checklist: updatedChecklist });
    }
  };

  const handleRemoveChecklistItem = (itemId, isEdit = false) => {
    if (isEdit && selectedProcess) {
      const updatedChecklist = selectedProcess.checklist.filter(item => item.id !== itemId);
      setSelectedProcess({ ...selectedProcess, checklist: updatedChecklist });
    } else {
      const updatedChecklist = newProcess.checklist.filter((_, index) => index !== itemId);
      setNewProcess({ ...newProcess, checklist: updatedChecklist });
    }
  };

  const handleOpenMeasurements = (process) => {
    setSelectedProcess(process);
    setShowMeasurements(true);
  };

  const handleBackFromMeasurements = () => {
    setShowMeasurements(false);
    setSelectedProcess(null);
  };

  const filteredProcesses = processes.filter(process => {
    const matchesSearch = process.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         process.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || process.status === statusFilter;
    const matchesType = typeFilter === 'all' || process.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getTagColor = (tagName) => {
    const tag = availableTags.find(t => t.name === tagName);
    return tag ? tag.color : 'bg-gray-500';
  };

  if (showMeasurements && selectedProcess) {
    return (
      <ProcessMeasurements 
        process={selectedProcess} 
        onBack={handleBackFromMeasurements} 
      />
    );
  }

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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

              {/* Etiquetas */}
              <div className="col-span-2">
                <Label>Etiquetas</Label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                  {availableTags.map((tag) => (
                    <div key={tag.name} className="flex items-center space-x-2">
                      <Checkbox
                        checked={newProcess.tags?.includes(tag.name) || false}
                        onCheckedChange={() => handleToggleTag(tag.name)}
                      />
                      <Badge className={`${tag.color} text-white text-xs`}>
                        {tag.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div className="col-span-2">
                <Label>Checklist</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Digite um item do checklist..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                    />
                    <Button type="button" onClick={() => handleAddChecklistItem()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {newProcess.checklist?.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <CheckSquare className="w-4 h-4" />
                        <span className="flex-1">{item}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveChecklistItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {processTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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

                  {/* Etiquetas do processo */}
                  {process.tags && process.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {process.tags.map((tag) => (
                        <Badge key={tag} className={`${getTagColor(tag)} text-white text-xs`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
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

                  {/* Checklist resumido */}
                  {process.checklist && process.checklist.length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">
                        Checklist: {process.checklist.filter(item => item.completed).length}/{process.checklist.length} concluídos
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button variant="outline" size="sm" onClick={() => handleViewProcess(process)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditProcess(process)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleOpenMeasurements(process)}>
                    <Calculator className="w-4 h-4" />
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

      {/* Modal de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Visualizar Processo - {selectedProcess?.number}</DialogTitle>
          </DialogHeader>
          {selectedProcess && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <p className="font-medium">{selectedProcess.type}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={
                    selectedProcess.status === 'Concluído' ? 'default' :
                    selectedProcess.status === 'Em Andamento' ? 'secondary' : 'destructive'
                  }>
                    {selectedProcess.status}
                  </Badge>
                </div>
                <div>
                  <Label>Responsável</Label>
                  <p className="font-medium">{selectedProcess.responsible}</p>
                </div>
                <div>
                  <Label>Empresa</Label>
                  <p className="font-medium">{selectedProcess.company}</p>
                </div>
                <div className="col-span-2">
                  <Label>Objeto</Label>
                  <p className="font-medium">{selectedProcess.object}</p>
                </div>
              </div>

              {/* Etiquetas */}
              {selectedProcess.tags && selectedProcess.tags.length > 0 && (
                <div>
                  <Label>Etiquetas</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedProcess.tags.map((tag) => (
                      <Badge key={tag} className={`${getTagColor(tag)} text-white`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Checklist */}
              {selectedProcess.checklist && selectedProcess.checklist.length > 0 && (
                <div>
                  <Label>Checklist</Label>
                  <div className="space-y-2 mt-1">
                    {selectedProcess.checklist.map((item) => (
                      <div key={item.id} className="flex items-center space-x-2">
                        <Checkbox checked={item.completed} disabled />
                        <span className={item.completed ? 'line-through text-gray-500' : ''}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Processo - {selectedProcess?.number}</DialogTitle>
          </DialogHeader>
          {selectedProcess && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Processo</Label>
                  <Select 
                    value={selectedProcess.type} 
                    onValueChange={(value) => setSelectedProcess({...selectedProcess, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {processTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={selectedProcess.status} 
                    onValueChange={(value) => setSelectedProcess({...selectedProcess, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Responsável</Label>
                  <Input
                    value={selectedProcess.responsible}
                    onChange={(e) => setSelectedProcess({...selectedProcess, responsible: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label>Empresa</Label>
                  <Input
                    value={selectedProcess.company}
                    onChange={(e) => setSelectedProcess({...selectedProcess, company: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Objeto</Label>
                  <Input
                    value={selectedProcess.object}
                    onChange={(e) => setSelectedProcess({...selectedProcess, object: e.target.value})}
                  />
                </div>

                <div>
                  <Label>Valor</Label>
                  <Input
                    value={selectedProcess.value}
                    onChange={(e) => setSelectedProcess({...selectedProcess, value: e.target.value})}
                  />
                </div>
              </div>

              {/* Etiquetas */}
              <div>
                <Label>Etiquetas</Label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded p-2">
                  {availableTags.map((tag) => (
                    <div key={tag.name} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedProcess.tags?.includes(tag.name) || false}
                        onCheckedChange={() => handleToggleTag(tag.name, true)}
                      />
                      <Badge className={`${tag.color} text-white text-xs`}>
                        {tag.name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checklist */}
              <div>
                <Label>Checklist</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      placeholder="Digite um item do checklist..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem(true)}
                    />
                    <Button type="button" onClick={() => handleAddChecklistItem(true)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedProcess.checklist?.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Checkbox
                          checked={item.completed}
                          onCheckedChange={() => handleToggleChecklistItem(item.id)}
                        />
                        <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                          {item.text}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveChecklistItem(item.id, true)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveProcess} className="bg-blue-600 hover:bg-blue-700">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
