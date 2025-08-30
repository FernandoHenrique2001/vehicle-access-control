# Vehicle Access Control API

API backend para o sistema de controle de acesso de veículos, desenvolvida com NestJS e Prisma.

## 🚀 Funcionalidades

- **Autenticação JWT** com estratégias local e JWT
- **Gestão de Usuários** - CRUD completo
- **Gestão de Veículos** - CRUD com vinculação a usuários
- **Códigos de Barras** - Geração automática para veículos
- **Controle de Entrada/Saída** - Registro de acessos via código de barras
- **Dashboard** - Dados estatísticos de acesso
- **Validação de Dados** - DTOs com validação automática
- **Banco de Dados** - PostgreSQL com Prisma ORM

## 🛠️ Tecnologias

- **NestJS** - Framework Node.js
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **class-validator** - Validação de dados

## 📋 Pré-requisitos

- Node.js 18+
- Docker e Docker Compose
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone <repository-url>
cd vehicle-access-control-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/vehicle_access_control"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="1h"

# App
PORT=3000
NODE_ENV=development
```

### 4. Inicie o banco de dados

```bash
docker-compose up -d
```

### 5. Execute as migrações

```bash
npm run db:migrate
```

### 6. Gere o cliente Prisma

```bash
npm run db:generate
```

### 7. Popule o banco com dados iniciais

```bash
npm run db:seed
```

### 8. Inicie a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📚 Endpoints da API

### Autenticação

- `POST /auth/login` - Login de usuário

### Usuários

- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Buscar usuário por ID
- `POST /users` - Criar usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário
- `GET /users/options` - Listar opções de usuários (para selects)

### Veículos

- `GET /vehicles` - Listar todos os veículos
- `GET /vehicles/:id` - Buscar veículo por ID
- `POST /vehicles` - Criar veículo
- `PATCH /vehicles/:id` - Atualizar veículo
- `DELETE /vehicles/:id` - Deletar veículo

### Códigos de Barras

- `POST /barcodes/generate/:vehicleId` - Gerar código de barras para veículo
- `GET /barcodes/vehicle/:vehicleId` - Buscar código de barras por veículo
- `GET /barcodes/code/:code` - Buscar código de barras por código (público)

### Entradas

- `GET /entries` - Listar todas as entradas (com filtros opcionais)
- `POST /entries/scan/:barcodeCode` - Escanear código de barras (público)
- `GET /entries/dashboard` - Dados do dashboard

## 🔐 Autenticação

A API usa JWT para autenticação. Para endpoints protegidos, inclua o header:

```
Authorization: Bearer <token>
```

### Usuário Admin Padrão

- **CPF**: 701.226.686-42
- **Senha**: 123456

## 🗄️ Estrutura do Banco

### Tabelas

- **users** - Usuários do sistema
- **vehicles** - Veículos cadastrados
- **barcodes** - Códigos de barras dos veículos
- **entries** - Registros de entrada/saída

### Relacionamentos

- Um usuário pode ter múltiplos veículos
- Um veículo pode ter um código de barras
- Um código de barras pode ter múltiplas entradas
- Uma entrada está vinculada a um veículo e um código de barras

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 📊 Comandos Úteis

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Abrir Prisma Studio
npm run db:studio

# Seed do banco
npm run db:seed
```

## 🔧 Desenvolvimento

### Estrutura de Pastas

```
src/
├── application/          # Lógica de negócio
│   └── services/        # Serviços da aplicação
├── domain/              # Entidades e regras de domínio
├── infrastructure/      # Implementações externas
│   ├── database/        # Banco de dados
│   └── http/            # Controllers e módulos HTTP
└── main.ts              # Ponto de entrada
```

### Padrões Utilizados

- **Clean Architecture** - Separação de responsabilidades
- **Repository Pattern** - Abstração do acesso a dados
- **DTO Pattern** - Transferência de dados
- **Guard Pattern** - Proteção de rotas

## 🚨 Notas Importantes

1. **Segurança**: Altere o JWT_SECRET em produção
2. **CORS**: Configure as origens permitidas conforme necessário
3. **Validação**: Todos os DTOs são validados automaticamente
4. **Transações**: Operações críticas usam transações do Prisma
5. **Logs**: A API inclui logs para debugging

## 📝 Licença

Este projeto é privado e não possui licença pública.
