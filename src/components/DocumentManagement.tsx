
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Search, Upload, Eye, Download, File } from 'lucide-react';

const DocumentManagement = () => {
  const [documents] = useState([
    {
      id: 1,
      name: 'Contrato_MedSupply_2024.pdf',
      type: 'Contrato',
      process: 'PROC-2024-001',
      uploadDate: '15/01/2024',
      size: '2.3 MB',
      uploadedBy: 'Maria Silva',
      status: 'Aprovado'
    },
    {
      id: 2,
      name: 'Termo_Aditivo_HealthCorp.pdf',
      type: 'Termo Aditivo',
      process: 'PROC-2024-002',
      uploadDate: '18/01/2024',
      size: '1.8 MB',
      uploadedBy: 'João Santos',
      status: 'Pendente'
    },
    {
      id: 3,
      name: 'Planilha_Reajuste_BioMed.xlsx',
      type: 'Planilha',
      process: 'PROC-2024-003',
      uploadDate: '20/01/2024',
      size: '856 KB',
      uploadedBy: 'Ana Costa',
      status: 'Aprovado'
    },
    {
      id: 4,
      name: 'Parecer_Juridico_001.docx',
      type: 'Parecer',
      process: 'PROC-2024-001',
      uploadDate: '22/01/2024',
      size: '1.2 MB',
      uploadedBy: 'Dr. Carlos Silva',
      status: 'Aprovado'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const documentTypes = ['Contrato', 'Termo Aditivo', 'Planilha', 'Parecer', 'Ofício', 'Certidão'];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.process.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aprovado':
        return 'default';
      case 'Pendente':
        return 'secondary';
      case 'Rejeitado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return <File className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Documentos</h1>
          <p className="text-gray-600">Centralizar e organizar documentos dos processos</p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Documento
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome do arquivo ou processo..."
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
                {documentTypes.map((type) => (
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
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getFileIcon(document.name)}
                  <div>
                    <h3 className="font-medium text-gray-900">{document.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>Processo: {document.process}</span>
                      <span>•</span>
                      <span>Enviado por: {document.uploadedBy}</span>
                      <span>•</span>
                      <span>{document.uploadDate}</span>
                      <span>•</span>
                      <span>{document.size}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">{document.type}</Badge>
                  <Badge variant={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros de busca ou faça upload de um novo documento.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentManagement;
