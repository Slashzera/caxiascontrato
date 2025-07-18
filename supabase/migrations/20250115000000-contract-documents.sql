-- Create contract_documents table
CREATE TABLE public.contract_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT DEFAULT 'application/pdf',
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contract_documents ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Public access to contract_documents" ON public.contract_documents FOR ALL USING (true) WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contract_documents_updated_at
BEFORE UPDATE ON public.contract_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();