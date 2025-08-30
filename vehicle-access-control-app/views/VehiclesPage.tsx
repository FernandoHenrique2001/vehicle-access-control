
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehiclesViewModel } from '../viewModels/useVehiclesViewModel';
import { Vehicle, ModalAction, SelectOption } from '../types';
import { AppRoutes } from '../constants';
import Table from '../components/Table';
import Button from '../components/Button';
import Modal from '../components/Modal';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import PageHeader from '../components/PageHeader';
import { PlusCircleIcon, EditIcon, TrashIcon, BarcodeIcon, EyeIcon } from '../components/icons';
import Alert from '../components/Alert';

const VehiclesPage: React.FC = () => {
  const { 
    vehicles, isLoading, error, userOptions, 
    fetchVehicles, addVehicle, updateVehicle, deleteVehicle, 
    generateBarcode, fetchUsersForSelect, clearError, setErrorManually 
  } = useVehiclesViewModel();
  
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ModalAction>(ModalAction.CREATE);
  const [currentVehicle, setCurrentVehicle] = useState<Partial<Vehicle> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
    fetchUsersForSelect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (action: ModalAction, vehicle?: Vehicle) => {
    setModalAction(action);
    setCurrentVehicle(vehicle || { license: '', userId: '' });
    setIsModalOpen(true);
    setFormError(null);
    clearError();
    setSuccessMessage(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentVehicle(null);
    setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!currentVehicle?.license?.trim()) {
      setFormError("A placa é obrigatória.");
      return false;
    }
    // Basic license plate format (Brazilian Mercosul or old)
    const licenseRegex = /^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/i;
    if (!licenseRegex.test(currentVehicle.license)) {
      setFormError("Formato de placa inválido.");
      return false;
    }
    if (!currentVehicle?.userId) {
      setFormError("O proprietário (usuário) é obrigatório.");
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentVehicle || !validateForm()) return;

    let success = false;
    const vehicleData = {
      license: currentVehicle.license!.trim().toUpperCase(),
      userId: currentVehicle.userId!,
    };

    if (modalAction === ModalAction.CREATE) {
      const result = await addVehicle(vehicleData);
      if(result) success = true;
      if(success) setSuccessMessage("Veículo criado com sucesso!");
    } else if (modalAction === ModalAction.EDIT && currentVehicle.id) {
      const result = await updateVehicle(currentVehicle.id, vehicleData);
      if(result) success = true;
      if(success) setSuccessMessage("Veículo atualizado com sucesso!");
    }

    if (success) {
      handleCloseModal();
      fetchVehicles(); // Refresh list
      setTimeout(() => setSuccessMessage(null), 3000);
    } else if (!error) {
      setErrorManually(formError || "Ocorreu um erro ao salvar o veículo.");
    }
  };

  const handleDelete = async (vehicleId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      const success = await deleteVehicle(vehicleId);
      if (success) {
        setSuccessMessage("Veículo excluído com sucesso!");
        fetchVehicles(); // Refresh list
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };
  
  const handleGenerateBarcode = async (vehicleId: string) => {
    const newBarcode = await generateBarcode(vehicleId);
    if (newBarcode) {
      setSuccessMessage(`Código de barras gerado: ${newBarcode.code}`);
      fetchVehicles(); // Refresh to show updated barcode status
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const columns = [
    { header: 'Placa', accessor: 'license' as keyof Vehicle, className: 'font-mono font-medium text-gray-900' },
    { header: 'Proprietário', accessor: 'userName' as keyof Vehicle },
    { header: 'Cód. Barras', accessor: (item: Vehicle) => item.barcode ? item.barcode.code : 'N/A', className: 'font-mono text-xs' },
    { header: 'Criado em', accessor: (item: Vehicle) => new Date(item.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="container mx-auto">
      <PageHeader title="Gerenciamento de Veículos" actions={
        <Button onClick={() => handleOpenModal(ModalAction.CREATE)} leftIcon={<PlusCircleIcon size={20} />}>
          Novo Veículo
        </Button>
      }/>

      {error && <Alert type="error" message={error} onClose={clearError} />}
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} />}

      <Table<Vehicle>
        columns={columns}
        data={vehicles}
        isLoading={isLoading}
        renderRowActions={(vehicle) => (
          <div className="space-x-1 flex justify-end items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(AppRoutes.VEHICLE_BARCODE.replace(':id', vehicle.id))} 
              title="Ver Código de Barras"
              disabled={!vehicle.barcode}
              className={!vehicle.barcode ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <EyeIcon />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleGenerateBarcode(vehicle.id)} 
              title={vehicle.barcode ? "Regerar Código de Barras" : "Gerar Código de Barras"}
            >
              <BarcodeIcon />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(ModalAction.EDIT, vehicle)} title="Editar">
              <EditIcon />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(vehicle.id)} className="text-red-500 hover:text-red-700" title="Excluir">
              <TrashIcon />
            </Button>
          </div>
        )}
      />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalAction === ModalAction.CREATE ? 'Novo Veículo' : 'Editar Veículo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert type="error" message={formError} onClose={() => setFormError(null)} />}
          <FormInput
            label="Placa do Veículo"
            id="license"
            value={currentVehicle?.license || ''}
            onChange={(e) => setCurrentVehicle({ ...currentVehicle, license: e.target.value.toUpperCase() })}
            placeholder="ABC1D23 ou ABC-1234"
            required
          />
          <FormSelect
            label="Proprietário (Usuário)"
            id="userId"
            value={currentVehicle?.userId || ''}
            onChange={(e) => setCurrentVehicle({ ...currentVehicle, userId: e.target.value })}
            options={userOptions}
            required
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {modalAction === ModalAction.CREATE ? 'Criar Veículo' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VehiclesPage;
