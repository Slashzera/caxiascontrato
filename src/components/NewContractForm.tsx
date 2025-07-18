import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NewContractFormProps {
  onContractCreated?: () => void;
  onSuccess?: () => void;
  editData?: any;
}

const NewContractForm = ({ onContractCreated, onSuccess, editData }: NewContractFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [formData, setFormData] = useState({
    contract_number: '',
    company_id: '',
    object: '',
    start_date: '',
    end_date: '',
    value: '',
    fiscal_responsible: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Preencher formulário quando editData for fornecido
  useEffect(() => {
    if (editData) {
      // Formatar o valor para exibição - remover R$ e converter
      let formattedValue = '';
      if (editData.value) {
        const cleanValue = editData.value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
        const numericValue = parseFloat(cleanValue);
        if (!isNaN(numericValue)) {
          formattedValue = numericValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      }

      // Converter datas do formato brasileiro (dd/mm/aaaa) para formato ISO (aaaa-mm-dd)
      const convertDateToISO = (dateStr: string) => {
        if (!dateStr) return '';
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      setFormData({
        contract_number: editData.id || '',
        company_id: editData.company_id || editData.companyId || '',
        object: editData.object || '',
        start_date: convertDateToISO(editData.startDate || ''),
        end_date: convertDateToISO(editData.endDate || ''),
        value: formattedValue,
        fiscal_responsible: editData.fiscalResponsible || ''
      });
    }
  }, [editData]);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  // Função para formatar valor como moeda brasileira
  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const number = parseInt(numericValue) / 100;
    
    // Formata como moeda brasileira
    return number.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para converter valor formatado de volta para número
  const parseCurrencyToNumber = (formattedValue: string) => {
    return parseFloat(formattedValue.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatCurrency(inputValue);
    setFormData({ ...formData, value: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const contractData = {
        ...formData,
        value: parseCurrencyToNumber(formData.value)
      };

      if (editData) {
        // Modo edição - atualizar contrato existente
        const { error } = await supabase
          .from('contracts')
          .update(contractData)
          .eq('id', editData.contractId);

        if (error) throw error;

        toast({
          title: "Contrato atualizado com sucesso",
          description: "As informações do contrato foram atualizadas",
        });
      } else {
        // Modo criação - inserir novo contrato
        const { error } = await supabase
          .from('contracts')
          .insert([contractData]);

        if (error) throw error;

        toast({
          title: "Contrato criado com sucesso",
          description: "O novo contrato foi adicionado ao sistema",
        });
      }

      // Resetar formulário apenas se não estiver editando
      if (!editData) {
        setFormData({
          contract_number: '',
          company_id: '',
          object: '',
          start_date: '',
          end_date: '',
          value: '',
          fiscal_responsible: ''
        });
      }

      setIsOpen(false);
      
      // Chamar callback apropriado
      if (onSuccess) {
        onSuccess();
      } else if (onContractCreated) {
        onContractCreated();
      }
    } catch (error) {
      console.error('Error saving contract:', error);
      toast({
        title: editData ? "Erro ao atualizar contrato" : "Erro ao criar contrato",
        description: editData ? "Não foi possível atualizar o contrato" : "Não foi possível criar o contrato",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se editData for fornecido, renderizar apenas o formulário (sem Dialog)
  if (editData) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contract_number">Número do Contrato*</Label>
            <Input
              id="contract_number"
              value={formData.contract_number}
              onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
              placeholder="2024/001"
              required
            />
          </div>
          <div>
            <Label htmlFor="company_id">Empresa*</Label>
            <Select 
              value={formData.company_id} 
              onValueChange={(value) => setFormData({ ...formData, company_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company: any) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="object">Objeto do Contrato*</Label>
          <Textarea
            id="object"
            value={formData.object}
            onChange={(e) => setFormData({ ...formData, object: e.target.value })}
            placeholder="Descrição do objeto do contrato"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Data de Início*</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="end_date">Data de Fim*</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="value">Valor*</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                R$
              </span>
              <Input
                id="value"
                type="text"
                value={formData.value}
                onChange={handleValueChange}
                placeholder="0,00"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="fiscal_responsible">Fiscal Responsável</Label>
            <Input
              id="fiscal_responsible"
              value={formData.fiscal_responsible}
              onChange={(e) => setFormData({ ...formData, fiscal_responsible: e.target.value })}
              placeholder="Nome do fiscal"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Atualizar Contrato'}
          </Button>
        </div>
      </form>
    );
  }

  // Renderização normal com Dialog para criação
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Building2 className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Contrato</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract_number">Número do Contrato*</Label>
              <Input
                id="contract_number"
                value={formData.contract_number}
                onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                placeholder="2024/001"
                required
              />
            </div>
            <div>
              <Label htmlFor="company_id">Empresa*</Label>
              <Select 
                value={formData.company_id} 
                onValueChange={(value) => setFormData({ ...formData, company_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company: any) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="object">Objeto do Contrato*</Label>
            <Textarea
              id="object"
              value={formData.object}
              onChange={(e) => setFormData({ ...formData, object: e.target.value })}
              placeholder="Descrição do objeto do contrato"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início*</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_date">Data de Fim*</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value">Valor*</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  R$
                </span>
                <Input
                  id="value"
                  type="text"
                  value={formData.value}
                  onChange={handleValueChange}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="fiscal_responsible">Fiscal Responsável</Label>
              <Input
                id="fiscal_responsible"
                value={formData.fiscal_responsible}
                onChange={(e) => setFormData({ ...formData, fiscal_responsible: e.target.value })}
                placeholder="Nome do fiscal"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Contrato'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewContractForm;