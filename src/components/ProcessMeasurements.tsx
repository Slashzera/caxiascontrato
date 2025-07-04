
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Calculator } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ProcessMeasurementsProps {
  process: any;
  onBack: () => void;
}

const ProcessMeasurements = ({ process, onBack }: ProcessMeasurementsProps) => {
  const [measurements, setMeasurements] = useState<string[]>(
    Array(10).fill('').map((_, index) => '')
  );
  const [totalBalance, setTotalBalance] = useState('');

  const handleMeasurementChange = (index: number, value: string) => {
    const newMeasurements = [...measurements];
    newMeasurements[index] = value;
    setMeasurements(newMeasurements);
  };

  const calculateTotal = () => {
    const total = measurements
      .filter(m => m && !isNaN(parseFloat(m.replace(',', '.'))))
      .reduce((sum, m) => sum + parseFloat(m.replace(',', '.')), 0);
    
    setTotalBalance(total.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }));
    
    toast({
      title: "Total calculado!",
      description: `Saldo total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
    });
  };

  const handleSave = () => {
    toast({
      title: "Medições salvas!",
      description: "As medições foram salvas com sucesso.",
    });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {measurements.map((measurement, index) => (
              <div key={index}>
                <Label htmlFor={`measurement-${index}`}>
                  Medição {index + 1}
                </Label>
                <Input
                  id={`measurement-${index}`}
                  type="text"
                  value={measurement}
                  onChange={(e) => handleMeasurementChange(index, e.target.value)}
                  placeholder="R$ 0,00"
                  className="mt-1"
                />
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
