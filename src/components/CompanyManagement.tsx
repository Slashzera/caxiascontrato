
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Eye, Edit, Phone, Mail, Building } from 'lucide-react';

const CompanyManagement = () => {
  const [companies] = useState([
    {
      id: 1,
      name: 'MedSupply Ltda',
      cnpj: '12.345.678/0001-90',
      contact: 'João Silva',
      phone: '(21) 3456-7890',
      email: 'contato@medsupply.com.br',
      address: 'Rua das Flores, 123 - Centro, Duque de Caxias/RJ',
      activeContracts: 3,
      status: 'Ativo'
    },
    {
      id: 2,
      name: 'HealthCorp SA',
      cnpj: '98.765.432/0001-10',
      contact: 'Maria Santos',
      phone: '(21) 2987-6543',
      email: 'comercial@healthcorp.com.br',
      address: 'Av. Principal, 456 - Jardim Primavera, Duque de Caxias/RJ',
      activeContracts: 2,
      status: 'Ativo'
    },
    {
      id: 3,
      name: 'BioMed Soluções',
      cnpj: '11.222.333/0001-44',
      contact: 'Carlos Costa',
      phone: '(21) 3214-5678',
      email: 'atendimento@biomed.com.br',
      address: 'Rua da Saúde, 789 - Vila Nova, Duque de Caxias/RJ',
      activeContracts: 1,
      status: 'Ativo'
    },
    {
      id: 4,
      name: 'TechMed Equipamentos',
      cnpj: '44.555.666/0001-77',
      contact: 'Ana Oliveira',
      phone: '(21) 3789-0123',
      email: 'vendas@techmed.com.br',
      address: 'Rua dos Equipamentos, 321 - Industrial, Duque de Caxias/RJ',
      activeContracts: 0,
      status: 'Inativo'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj.includes(searchTerm) ||
    company.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    return status === 'Ativo' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Empresas</h1>
          <p className="text-gray-600">Cadastro e informações das empresas contratadas</p>
        </div>
        
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Users className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, CNPJ ou contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <p className="text-gray-600 mt-1">CNPJ: {company.cnpj}</p>
                </div>
                <Badge variant={getStatusColor(company.status)}>
                  {company.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Contato</p>
                      <p className="font-medium">{company.contact}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="font-medium">{company.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-xs text-gray-500">E-mail</p>
                      <p className="font-medium">{company.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Building className="w-4 h-4 text-orange-600 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500">Endereço</p>
                      <p className="font-medium text-sm">{company.address}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">Contratos Ativos</span>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {company.activeContracts}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-600">Tente ajustar os termos de busca ou cadastre uma nova empresa.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompanyManagement;
