
import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useDashboardViewModel } from '../viewModels/useDashboardViewModel';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import { UsersIcon, CarIcon, ListIcon, ScanLineIcon, FilterIcon, ClockIcon } from '../components/icons'; // Added ClockIcon
import FormInput from '../components/forms/FormInput';
import Button from '../components/Button';

const StatCard: React.FC<{ title: string; value: string | number; subValue?: string; icon: React.ReactNode; color: string }> = ({ title, value, subValue, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 transform hover:scale-105 transition-transform duration-200">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
    </div>
  </div>
);

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB'];

const getHeatmapColor = (value: number, maxValue: number): string => {
  if (value === 0 || maxValue === 0) return 'bg-gray-100'; // Very light for no activity
  const intensity = Math.min(1, value / (maxValue * 0.8)); // Scale intensity, avoid pure white for small values
  // Using Tailwind shades directly requires JIT or pre-configuration for dynamic classes.
  // Let's use a few fixed shades for simplicity or inline styles.
  if (intensity > 0.75) return 'bg-blue-600 text-white';
  if (intensity > 0.5) return 'bg-blue-500 text-white';
  if (intensity > 0.25) return 'bg-blue-300 text-blue-800';
  if (intensity > 0) return 'bg-blue-100 text-blue-700';
  return 'bg-gray-50 text-gray-600'; // Cells with very low activity relative to max
};


const DashboardPage: React.FC = () => {
  const {
    totalVehicles, totalUsers, currentEntries, recentEntriesToday, dailyAccessCounts,
    totalAccessesInPeriod, lastAccess, vehicleAccessDistribution, accessHeatmapGrid,
    isLoading, error, loadDashboardData, clearError
  } = useDashboardViewModel();

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6); 
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const handleFilterSubmit = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (startDate && endDate) {
        loadDashboardData({ startDate, endDate });
    } else {
        loadDashboardData(); 
    }
  }, [loadDashboardData, startDate, endDate]);

  useEffect(() => {
    handleFilterSubmit(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const formattedBarChartData = dailyAccessCounts.map(item => ({
    name: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short'}),
    Acessos: item.count,
  }));

  return (
    <div className="container mx-auto">
      <PageHeader title="Dashboard de Acessos Avançado" />

      {error && <Alert type="error" message={error} onClose={clearError} />}

      {/* Main Filters */}
      <form onSubmit={handleFilterSubmit} className="mb-6 p-4 bg-white shadow rounded-lg flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 min-w-0">
            <FormInput
                label="Data Início" type="date" id="startDate"
                value={startDate} onChange={(e) => setStartDate(e.target.value)}
            />
        </div>
        <div className="flex-1 min-w-0">
            <FormInput
                label="Data Fim" type="date" id="endDate"
                value={endDate} onChange={(e) => setEndDate(e.target.value)}
            />
        </div>
        <Button type="submit" leftIcon={<FilterIcon size={18} />} isLoading={isLoading}>
            Aplicar Filtros
        </Button>
      </form>

      {/* Stats Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <StatCard title="Total de Veículos" value={totalVehicles} icon={<CarIcon className="text-white" size={24}/>} color="bg-blue-500" />
        <StatCard title="Total de Usuários" value={totalUsers} icon={<UsersIcon className="text-white" size={24}/>} color="bg-green-500" />
        <StatCard title="Acessos no Período" value={totalAccessesInPeriod} icon={<ListIcon className="text-white" size={24}/>} color="bg-indigo-500" />
      </div>
      {/* Stats Cards Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Veículos Dentro" value={currentEntries} icon={<ScanLineIcon className="text-white" size={24}/>} color="bg-yellow-500" />
        <StatCard title="Acessos Hoje" value={recentEntriesToday} icon={<CarIcon className="text-white" size={24}/>} color="bg-purple-500" />
        <StatCard 
          title="Última Leitura" 
          value={lastAccess ? lastAccess.type : 'N/A'}
          subValue={lastAccess ? `${lastAccess.vehicleLicense} - ${lastAccess.time}` : 'Sem registros no período'}
          icon={<ClockIcon className="text-white" size={24}/>} 
          color="bg-pink-500" 
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart for Daily Accesses */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Acessos Diários no Período</h2>
          {isLoading && <div className="text-center py-10">Carregando gráfico...</div>}
          {!isLoading && formattedBarChartData.length === 0 && !error && (
              <div className="text-center py-10 text-gray-500">Nenhum dado de acesso para o período selecionado.</div>
          )}
          {!isLoading && formattedBarChartData.length > 0 && (
              <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                      <BarChart data={formattedBarChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip wrapperStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '14px' }} />
                      <Bar dataKey="Acessos" fill="#3B82F6" barSize={20} radius={[4, 4, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          )}
        </div>

        {/* Pie Chart for Vehicle Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Distribuição de Acessos por Veículo</h2>
          {isLoading && <div className="text-center py-10">Carregando gráfico...</div>}
          {!isLoading && vehicleAccessDistribution.length === 0 && !error && (
            <div className="text-center py-10 text-gray-500">Sem dados para distribuição.</div>
          )}
          {!isLoading && vehicleAccessDistribution.length > 0 && (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={vehicleAccessDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {vehicleAccessDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Mapa de Calor de Atividade (Dia/Hora)</h2>
        {isLoading && <div className="text-center py-10">Carregando mapa de calor...</div>}
        {!isLoading && accessHeatmapGrid.maxValue === 0 && !error && (
          <div className="text-center py-10 text-gray-500">Sem atividade para exibir no mapa de calor.</div>
        )}
        {!isLoading && accessHeatmapGrid.maxValue > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 text-center">
              <thead>
                <tr>
                  <th className="p-2 border border-gray-300 bg-gray-100 text-xs w-16">Hora</th>
                  {accessHeatmapGrid.days.map(day => (
                    <th key={day} className="p-2 border border-gray-300 bg-gray-100 text-xs">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accessHeatmapGrid.hours.map((hour, hourIndex) => (
                  <tr key={hour}>
                    <td className="p-1.5 border border-gray-300 bg-gray-50 text-xs font-medium w-16">{hour}</td>
                    {accessHeatmapGrid.days.map((day, dayIndex) => {
                      const value = accessHeatmapGrid.data[dayIndex][hourIndex];
                      const colorClass = getHeatmapColor(value, accessHeatmapGrid.maxValue);
                      return (
                        <td 
                          key={`${day}-${hour}`} 
                          className={`p-1.5 border border-gray-200 text-xs ${colorClass} transition-colors duration-150`}
                          title={`${value} acessos`}
                        >
                          {value > 0 ? value : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
