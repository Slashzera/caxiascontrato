-- Criar bucket para documentos
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

-- Políticas para o bucket de documentos
CREATE POLICY "Documentos são publicamente visíveis" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documents');

CREATE POLICY "Usuários podem fazer upload de documentos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Usuários podem atualizar documentos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documents');

CREATE POLICY "Usuários podem deletar documentos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documents');