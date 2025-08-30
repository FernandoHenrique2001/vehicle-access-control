
import React, { useState, useEffect } from 'react';
import { useAccessLogViewModel } from '../viewModels/useAccessLogViewModel';
import PageHeader from '../components/PageHeader';
import FormInput from '../components/forms/FormInput';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { ScanLineIcon } from '../components/icons';

const GatehousePage: React.FC = () => {
  const { scanBarcode, isLoading, scanError, scanSuccessMessage, clearMessages } = useAccessLogViewModel();
  const [barcodeInput, setBarcodeInput] = useState('');

  useEffect(() => {
    // Clear messages when component mounts or unmounts
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) {
      // ViewModel's scanError will handle empty/invalid barcode from API
      // but can add client-side check too if needed
      return;
    }
    await scanBarcode(barcodeInput.trim());
    setBarcodeInput(''); // Clear input after submission
  };

  return (
    <div className="container mx-auto">
      <PageHeader title="Portaria - Registrar Acesso" />

      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-xl">
        <div className="flex justify-center mb-6">
          <ScanLineIcon size={64} className="text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-center text-gray-700 mb-2">Escanear Código de Barras</h2>
        <p className="text-sm text-gray-500 text-center mb-1">
          Digite o código de barras do veículo para registrar entrada ou saída.
        </p>
        <p className="text-xs text-gray-600 text-center mb-6">
          Ao escanear, o sistema automaticamente registra uma ENTRADA se o veículo não estiver presente, ou uma SAÍDA se o veículo já possuir um registro de entrada ativo.
        </p>
        
        {scanError && <Alert type="error" message={scanError} onClose={clearMessages} />}
        {scanSuccessMessage && <Alert type="success" message={scanSuccessMessage} onClose={clearMessages} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Código de Barras"
            id="barcode"
            value={barcodeInput}
            onChange={(e) => {
              setBarcodeInput(e.target.value);
              if (scanError || scanSuccessMessage) clearMessages(); // Clear messages on new input
            }}
            placeholder="Insira ou escaneie o código de barras"
            required
            autoFocus
          />
          <Button type="submit" isLoading={isLoading} className="w-full">
            {isLoading ? 'Processando...' : 'Registrar Acesso'}
          </Button>
        </form>
         <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
          <p className="font-semibold mb-1">Códigos de teste (veja em Veículos):</p>
          <ul className="list-disc list-inside">
            <li>Use um código válido para registrar entrada/saída.</li>
            <li>Ex: <code>VEHICLE1BARCODE</code> (se gerado para ABC-1234)</li>
             <li>Ex: <code>XYZ7890BARCODE</code> (se gerado para XYZ-7890)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GatehousePage;
