
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Eye, Edit, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import NewContractForm from './NewContractForm';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          companies (name, cnpj)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedContracts = (data || []).map(contract => ({
        id: contract.contract_number,
        company: contract.companies?.name || 'N/A',
        object: contract.object,
        startDate: new Date(contract.start_date).toLocaleDateString('pt-BR'),
        endDate: new Date(contract.end_date).toLocaleDateString('pt-BR'),
        value: `R$ ${contract.value.toLocaleString('pt-BR')}`,
        status: contract.status,
        fiscalResponsible: contract.fiscal_responsible,
        cnpj: contract.companies?.cnpj || 'N/A'
      }));

      setContracts(formattedContracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast({
        title: "Erro ao carregar contratos",
        description: "Não foi possível carregar os contratos",
        variant: "destructive",
      });
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  const filteredContracts = contracts.filter(contract =>
    contract.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.object.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Vigente':
        return 'default';
      case 'Vencendo':
        return 'destructive';
      case 'Vencido':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestão de Contratos</h1>
          <p className="text-gray-600">Controlar contratos administrativos e suas vigências</p>
        </div>
        
        <NewContractForm onContractCreated={fetchContracts} />
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por empresa, número do contrato ou objeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contracts Grid */}
      <div className="grid gap-6">
        {filteredContracts.map((contract) => (
          <Card key={contract.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{contract.id}</CardTitle>
                  <p className="text-gray-600 mt-1">{contract.company}</p>
                  <p className="text-sm text-gray-500">{contract.cnpj}</p>
                </div>
                <Badge variant={getStatusColor(contract.status)}>
                  {contract.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Objeto do Contrato</h4>
                  <p className="text-gray-600">{contract.object}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Início</p>
                      <p className="font-medium">{contract.startDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-xs text-gray-500">Fim</p>
                      <p className="font-medium">{contract.endDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Valor</p>
                      <p className="font-medium">{contract.value}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500">Fiscal Responsável</p>
                    <p className="font-medium">{contract.fiscalResponsible}</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Building2 className="w-4 h-4 mr-2" />
                    Processos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato encontrado</h3>
            <p className="text-gray-600">Tente ajustar os termos de busca ou cadastre um novo contrato.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractManagement;
