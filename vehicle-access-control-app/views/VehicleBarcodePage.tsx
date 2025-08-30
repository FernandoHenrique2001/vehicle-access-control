
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BarcodeComponent from 'react-barcode'; // Using react-barcode for client-side rendering
import { useVehiclesViewModel } from '../viewModels/useVehiclesViewModel';
import { Vehicle, Barcode as BarcodeType } from '../types';
import { AppRoutes } from '../constants';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import { DownloadIcon, ChevronLeftIcon, AlertTriangleIcon } from '../components/icons';
import Alert from '../components/Alert';

const VehicleBarcodePage: React.FC = () => {
  const { id: vehicleId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchVehicleById, isLoading, error, clearError } = useVehiclesViewModel();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [barcode, setBarcode] = useState<BarcodeType | null>(null);
  const barcodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vehicleId) {
      const loadData = async () => {
        clearError();
        const fetchedVehicle = await fetchVehicleById(vehicleId);
        if (fetchedVehicle) {
          setVehicle(fetchedVehicle);
          if (fetchedVehicle.barcode) {
            setBarcode(fetchedVehicle.barcode);
          } else {
            // If vehicle exists but no barcode, this is an issue.
            // The UI on VehiclesPage should prevent navigating here if no barcode.
            // But handle defensively.
            setBarcode(null); 
          }
        } else {
          // Error is handled by viewmodel and displayed below
        }
      };
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const handleDownload = () => {
    // This is a simplified download of the SVG. For robust image download, canvas conversion might be needed.
    if (barcodeRef.current) {
      const svgElement = barcodeRef.current.querySelector('svg');
      if (svgElement) {
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `barcode-${vehicle?.license || vehicleId}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Carregando dados do código de barras...</p>
      </div>
    );
  }

  if (error && !vehicle) { // Show error prominently if vehicle data couldn't be loaded
    return (
      <div className="container mx-auto p-6">
          <Button onClick={() => navigate(AppRoutes.VEHICLES)} leftIcon={<ChevronLeftIcon />} variant="ghost" className="mb-4">
            Voltar para Veículos
          </Button>
          <Alert type="error" message={`Erro ao carregar dados do veículo: ${error}`} />
      </div>
    );
  }
  
  if (!vehicle) { // Should ideally be caught by error state, but as a fallback
      return (
          <div className="container mx-auto p-6">
              <Button onClick={() => navigate(AppRoutes.VEHICLES)} leftIcon={<ChevronLeftIcon />} variant="ghost" className="mb-4">
                Voltar para Veículos
              </Button>
              <Alert type="warning" message="Veículo não encontrado." />
          </div>
      );
  }
  
  if (!barcode || !barcode.code) {
      return (
          <div className="container mx-auto p-6">
              <PageHeader title={`Código de Barras para ${vehicle.license}`} />
              <Button onClick={() => navigate(AppRoutes.VEHICLES)} leftIcon={<ChevronLeftIcon />} variant="ghost" className="mb-4">
                Voltar para Veículos
              </Button>
              <Alert type="warning" message="Este veículo não possui um código de barras gerado ou o código é inválido." />
              {/* Optionally, add a button to generate barcode here if desired */}
          </div>
      );
  }


  return (
    <div className="container mx-auto">
      <PageHeader title={`Código de Barras: ${vehicle?.license || 'Veículo'}`} actions={
          <Button onClick={() => navigate(AppRoutes.VEHICLES)} leftIcon={<ChevronLeftIcon />} variant="outline">
            Voltar para Veículos
          </Button>
      }/>
      
      {error && <Alert type="error" message={error} onClose={clearError} />}

      <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg mx-auto text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Veículo: {vehicle.license}</h2>
        <p className="text-sm text-gray-600 mb-1">Proprietário: {vehicle.userName || 'N/A'}</p>
        <p className="text-sm text-gray-600 mb-6">Código: <span className="font-mono">{barcode.code}</span></p>
        
        <div ref={barcodeRef} className="my-6 flex justify-center">
          {/* react-barcode uses SVG by default, corrected prop name */}
          <BarcodeComponent value={barcode.code} width={2} height={100} fontOptions="bold" />
        </div>

        <Button onClick={handleDownload} leftIcon={<DownloadIcon />} className="w-full md:w-auto">
          Download Código de Barras (SVG)
        </Button>
        <p className="mt-4 text-xs text-gray-500">
          O código de barras é gerado no formato CODE128.
        </p>
      </div>
    </div>
  );
};

export default VehicleBarcodePage;
