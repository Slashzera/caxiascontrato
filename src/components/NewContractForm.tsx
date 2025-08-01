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
    fiscal_responsible: '',
    observations: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Abrir modal e preencher dados quando editData for fornecido
  useEffect(() => {
    if (editData) {
      console.log('EditData recebido:', editData);
      setIsOpen(true);
      
      // Formatar o valor para exibição
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

      // Converter datas do formato brasileiro para ISO
      const convertDateToISO = (dateStr: string) => {
        if (!dateStr) return '';
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      };

      const newFormData = {
        contract_number: editData.id || '',
        company_id: editData.company_id || '',
        object: editData.object || '',
        start_date: convertDateToISO(editData.startDate || ''),
        end_date: convertDateToISO(editData.endDate || ''),
        value: formattedValue,
        fiscal_responsible: editData.fiscalResponsible || '',
        observations: editData.observations || ''
      };

      console.log('FormData que será definido:', newFormData);
      setFormData(newFormData);
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
      console.error('Erro ao buscar empresas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empresas",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return formattedValue;
  };

  const parseCurrencyToNumber = (value: string) => {
    return parseFloat(value.replace(/\./g, '').replace(',', '.')) || 0;
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCurrency(e.target.value);
    setFormData({ ...formData, value: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const numericValue = parseCurrencyToNumber(formData.value);
      
      const contractData = {
        contract_number: formData.contract_number,
        company_id: formData.company_id,
        object: formData.object,
        start_date: formData.start_date,
        end_date: formData.end_date,
        value: numericValue,
        fiscal_responsible: formData.fiscal_responsible,
        observations: formData.observations,
        status: 'active'
      };

      let result;
      if (editData) {
        // Atualizar contrato existente
        result = await supabase
          .from('contracts')
          .update(contractData)
          .eq('id', editData.contractId);
      } else {
        // Criar novo contrato
        result = await supabase
          .from('contracts')
          .insert([contractData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso",
        description: editData ? "Contrato atualizado com sucesso!" : "Contrato criado com sucesso!",
      });

      // Reset form
      setFormData({
        contract_number: '',
        company_id: '',
        object: '',
        start_date: '',
        end_date: '',
        value: '',
        fiscal_responsible: '',
        observations: ''
      });
      
      setIsOpen(false);
      
      if (onContractCreated) onContractCreated();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erro ao salvar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar contrato",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFormData({
      contract_number: '',
      company_id: '',
      object: '',
      start_date: '',
      end_date: '',
      value: '',
      fiscal_responsible: '',
      observations: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!editData && (
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Building2 className="mr-2 h-4 w-4" />
            Novo Contrato
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editData ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contract_number">Número do Contrato*</Label>
              <Input
                id="contract_number"
                value={formData.contract_number}
                onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="company_id">Empresa*</Label>
              <Select
                key={formData.company_id}
                value={formData.company_id}
                onValueChange={(value) => setFormData({ ...formData, company_id: value })}
                required
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
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  id="value"
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

          <div className="col-span-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
              placeholder="Observações adicionais sobre o contrato (opcional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : (editData ? 'Atualizar Contrato' : 'Salvar Contrato')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewContractForm;