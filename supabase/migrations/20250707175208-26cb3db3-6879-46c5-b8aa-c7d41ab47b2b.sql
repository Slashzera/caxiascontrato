-- Create companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT NOT NULL UNIQUE,
  contact TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  active_contracts INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contracts table
CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_number TEXT NOT NULL UNIQUE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  object TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'Vigente',
  fiscal_responsible TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create processes table
CREATE TABLE public.processes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_number TEXT NOT NULL UNIQUE,
  process_type TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  responsible TEXT,
  value DECIMAL(15,2),
  status TEXT DEFAULT 'Em Andamento',
  object TEXT,
  global_value DECIMAL(15,2),
  ceiling_value DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create process measurements table
CREATE TABLE public.process_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE,
  measurement_index INTEGER NOT NULL,
  field_index INTEGER NOT NULL,
  value DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE,
  upload_date DATE DEFAULT CURRENT_DATE,
  size TEXT,
  uploaded_by TEXT,
  status TEXT DEFAULT 'Pendente',
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies (making them public for now - adjust based on auth requirements)
CREATE POLICY "Public access to companies" ON public.companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to contracts" ON public.contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to processes" ON public.processes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to process_measurements" ON public.process_measurements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processes_updated_at
BEFORE UPDATE ON public.processes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_process_measurements_updated_at
BEFORE UPDATE ON public.process_measurements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.companies (name, cnpj, contact, phone, email, address, active_contracts, status) VALUES
('MedSupply Ltda', '12.345.678/0001-90', 'João Silva', '(21) 3456-7890', 'contato@medsupply.com.br', 'Rua das Flores, 123 - Centro, Duque de Caxias/RJ', 3, 'Ativo'),
('HealthCorp SA', '98.765.432/0001-10', 'Maria Santos', '(21) 2987-6543', 'comercial@healthcorp.com.br', 'Av. Principal, 456 - Jardim Primavera, Duque de Caxias/RJ', 2, 'Ativo'),
('BioMed Soluções', '11.222.333/0001-44', 'Carlos Costa', '(21) 3214-5678', 'atendimento@biomed.com.br', 'Rua da Saúde, 789 - Vila Nova, Duque de Caxias/RJ', 1, 'Ativo'),
('TechMed Equipamentos', '44.555.666/0001-77', 'Ana Oliveira', '(21) 3789-0123', 'vendas@techmed.com.br', 'Rua dos Equipamentos, 321 - Industrial, Duque de Caxias/RJ', 0, 'Inativo');

INSERT INTO public.contracts (contract_number, company_id, object, start_date, end_date, value, status, fiscal_responsible) VALUES
('CT-2024-001', (SELECT id FROM public.companies WHERE cnpj = '12.345.678/0001-90'), 'Fornecimento de equipamentos médicos', '2024-01-01', '2024-12-31', 850000.00, 'Vigente', 'Dr. Carlos Silva'),
('CT-2023-089', (SELECT id FROM public.companies WHERE cnpj = '98.765.432/0001-10'), 'Serviços de manutenção hospitalar', '2023-06-15', '2024-06-14', 1200000.00, 'Vencendo', 'Eng. Ana Costa'),
('CT-2023-156', (SELECT id FROM public.companies WHERE cnpj = '11.222.333/0001-44'), 'Fornecimento de medicamentos', '2023-03-01', '2024-02-28', 450000.00, 'Vigente', 'Farm. Maria Santos');

INSERT INTO public.processes (process_number, process_type, company_id, contract_id, responsible, value, status, object) VALUES
('PROC-2024-001', 'Licitação', (SELECT id FROM public.companies WHERE cnpj = '12.345.678/0001-90'), (SELECT id FROM public.contracts WHERE contract_number = 'CT-2024-001'), 'Dr. Carlos Silva', 850000.00, 'Em Andamento', 'Aquisição de equipamentos médicos para o hospital municipal'),
('PROC-2024-002', 'Dispensa', (SELECT id FROM public.companies WHERE cnpj = '98.765.432/0001-10'), (SELECT id FROM public.contracts WHERE contract_number = 'CT-2023-089'), 'Eng. Ana Costa', 120000.00, 'Concluído', 'Manutenção preventiva dos equipamentos hospitalares'),
('PROC-2024-003', 'Pregão', (SELECT id FROM public.companies WHERE cnpj = '11.222.333/0001-44'), (SELECT id FROM public.contracts WHERE contract_number = 'CT-2023-156'), 'Farm. Maria Santos', 75000.00, 'Em Andamento', 'Fornecimento de medicamentos básicos para postos de saúde');

INSERT INTO public.documents (name, type, process_id, upload_date, size, uploaded_by, status) VALUES
('Contrato_MedSupply_2024.pdf', 'Contrato', (SELECT id FROM public.processes WHERE process_number = 'PROC-2024-001'), '2024-01-15', '2.3 MB', 'Maria Silva', 'Aprovado'),
('Termo_Aditivo_HealthCorp.pdf', 'Termo Aditivo', (SELECT id FROM public.processes WHERE process_number = 'PROC-2024-002'), '2024-01-18', '1.8 MB', 'João Santos', 'Pendente'),
('Planilha_Reajuste_BioMed.xlsx', 'Planilha', (SELECT id FROM public.processes WHERE process_number = 'PROC-2024-003'), '2024-01-20', '856 KB', 'Ana Costa', 'Aprovado'),
('Parecer_Juridico_001.docx', 'Parecer', (SELECT id FROM public.processes WHERE process_number = 'PROC-2024-001'), '2024-01-22', '1.2 MB', 'Dr. Carlos Silva', 'Aprovado');