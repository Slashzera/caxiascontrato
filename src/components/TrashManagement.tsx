import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, RotateCcw, Search, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface TrashItem {
  id: string;
  item_type: string;
  item_id: string;
  item_data: any;
  deleted_at: string;
  original_table: string;
}

const TrashManagement = () => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null as TrashItem | null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrashItems();
  }, []);

  const fetchTrashItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trash')
        .select('*')
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      setTrashItems(data || []);
    } catch (error) {
      console.error('Error fetching trash items:', error);
      toast({
        title: "Erro ao carregar lixeira",
        description: "Não foi possível carregar os itens da lixeira",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (item: TrashItem) => {
    try {
      // Restore item to original table
      const { error: insertError } = await supabase
        .from(item.original_table)
        .insert(item.item_data);

      if (insertError) throw insertError;

      // Remove from trash
      const { error: deleteError } = await supabase
        .from('trash')
        .delete()
        .eq('id', item.id);

      if (deleteError) throw deleteError;

      await fetchTrashItems();
      
      toast({
        title: "Item restaurado com sucesso!",
        description: `${getItemTypeLabel(item.item_type)} foi restaurado`,
      });
    } catch (error) {
      console.error('Error restoring item:', error);
      toast({
        title: "Erro ao restaurar item",
        description: "Não foi possível restaurar o item",
        variant: "destructive",
      });
    }
  };

  const permanentlyDeleteItem = async () => {
    if (!deleteDialog.item) return;

    try {
      const { error } = await supabase
        .from('trash')
        .delete()
        .eq('id', deleteDialog.item.id);

      if (error) throw error;

      await fetchTrashItems();
      closeDeleteDialog();
      
      toast({
        title: "Item excluído permanentemente!",
        description: `${getItemTypeLabel(deleteDialog.item.item_type)} foi excluído permanentemente`,
      });
    } catch (error) {
      console.error('Error permanently deleting item:', error);
      toast({
        title: "Erro ao excluir item",
        description: "Não foi possível excluir o item permanentemente",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (item: TrashItem) => {
    setDeleteDialog({ isOpen: true, item });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, item: null });
  };

  const getItemTypeLabel = (type: string) => {
    const labels = {
      'process': 'Processo',
      'contract': 'Contrato',
      'company': 'Empresa',
      'document': 'Documento'
    };
    return labels[type] || type;
  };

  const getItemTypeBadgeColor = (type: string) => {
    const colors = {
      'process': 'bg-blue-500',
      'contract': 'bg-green-500',
      'company': 'bg-purple-500',
      'document': 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getDaysUntilDeletion = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt);
    const expirationDate = new Date(deletedDate.getTime() + (30 * 24 * 60 * 60 * 1000));
    const now = new Date();
    const daysLeft = Math.ceil((expirationDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  const getItemDisplayName = (item: TrashItem) => {
    const data = item.item_data;
    switch (item.item_type) {
      case 'process':
        return data.process_number || data.number || 'Processo sem número';
      case 'contract':
        return data.id || 'Contrato';
      case 'company':
        return data.name || 'Empresa';
      case 'document':
        return data.name || data.title || 'Documento';
      default:
        return 'Item';
    }
  };

  const filteredItems = trashItems.filter(item => {
    const matchesSearch = getItemDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.item_type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando lixeira...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lixeira</h1>
          <p className="text-gray-600 mt-2">
            Itens excluídos são mantidos por 30 dias antes da exclusão permanente
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar itens na lixeira..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os tipos</option>
          <option value="process">Processos</option>
          <option value="contract">Contratos</option>
          <option value="company">Empresas</option>
          <option value="document">Documentos</option>
        </select>
      </div>

      {/* Lista de itens */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || typeFilter !== 'all' ? 'Nenhum item encontrado' : 'Lixeira vazia'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Não há itens excluídos no momento.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredItems.map((item) => {
            const daysLeft = getDaysUntilDeletion(item.deleted_at);
            const isExpiringSoon = daysLeft <= 7;
            
            return (
              <Card key={item.id} className={`${isExpiringSoon ? 'border-red-200 bg-red-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={`${getItemTypeBadgeColor(item.item_type)} text-white`}>
                          {getItemTypeLabel(item.item_type)}
                        </Badge>
                        <h3 className="font-semibold text-lg">{getItemDisplayName(item)}</h3>
                        {isExpiringSoon && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Expira em breve
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Excluído em: {new Date(item.deleted_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div className={`font-medium ${isExpiringSoon ? 'text-red-600' : 'text-gray-700'}`}>
                          {daysLeft > 0 
                            ? `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}` 
                            : 'Expira hoje'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreItem(item)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restaurar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(item)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Permanentemente
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={permanentlyDeleteItem}
        title="Excluir Permanentemente"
        description="Esta ação não pode ser desfeita. O item será excluído permanentemente do sistema e não poderá ser recuperado."
        itemName={deleteDialog.item ? getItemDisplayName(deleteDialog.item) : ''}
      />
    </div>
  );
};

export default TrashManagement;