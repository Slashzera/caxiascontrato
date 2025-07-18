import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const UploadPage = () => {
  const { processId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async () => {
    if (!fileToUpload || !processId) {
      toast({
        title: 'Erro',
        description: 'Nenhum arquivo selecionado ou processo inválido.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
            const decodedProcessId = decodeURIComponent(processId);
      const sanitizedProcessNumber = decodedProcessId.replace(/\//g, '-');
      const filePath = `${sanitizedProcessNumber}/${fileToUpload.name}`;

      const { error } = await supabase.storage
        .from('process_documents')
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Upload concluído!',
        description: `O arquivo ${fileToUpload.name} foi enviado com sucesso.`,
      });

      navigate('/'); // Volta para a página principal após o sucesso

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o arquivo.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

          return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar currentPage="" onNavigate={(path) => navigate(path)} />
      <div className="flex flex-col sm:pl-14">
        <Header />
        <main className="flex-1 p-4 sm:px-6 sm:py-6">
          <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload de Arquivos para o Processo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Processo nº: <strong>{decodeURIComponent(processId || '')}</strong></p>
        <div>
          <Label htmlFor="file-upload">Selecionar PDF</Label>
          <Input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFileToUpload(e.target.files ? e.target.files[0] : null)}
            disabled={isUploading}
          />
          {fileToUpload && <p className="text-sm text-gray-500 mt-2">Arquivo selecionado: {fileToUpload.name}</p>}
        </div>
        <div className="flex justify-between items-center">
          <Button onClick={handleFileUpload} disabled={!fileToUpload || isUploading}>
            {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Voltar
          </Button>
        </div>
      </CardContent>
    </Card>
        </main>
      </div>
    </div>
  );
};

export default UploadPage;
