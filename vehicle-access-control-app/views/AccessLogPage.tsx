import React, { useEffect, useState, useCallback } from 'react';
import { useAccessLogViewModel } from '../viewModels/useAccessLogViewModel';
import { Entry } from '../types';
import Table from '../components/Table';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import FormInput from '../components/forms/FormInput';
import Button from '../components/Button';
import { FilterIcon } from '../components/icons';

const AccessLogPage: React.FC = () => {
  const { entries, isLoading, error, fetchEntries, clearMessages } = useAccessLogViewModel();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadEntries = useCallback(() => {
    const filters = (startDate && endDate) ? { startDate, endDate } : undefined;
    fetchEntries(filters);
  }, [startDate, endDate, fetchEntries]);

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial load

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEntries();
  };
  
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    // After clearing, fetch all entries (or whatever default logic is)
    // Need to pass undefined or {} to fetchEntries to signify no filters
    fetchEntries(); 
  };

  const columns = [
    { header: 'Placa Veículo', accessor: 'vehicleLicense' as keyof Entry, className: 'font-mono' },
    { header: 'Cód. Barras', accessor: 'barcodeCode' as keyof Entry, className: 'font-mono text-xs' },
    { header: 'Entrada', accessor: (item: Entry) => new Date(item.entryTime).toLocaleString() },
    { 
      header: 'Saída', 
      accessor: (item: Entry) => (
        item.exitTime 
          ? new Date(item.exitTime).toLocaleString() 
          : <span className="text-orange-500 font-semibold">PENDENTE</span>
      )
    },
    { header: 'Status', accessor: (item: Entry) => item.exitTime 
        ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">SAÍDA</span>
        : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">ENTRADA</span>
    }
  ];

  return (
    <div className="container mx-auto">
      <PageHeader title="Registros de Acesso" />

      {error && <Alert type="error" message={error} onClose={clearMessages} />}
      
      <form onSubmit={handleFilterSubmit} className="mb-6 p-4 bg-white shadow rounded-lg flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 min-w-0">
          <FormInput
            label="Data Início"
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1 min-w-0">
          <FormInput
            label="Data Fim"
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex space-x-2">
          <Button type="submit" leftIcon={<FilterIcon size={18} />} isLoading={isLoading}>
            Filtrar
          </Button>
           <Button type="button" variant="ghost" onClick={handleClearFilters} disabled={isLoading}>
            Limpar Filtros
          </Button>
        </div>
      </form>

      <Table<Entry>
        columns={columns}
        data={entries}
        isLoading={isLoading}
        emptyStateMessage="Nenhum registro de acesso encontrado para os filtros aplicados."
      />
    </div>
  );
};

export default AccessLogPage;