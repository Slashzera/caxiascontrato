
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Eye, Edit, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import NewContractForm from './NewContractForm';
import ContractDocuments from './ContractDocuments';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, contract: null });
  const [editDialog, setEditDialog] = useState({ isOpen: false, contract: null });
  const [searchTerm, setSearchTerm] = useState('');

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
        contractId: contract.id,
        company_id: contract.company_id, // IMPORTANTE: Esta linha deve estar presente
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

  const handleProcessesClick = (contract) => {
    setSelectedContract(contract);
    setShowDocuments(true);
  };

  const handleBackToContracts = () => {
    setShowDocuments(false);
    setSelectedContract(null);
  };

  const handleDeleteContract = async () => {
    if (!deleteDialog.contract) return;

    try {
      // Get the full contract data before moving to trash
      const { data: contractData, error: fetchError } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', deleteDialog.contract.contractId)
        .single();

      if (fetchError) throw fetchError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Move to trash
      const { error: trashError } = await supabase
        .from('trash')
        .insert({
          item_type: 'contract',
          item_id: deleteDialog.contract.contractId,
          item_data: contractData,
          original_table: 'contracts',
          deleted_by: user.id
        });

      if (trashError) throw trashError;

      // Delete from original table
      const { error: deleteError } = await supabase
        .from('contracts')
        .delete()
        .eq('id', deleteDialog.contract.contractId);

      if (deleteError) throw deleteError;

      await fetchContracts();
      closeDeleteDialog();
      
      toast({
        title: "Contrato movido para a lixeira!",
        description: `Contrato ${deleteDialog.contract.id} foi movido para a lixeira`,
      });
    } catch (error) {
      console.error('Error moving contract to trash:', error);
      toast({
        title: "Erro ao mover contrato",
        description: "Não foi possível mover o contrato para a lixeira",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (contract) => {
    setDeleteDialog({ isOpen: true, contract });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, contract: null });
  };

  const handleEditContract = (contract) => {
    setEditDialog({ isOpen: true, contract });
  };

  const closeEditDialog = () => {
    setEditDialog({ isOpen: false, contract: null });
  };

  const handleViewContract = (contract) => {
    // Implementar visualização detalhada
    console.log('Visualizar contrato:', contract);
  };

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

  if (showDocuments && selectedContract) {
    return (
      <ContractDocuments
        contractId={selectedContract.contractId}
        contractNumber={selectedContract.id}
        onBack={handleBackToContracts}
      />
    );
  }

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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewContract(contract)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditContract(contract)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleProcessesClick(contract)}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Processos
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDeleteDialog(contract)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Apagar
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
      
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteContract}
        title="Excluir Contrato"
        description="Esta ação não pode ser desfeita. O contrato será permanentemente removido do sistema."
        itemName={deleteDialog.contract?.id || ''}
      />
      
      {/* Modal de Edição de Contrato */}
      {editDialog.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Editar Contrato</h2>
              <Button variant="ghost" onClick={closeEditDialog}>
                ×
              </Button>
            </div>
            <NewContractForm
              editData={editDialog.contract}
              onSuccess={() => {
                closeEditDialog();
                fetchContracts();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
