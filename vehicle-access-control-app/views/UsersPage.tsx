import React, { useEffect, useState, useCallback } from "react";
import { useUsersViewModel } from "../viewModels/useUsersViewModel";
import { User, ModalAction } from "../types";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import FormInput from "../components/forms/FormInput";
import FormSelect from "../components/forms/FormSelect";
import PageHeader from "../components/PageHeader";
import {
  PlusCircleIcon,
  EditIcon,
  TrashIcon,
  UserIcon,
  ShieldCheckIcon,
} from "../components/icons";
import Alert from "../components/Alert";

const UsersPage: React.FC = () => {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    addUser,
    updateUser,
    deleteUser,
    clearError,
    setErrorManually,
  } = useUsersViewModel();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState<ModalAction>(
    ModalAction.CREATE
  );
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenModal = (action: ModalAction, user?: User) => {
    setModalAction(action);
    setCurrentUser(user || { name: "", cpf: "", type: "USER" });
    setIsModalOpen(true);
    setFormError(null); // Clear form error when opening modal
    clearError(); // Clear global error from ViewModel
    setSuccessMessage(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!currentUser?.name?.trim()) {
      setFormError("O nome é obrigatório.");
      return false;
    }
    if (!currentUser?.cpf?.trim()) {
      setFormError("O CPF é obrigatório.");
      return false;
    }
    // Basic CPF format validation (xxx.xxx.xxx-xx)
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(currentUser.cpf)) {
      setFormError("Formato de CPF inválido. Use xxx.xxx.xxx-xx");
      return false;
    }
    // Se for ADMIN, a senha é obrigatória
    if (
      currentUser.type === "ADMIN" &&
      (!currentUser.password || currentUser.password.trim() === "")
    ) {
      setFormError("Usuários ADMIN devem ter uma senha.");
      return false;
    }
    // Se for USER, não deve ter senha
    if (
      currentUser.type === "USER" &&
      currentUser.password &&
      currentUser.password.trim() !== ""
    ) {
      setFormError("Usuários comuns não devem ter senha.");
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !validateForm()) return;

    let success = false;
    if (modalAction === ModalAction.CREATE) {
      const userData = {
        name: currentUser.name!,
        cpf: currentUser.cpf!,
        password:
          currentUser.type === "ADMIN" ? currentUser.password : undefined,
      };
      const result = await addUser(userData);
      if (result) success = true;
      if (success) setSuccessMessage("Usuário criado com sucesso!");
    } else if (modalAction === ModalAction.EDIT && currentUser.id) {
      const userData = {
        name: currentUser.name!,
        cpf: currentUser.cpf!,
        password:
          currentUser.type === "ADMIN" ? currentUser.password : undefined,
      };
      const result = await updateUser(currentUser.id, userData);
      if (result) success = true;
      if (success) setSuccessMessage("Usuário atualizado com sucesso!");
    }

    if (success) {
      handleCloseModal();
      fetchUsers(); // Refresh list
      setTimeout(() => setSuccessMessage(null), 3000);
    } else if (!error) {
      // If ViewModel error is not set, set a generic one based on formError
      setErrorManually(formError || "Ocorreu um erro ao salvar o usuário.");
    }
  };

  const handleDelete = async (userId: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
      )
    ) {
      const success = await deleteUser(userId);
      if (success) {
        setSuccessMessage("Usuário excluído com sucesso!");
        fetchUsers(); // Refresh list
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // Error is handled by ViewModel
      }
    }
  };

  const handleTypeChange = (newType: string) => {
    setCurrentUser((prev) => ({
      ...prev,
      type: newType,
      password: newType === "USER" ? "" : prev?.password || "",
    }));
  };

  // Separar usuários por tipo
  const adminUsers = users.filter(
    (user) => user.type === "ADMIN" || user.password
  );
  const commonUsers = users.filter(
    (user) => user.type === "USER" && !user.password
  );

  const columns = [
    {
      header: "Nome",
      accessor: "name" as keyof User,
      className: "font-medium text-gray-900",
    },
    { header: "CPF", accessor: "cpf" as keyof User },
    {
      header: "Tipo",
      accessor: (item: User) =>
        item.type === "ADMIN" ? "Administrador" : "Usuário Comum",
    },
    {
      header: "Data de Criação",
      accessor: (item: User) => new Date(item.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Gerenciamento de Usuários"
        actions={
          <Button
            onClick={() => handleOpenModal(ModalAction.CREATE)}
            leftIcon={<PlusCircleIcon size={20} />}
          >
            Novo Usuário
          </Button>
        }
      />

      {error && <Alert type="error" message={error} onClose={clearError} />}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {/* Seção de Usuários Administradores */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <ShieldCheckIcon size={24} className="text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Usuários Administradores
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {adminUsers.length}
          </span>
        </div>
        <p className="text-gray-600 mb-4">
          Estes usuários possuem senha e podem acessar o sistema de controle.
        </p>

        <Table<User>
          columns={columns}
          data={adminUsers}
          isLoading={isLoading}
          renderRowActions={(user) => (
            <div className="space-x-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenModal(ModalAction.EDIT, user)}
                aria-label="Editar"
              >
                <EditIcon />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(user.id)}
                className="text-red-500 hover:text-red-700"
                aria-label="Excluir"
              >
                <TrashIcon />
              </Button>
            </div>
          )}
        />
      </div>

      {/* Seção de Usuários Comuns */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 mb-4">
          <UserIcon size={24} className="text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Usuários Comuns
          </h2>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {commonUsers.length}
          </span>
        </div>
        <p className="text-gray-600 mb-4">
          Estes usuários são apenas registrados no sistema e não possuem acesso
          ao portal.
        </p>

        <Table<User>
          columns={columns}
          data={commonUsers}
          isLoading={isLoading}
          renderRowActions={(user) => (
            <div className="space-x-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenModal(ModalAction.EDIT, user)}
                aria-label="Editar"
              >
                <EditIcon />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(user.id)}
                className="text-red-500 hover:text-red-700"
                aria-label="Excluir"
              >
                <TrashIcon />
              </Button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          modalAction === ModalAction.CREATE ? "Novo Usuário" : "Editar Usuário"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <Alert
              type="error"
              message={formError}
              onClose={() => setFormError(null)}
            />
          )}

          <FormInput
            label="Nome Completo"
            id="name"
            value={currentUser?.name || ""}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, name: e.target.value })
            }
            required
          />

          <FormInput
            label="CPF"
            id="cpf"
            value={currentUser?.cpf || ""}
            onChange={(e) =>
              setCurrentUser({ ...currentUser, cpf: e.target.value })
            }
            placeholder="000.000.000-00"
            required
          />

          <FormSelect
            label="Tipo de Usuário"
            id="type"
            value={currentUser?.type || "USER"}
            onChange={(e) => handleTypeChange(e.target.value)}
            options={[
              { value: "USER", label: "Usuário Comum (Sem acesso ao sistema)" },
              {
                value: "ADMIN",
                label: "Administrador (Com acesso ao sistema)",
              },
            ]}
            required
          />

          {currentUser?.type === "ADMIN" && (
            <FormInput
              label="Senha"
              id="password"
              type="password"
              value={currentUser?.password || ""}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, password: e.target.value })
              }
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {modalAction === ModalAction.CREATE
                ? "Criar Usuário"
                : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
