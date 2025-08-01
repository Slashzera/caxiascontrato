import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NewDocumentFormProps {
  onDocumentCreated: () => void;
}

const NewDocumentForm = ({ onDocumentCreated }: NewDocumentFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processes, setProcesses] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Mudança: array de arquivos
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    process_id: '',
    uploaded_by: ''
  });

  const documentTypes = ['Contrato', 'Termo Aditivo', 'Planilha', 'Parecer', 'Ofício', 'Certidão'];

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchProcesses = async () => {
    try {
      const { data, error } = await supabase
        .from('processes')
        .select('id, process_number')
        .order('process_number');

      if (error) throw error;
      setProcesses(data || []);
    } catch (error) {
      console.error('Error fetching processes:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); // Mudança: pegar todos os arquivos
    const validFiles: File[] = [];
    
    files.forEach(file => {
      // Verificar se é PDF
      if (file.type !== 'application/pdf') {
        toast({
          title: "Tipo de arquivo inválido",
          description: `${file.name}: Apenas arquivos PDF são aceitos`,
          variant: "destructive",
        });
        return;
      }
      
      // Verificar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `${file.name}: O arquivo deve ter no máximo 10MB`,
          variant: "destructive",
        });
        return;
      }
      
      validFiles.push(file);
    });
    
    setSelectedFiles(validFiles);
    if (validFiles.length > 0 && !formData.name) {
      setFormData(prev => ({ ...prev, name: validFiles[0].name.replace('.pdf', '') }));
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${formData.process_id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      toast({
        title: "Arquivo obrigatório",
        description: "Selecione pelo menos um arquivo PDF para fazer upload",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let successCount = 0;
      
      // Upload de todos os arquivos
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        try {
          // Upload do arquivo
          const fileUrl = await uploadFile(file);
          
          // Criar registro no banco
          const documentData = {
            ...formData,
            name: selectedFiles.length > 1 ? `${formData.name} - ${file.name.replace('.pdf', '')}` : formData.name,
            file_url: fileUrl,
            size: formatFileSize(file.size)
          };

          const { error } = await supabase
            .from('documents')
            .insert([documentData]);

          if (error) throw error;
          
          successCount++;
          setUploadProgress(((i + 1) / selectedFiles.length) * 100);
        } catch (fileError) {
          console.error(`Error uploading ${file.name}:`, fileError);
          toast({
            title: "Erro no upload",
            description: `Falha ao enviar ${file.name}`,
            variant: "destructive",
          });
        }
      }

      if (successCount > 0) {
        toast({
          title: "Upload concluído",
          description: `${successCount} de ${selectedFiles.length} arquivo(s) enviado(s) com sucesso`,
        });
      }

      // Reset form
      setFormData({
        name: '',
        type: '',
        process_id: '',
        uploaded_by: ''
      });
      setSelectedFiles([]);
      setUploadProgress(0);
      setIsOpen(false);
      onDocumentCreated();
    } catch (error) {
      console.error('Error creating documents:', error);
      toast({
        title: "Erro ao enviar documentos",
        description: "Não foi possível fazer upload dos arquivos",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Documento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Documento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Documento*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome do documento"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Tipo de Documento*</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="process_id">Processo</Label>
              <Select 
                value={formData.process_id} 
                onValueChange={(value) => setFormData({ ...formData, process_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um processo" />
                </SelectTrigger>
                <SelectContent>
                  {processes.map((process: any) => (
                    <SelectItem key={process.id} value={process.id}>
                      {process.process_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="uploaded_by">Enviado por</Label>
            <Input
              id="uploaded_by"
              value={formData.uploaded_by}
              onChange={(e) => setFormData({ ...formData, uploaded_by: e.target.value })}
              placeholder="Nome do responsável"
            />
          </div>

          {/* Upload de Arquivo */}
          <div>
            <Label htmlFor="file">Arquivos PDF*</Label>
            <div className="mt-2">
              {selectedFiles.length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Clique para selecionar arquivos PDF
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          Máximo 10MB por arquivo - Múltiplos arquivos permitidos
                        </span>
                      </label>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".pdf"
                        multiple // Mudança: permitir múltiplos arquivos
                        className="sr-only"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-red-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newFiles = selectedFiles.filter((_, i) => i !== index);
                            setSelectedFiles(newFiles);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2">
                    <label htmlFor="file-upload-additional" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        Adicionar mais arquivos
                      </Button>
                    </label>
                    <input
                      id="file-upload-additional"
                      type="file"
                      accept=".pdf"
                      multiple
                      className="sr-only"
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files || []);
                        const validFiles: File[] = [];
                        
                        newFiles.forEach(file => {
                          if (file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024) {
                            validFiles.push(file);
                          }
                        });
                        
                        setSelectedFiles(prev => [...prev, ...validFiles]);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedFile}>
              {isSubmitting ? 'Enviando...' : 'Enviar Documento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewDocumentForm;