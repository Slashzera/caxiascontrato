import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface NewCompanyFormProps {
  onCompanyCreated?: () => void;
  onSuccess?: () => void;
  editData?: any;
}

const NewCompanyForm = ({ onCompanyCreated, onSuccess, editData }: NewCompanyFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    contact: '',
    phone: '',
    email: '',
    address: ''
  });

  // Preencher formulário quando editData for fornecido
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        cnpj: editData.cnpj || '',
        contact: editData.contact || '',
        phone: editData.phone || '',
        email: editData.email || '',
        address: editData.address || ''
      });
    }
  }, [editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editData) {
        // Modo edição - atualizar empresa existente
        const { error } = await supabase
          .from('companies')
          .update(formData)
          .eq('id', editData.id);

        if (error) throw error;

        toast({
          title: "Empresa atualizada com sucesso",
          description: "As informações da empresa foram atualizadas",
        });
      } else {
        // Modo criação - inserir nova empresa
        const { error } = await supabase
          .from('companies')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Empresa criada com sucesso",
          description: "A nova empresa foi adicionada ao sistema",
        });
      }

      // Resetar formulário apenas se não estiver editando
      if (!editData) {
        setFormData({
          name: '',
          cnpj: '',
          contact: '',
          phone: '',
          email: '',
          address: ''
        });
      }

      setIsOpen(false);
      
      // Chamar callback apropriado
      if (onSuccess) {
        onSuccess();
      } else if (onCompanyCreated) {
        onCompanyCreated();
      }
    } catch (error) {
      console.error('Error saving company:', error);
      toast({
        title: editData ? "Erro ao atualizar empresa" : "Erro ao criar empresa",
        description: editData ? "Não foi possível atualizar a empresa" : "Não foi possível criar a empresa",
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
            <Label htmlFor="name">Nome da Empresa*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome da empresa"
              required
            />
          </div>
          <div>
            <Label htmlFor="cnpj">CNPJ*</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              placeholder="00.000.000/0000-00"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact">Contato</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="Nome do contato"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@empresa.com"
          />
        </div>
        
        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Endereço completo"
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Atualizar Empresa'}
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
          <Users className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nova Empresa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Empresa*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da empresa"
                required
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ*</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact">Contato</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="Nome do contato"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@empresa.com"
            />
          </div>
          
          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Endereço completo"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar Empresa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewCompanyForm;