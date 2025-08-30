
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../viewModels/useAuthViewModel';
import { AppRoutes } from '../constants';
import FormInput from '../components/forms/FormInput';
import Button from '../components/Button';
import { BarcodeIcon } from '../components/icons';
import Alert from '../components/Alert';


const LoginPage: React.FC = () => {
  const [cpf, setCpf] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login, isLoading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(AppRoutes.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);
  
  // Clear error when component mounts or cpf/password changes
  useEffect(() => {
    return () => {
      clearError(); // Clear error on unmount
    };
  }, [clearError]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear previous errors
    if (!cpf || !password) {
        // This should be handled by form validation or specific error from useAuth
        // For now, we let useAuth handle it if backend validation fails.
    }
    await login(cpf, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 bg-primary rounded-full text-white mb-6">
             <BarcodeIcon size={32} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Acessar Sistema
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Controle de Acesso Veicular
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} onClose={clearError} />}
          <FormInput
            id="cpf"
            label="CPF"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Seu CPF (ex: 701.226.686-42)"
            required
          />
          <FormInput
            id="password"
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua Senha (ex: 123456)"
            required
          />
          <div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>
        </form>
         <p className="mt-4 text-center text-xs text-gray-500">
            Use CPF: <code>701.226.686-42</code> e Senha: <code>123456</code> para teste.
          </p>
      </div>
    </div>
  );
};

export default LoginPage;
