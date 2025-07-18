
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Eye, Edit, Phone, Mail, Building, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import NewCompanyForm from './NewCompanyForm';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, company: null });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Erro ao carregar empresas",
        description: "Não foi possível carregar as empresas",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCompany = async () => {
    if (!deleteDialog.company) return;

    try {
      // Get the full company data before moving to trash
      const { data: companyData, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', deleteDialog.company.id)
        .single();

      if (fetchError) throw fetchError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Move to trash
      const { error: trashError } = await supabase
        .from('trash')
        .insert({
          item_type: 'company',
          item_id: deleteDialog.company.id.toString(),
          item_data: companyData,
          original_table: 'companies',
          deleted_by: user.id
        });

      if (trashError) throw trashError;

      // Delete from original table
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', deleteDialog.company.id);

      if (deleteError) throw deleteError;

      await fetchCompanies();
      closeDeleteDialog();
      
      toast({
        title: "Empresa movida para a lixeira!",
        description: `Empresa ${deleteDialog.company.name} foi movida para a lixeira`,
      });
    } catch (error) {
      console.error('Error moving company to trash:', error);
      toast({
        title: "Erro ao mover empresa",
        description: "Não foi possível mover a empresa para a lixeira",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (company) => {
    setDeleteDialog({ isOpen: true, company });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, company: null });
  };

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
        
        <NewCompanyForm onCompanyCreated={fetchCompanies} />
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
                      {company.active_contracts}
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
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDeleteDialog(company)}
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

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-600">Tente ajustar os termos de busca ou cadastre uma nova empresa.</p>
          </CardContent>
        </Card>
      )}
      
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteCompany}
        title="Excluir Empresa"
        description="Esta ação não pode ser desfeita. A empresa será permanentemente removida do sistema."
        itemName={deleteDialog.company?.name || ''}
      />
    </div>
  );
};

export default CompanyManagement;
