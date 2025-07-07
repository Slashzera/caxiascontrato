
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Calculator, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProcessMeasurementsProps {
  process: any;
  onBack: () => void;
}

const ProcessMeasurements = ({ process, onBack }: ProcessMeasurementsProps) => {
  const [measurements, setMeasurements] = useState<{[key: number]: string[]}>(() => {
    const initialMeasurements: {[key: number]: string[]} = {};
    for (let i = 0; i < 12; i++) {
      initialMeasurements[i] = [''];
    }
    return initialMeasurements;
  });
  const [totalBalance, setTotalBalance] = useState('');
  const [globalValue, setGlobalValue] = useState('');
  const [ceilingValue, setCeilingValue] = useState('');

  const handleMeasurementChange = (measurementIndex: number, fieldIndex: number, value: string) => {
    setMeasurements(prev => ({
      ...prev,
      [measurementIndex]: prev[measurementIndex].map((field, idx) => 
        idx === fieldIndex ? value : field
      )
    }));
  };

  const addFieldToMeasurement = (measurementIndex: number) => {
    setMeasurements(prev => ({
      ...prev,
      [measurementIndex]: [...prev[measurementIndex], '']
    }));
  };

  const removeFieldFromMeasurement = (measurementIndex: number, fieldIndex: number) => {
    if (measurements[measurementIndex].length > 1) {
      setMeasurements(prev => ({
        ...prev,
        [measurementIndex]: prev[measurementIndex].filter((_, idx) => idx !== fieldIndex)
      }));
    }
  };

  const calculateTotal = () => {
    let total = 0;
    Object.values(measurements).forEach(measurementFields => {
      measurementFields.forEach(field => {
        if (field && !isNaN(parseFloat(field.replace(',', '.')))) {
          total += parseFloat(field.replace(',', '.'));
        }
      });
    });
    
    setTotalBalance(total.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }));
    
    toast({
      title: "Total calculado!",
      description: `Saldo total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    });
  };

  const handleSave = async () => {
    try {
      // Save measurements to database
      const measurementData = [];
      Object.entries(measurements).forEach(([measurementIndex, fields]) => {
        fields.forEach((field, fieldIndex) => {
          if (field && !isNaN(parseFloat(field.replace(',', '.')))) {
            measurementData.push({
              process_id: process.id, // You'll need to pass the actual process ID
              measurement_index: parseInt(measurementIndex),
              field_index: fieldIndex,
              value: parseFloat(field.replace(',', '.'))
            });
          }
        });
      });

      if (measurementData.length > 0) {
        const { error } = await supabase
          .from('process_measurements')
          .upsert(measurementData);

        if (error) throw error;
      }

      // Update global and ceiling values
      if (globalValue || ceilingValue) {
        const updateData: any = {};
        if (globalValue) updateData.global_value = parseFloat(globalValue.replace(/[^\d,]/g, '').replace(',', '.'));
        if (ceilingValue) updateData.ceiling_value = parseFloat(ceilingValue.replace(/[^\d,]/g, '').replace(',', '.'));

        const { error } = await supabase
          .from('processes')
          .update(updateData)
          .eq('process_number', process.number);

        if (error) throw error;
      }

      toast({
        title: "Medições salvas!",
        description: "As medições foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Error saving measurements:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as medições",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Medições do Processo</h1>
            <p className="text-gray-600">{process.number} - {process.type}</p>
          </div>
        </div>
      </div>

      {/* Process Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Processo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Empresa:</span>
              <p className="font-medium">{process.company}</p>
            </div>
            <div>
              <span className="text-gray-500">Responsável:</span>
              <p className="font-medium">{process.responsible}</p>
            </div>
            <div>
              <span className="text-gray-500">Valor:</span>
              <p className="font-medium">{process.value}</p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <p className="font-medium">{process.status}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <span className="text-gray-500">Objeto:</span>
            <p className="font-medium">{process.object}</p>
          </div>

          {/* Novos campos: Valor Global e Valor Teto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t">
            <div>
              <Label htmlFor="global-value" className="text-sm font-semibold text-gray-700">
                Valor Global
              </Label>
              <Input
                id="global-value"
                type="text"
                value={globalValue}
                onChange={(e) => setGlobalValue(e.target.value)}
                placeholder="R$ 0,00"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="ceiling-value" className="text-sm font-semibold text-gray-700">
                Valor Teto
              </Label>
              <Input
                id="ceiling-value"
                type="text"
                value={ceilingValue}
                onChange={(e) => setCeilingValue(e.target.value)}
                placeholder="R$ 0,00"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Medições
            <Button onClick={calculateTotal} variant="outline" size="sm">
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Total
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(measurements).map(([measurementIndex, fields]) => (
              <div key={measurementIndex} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">
                    Medição {Number(measurementIndex) + 1}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addFieldToMeasurement(Number(measurementIndex))}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className="flex gap-1">
                      <Input
                        type="text"
                        value={field}
                        onChange={(e) => handleMeasurementChange(Number(measurementIndex), fieldIndex, e.target.value)}
                        placeholder="R$ 0,00"
                        className="flex-1"
                      />
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFieldFromMeasurement(Number(measurementIndex), fieldIndex)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="max-w-sm">
              <Label htmlFor="total-balance" className="text-lg font-semibold">
                Saldo Total
              </Label>
              <Input
                id="total-balance"
                type="text"
                value={totalBalance}
                onChange={(e) => setTotalBalance(e.target.value)}
                placeholder="R$ 0,00"
                className="mt-2 text-lg font-bold"
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Medições
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessMeasurements;
