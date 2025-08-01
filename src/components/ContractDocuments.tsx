import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Download, Eye, Trash2, FileText, ArrowLeft, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import ProcessManagement from './ProcessManagement';

interface ContractDocumentsProps {
  contractId: string;
  contractNumber: string;
  onBack: () => void;
}

interface Document {
  id: string;
  name: string;
  file_url: string;
  file_size: number;
  created_at: string;
  uploaded_by: string;
}

const ContractDocuments: React.FC<ContractDocumentsProps> = ({ contractId, contractNumber, onBack }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, document: null as Document | null });
  const [showProcesses, setShowProcesses] = useState(false);

  useEffect(() => {
    if (contractId) {
      console.log('ContractDocuments mounted with contractId:', contractId);
      fetchDocuments();
    } else {
      console.error('ContractDocuments: contractId is missing!');
    }
  }, [contractId]);

  const fetchDocuments = async () => {
    if (!contractId) {
      console.error('Cannot fetch documents: contractId is missing');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Fetching documents for contractId:', contractId);
      
      // First, let's check if the table exists and we can query it
      const { data, error, count } = await supabase
        .from('contract_documents')
        .select('*', { count: 'exact' })
        .eq('contract_id', contractId)
        .order('created_at', { ascending: false });

      if (error) {
         console.error('Supabase error:', error);
         throw error;
       }
       
       console.log('Documents fetched:', data);
       console.log('Total count:', count);
       console.log('Contract ID used in query:', contractId);
       setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Erro ao carregar documentos",
        description: "Não foi possível carregar os documentos do contrato",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas arquivos PDF são permitidos",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
      setFileName(file.name.replace('.pdf', ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileName.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um arquivo e informe um nome",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = 'pdf';
      const filePath = `contracts/${contractId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save document record to database
      const documentData = {
        contract_id: contractId,
        name: fileName,
        file_url: publicUrl,
        file_size: selectedFile.size,
        mime_type: 'application/pdf',
        uploaded_by: 'Usuário Atual' // TODO: Replace with actual user
      };
      
      console.log('Inserting document data:', documentData);
      
      const { data: insertedData, error: dbError } = await supabase
        .from('contract_documents')
        .insert(documentData)
        .select();

      if (dbError) {
        console.error('Database insert error:', dbError);
        throw dbError;
      }
      
      console.log('Document inserted successfully:', insertedData);

      toast({
        title: "Upload realizado com sucesso",
        description: "O documento foi adicionado ao contrato",
      });

      setSelectedFile(null);
      setFileName('');
      setIsUploadDialogOpen(false);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload do documento",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(document.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${document.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o documento",
        variant: "destructive",
      });
    }
  };

  const handleView = (document: Document) => {
    window.open(document.file_url, '_blank');
  };

  const handleDeleteDocument = async () => {
    if (!deleteDialog.document) return;

    try {
      // Get the full document data before moving to trash
      const { data: documentData, error: fetchError } = await supabase
        .from('contract_documents')
        .select('*')
        .eq('id', deleteDialog.document.id)
        .single();

      if (fetchError) throw fetchError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Move to trash
      const { error: trashError } = await supabase
        .from('trash')
        .insert({
          item_type: 'document',
          item_id: deleteDialog.document.id,
          item_data: documentData,
          original_table: 'contract_documents',
          deleted_by: user.id
        });

      if (trashError) throw trashError;

      // Delete from original table
      const { error: deleteError } = await supabase
        .from('contract_documents')
        .delete()
        .eq('id', deleteDialog.document.id);

      if (deleteError) throw deleteError;

      await fetchDocuments();
      closeDeleteDialog();
      
      toast({
        title: "Documento movido para a lixeira!",
        description: `Documento ${deleteDialog.document.name} foi movido para a lixeira`,
      });
    } catch (error) {
      console.error('Error moving document to trash:', error);
      toast({
        title: "Erro ao mover documento",
        description: "Não foi possível mover o documento para a lixeira",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (document: Document) => {
    setDeleteDialog({ isOpen: true, document });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({ isOpen: false, document: null });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  // Modificar a condição para renderizar ProcessManagement
  if (showProcesses) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => setShowProcesses(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Documentos
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Processos do Contrato</h1>
            <p className="text-gray-600">{contractNumber}</p>
          </div>
        </div>
      </div>
      <ProcessManagement />
    </div>
  );
}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentos do Contrato</h1>
            <p className="text-gray-600">{contractNumber}</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={() => navigate('/processos')} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Novo Processo
          </Button>
          
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Novo Documento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload de Documento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Arquivo PDF</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fileName">Nome do Documento</Label>
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Digite o nome do documento"
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4">
        {documents.map((document) => (
          <Card key={document.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <FileText className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{document.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>{formatFileSize(document.file_size)}</span>
                      <span>•</span>
                      <span>Enviado em {new Date(document.created_at).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>Por {document.uploaded_by}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(document)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openDeleteDialog(document)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
            <p className="text-gray-600 mb-4">Este contrato ainda não possui documentos anexados.</p>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Adicionar Primeiro Documento
            </Button>
          </CardContent>
        </Card>
      )}

      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteDocument}
        title="Excluir Documento"
        description="Tem certeza que deseja mover este documento para a lixeira? Você poderá restaurá-lo dentro de 30 dias."
        itemName={deleteDialog.document?.name || ''}
      />
    </div>
  );
};

export default ContractDocuments;